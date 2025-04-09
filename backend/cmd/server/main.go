package main

import (
	"context"
	"net/http"
	"os"

	"github.com/cstanislawski/qualifyd/internal/ws"
	"github.com/cstanislawski/qualifyd/pkg/auth"
	"github.com/cstanislawski/qualifyd/pkg/config"
	"github.com/cstanislawski/qualifyd/pkg/database"
	"github.com/cstanislawski/qualifyd/pkg/handler"
	"github.com/cstanislawski/qualifyd/pkg/k8s"
	"github.com/cstanislawski/qualifyd/pkg/logger"
	localmiddleware "github.com/cstanislawski/qualifyd/pkg/middleware"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/cstanislawski/qualifyd/pkg/repository"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/zerolog"
)

func main() {
	// Initialize logger
	logLevel := os.Getenv("LOG_LEVEL")
	level := zerolog.InfoLevel // Default to info level
	if logLevel != "" {
		switch logLevel {
		case "debug":
			level = zerolog.DebugLevel
		case "info":
			level = zerolog.InfoLevel
		case "warn":
			level = zerolog.WarnLevel
		case "error":
			level = zerolog.ErrorLevel
		}
	}

	logger.Init(
		logger.WithLevel(level),
	)
	log := logger.GlobalLogger // Use the global logger instance instead of creating a new one

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.New(context.Background(), &cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database", err, nil)
	}
	defer db.Close()

	// Get migrations directory
	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	if migrationsDir == "" {
		migrationsDir = "./migrations" // Default migrations directory
	}

	// Run migrations
	migrationService := database.NewMigrationService(db, migrationsDir, log)
	if err := migrationService.MigrateUp(context.Background()); err != nil {
		log.Fatal("Failed to run migrations", err, nil)
	}

	// Initialize Kubernetes client
	var k8sClient *k8s.Client
	namespace := os.Getenv("K8S_NAMESPACE")
	if namespace == "" {
		namespace = "default"
	}
	k8sClient, err = k8s.NewClient(log, namespace)
	if err != nil {
		log.Error("Failed to create Kubernetes client", err, map[string]interface{}{
			"namespace": namespace,
			"error":     err.Error(),
		})
		return
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	orgRepo := repository.NewOrganizationRepository(db)
	taskRepo := repository.NewTaskRepository(db.Pool())
	envRepo := repository.NewEnvironmentRepository(db.Pool())
	assessmentRepo := repository.NewAssessmentRepository(db.Pool())

	// Initialize authentication service
	authService := auth.New(&cfg.JWT)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userRepo, orgRepo, authService, log)
	taskHandler := handler.NewTaskHandler(taskRepo, log)
	envHandler := handler.NewEnvironmentHandler(envRepo, log)
	assessmentHandler := handler.NewAssessmentHandler(assessmentRepo, taskRepo, envRepo, log)
	assessmentTemplateHandler := handler.NewAssessmentTemplateHandler(assessmentRepo, envRepo, taskRepo, log)

	// Initialize websocket hub
	terminalHub := ws.NewTerminalHub()
	terminalHub.K8sClient = k8sClient // Pass the K8s client to the hub
	go terminalHub.Run()

	r := chi.NewRouter()

	// Middleware
	r.Use(localmiddleware.HTTPMiddleware)
	r.Use(middleware.Recoverer)
	r.Use(middleware.AllowContentType("application/json", "text/plain"))
	r.Use(middleware.SetHeader("Content-Type", "application/json"))

	// Enable CORS for the frontend
	r.Use(middleware.SetHeader("Access-Control-Allow-Origin", "*"))
	r.Use(middleware.SetHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"))
	r.Use(middleware.SetHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"))

	// Health check endpoint
	r.Get("/health", healthCheckHandler)

	// API routes
	r.Route("/api", func(r chi.Router) {
		// Authentication API routes
		r.Post("/login", authHandler.Login)
		r.Post("/register", authHandler.Register)
		r.Post("/refresh-token", authHandler.RefreshToken)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(localmiddleware.AuthMiddleware(authService))

			// Organization Management routes (Admin only)
			r.Route("/admin/organizations", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleAdmin))
				// TODO: Add endpoints for managing organizations, users, roles, billing
			})

			// Template Management routes (Template Editor & Admin)
			r.Route("/templates", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleAdmin, model.RoleTemplateEditor))

				// Environment Template endpoints
				r.Route("/environment", func(r chi.Router) {
					// Assuming Org ID might be needed, adjust if context provides it
					// r.Get("/org/{orgId}", envHandler.ListOrganizationEnvironmentTemplates)
					r.Post("/", envHandler.CreateEnvironmentTemplate)
					r.Get("/{id}", envHandler.GetEnvironmentTemplate)
					r.Put("/{id}", envHandler.UpdateEnvironmentTemplate)
					r.Delete("/{id}", envHandler.DeleteEnvironmentTemplate)
				})

				// Task Template endpoints
				r.Route("/task", func(r chi.Router) {
					// Assuming Org ID might be needed
					// r.Get("/org/{orgId}", taskHandler.ListOrganizationTaskTemplates)
					r.Post("/", taskHandler.CreateTaskTemplate)
					r.Get("/{id}", taskHandler.GetTaskTemplate)
					r.Put("/{id}", taskHandler.UpdateTaskTemplate)
					r.Delete("/{id}", taskHandler.DeleteTaskTemplate)
				})

				// Assessment Template endpoints
				r.Route("/assessment", func(r chi.Router) {
					// Assuming Org ID might be needed
					// r.Get("/org/{orgId}", assessmentTemplateHandler.ListOrganizationAssessmentTemplates)
					r.Post("/", assessmentTemplateHandler.CreateAssessmentTemplate)
					r.Get("/{id}", assessmentTemplateHandler.GetAssessmentTemplate)
					r.Put("/{id}", assessmentTemplateHandler.UpdateAssessmentTemplate)
					r.Delete("/{id}", assessmentTemplateHandler.DeleteAssessmentTemplate)
				})
			})

			// Assessment Lifecycle routes (Recruiter & Admin)
			r.Route("/assessments", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleAdmin, model.RoleRecruiter))

				// Org-level view (for recruiter/admin)
				r.Get("/organization/{orgId}", assessmentHandler.GetActiveOrganizationAssessments) // Consider how orgId is passed
				// Create assessment instance
				r.Post("/", assessmentHandler.CreateAssessment)
				// Get assessment (can be used by Recruiter, Reviewer, Admin)
				// This route might need more granular access or be duplicated under Reviewer routes
				r.Get("/{id}", assessmentHandler.GetAssessment)
			})

			// Assessment Taking routes (Candidate)
			r.Route("/candidate/assessments", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleCandidate))

				r.Get("/", assessmentHandler.GetCandidateAssessments)
				r.Get("/{id}", assessmentHandler.GetAssessment) // Candidate needs to view their specific assessment
				r.Post("/{id}/start", assessmentHandler.StartAssessment)
				r.Post("/{id}/complete", assessmentHandler.CompleteAssessment)
				// WebSocket access should also be implicitly tied to the candidate's assigned assessment
			})

			// Assessment Review routes (Reviewer & Admin)
			r.Route("/review/assessments", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleAdmin, model.RoleReviewer))

				r.Get("/{id}", assessmentHandler.GetAssessment) // Get full details for review
				// TODO: Add endpoints for getting command history, snapshots, adding review comments
			})
		})
	})

	// WebSocket routes
	r.Get("/ws/terminal/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		ws.ServeTerminalWs(terminalHub, w, r, id)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Info("API Server starting", map[string]interface{}{
		"port": port,
	})
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Failed to start server", err, map[string]interface{}{"port": port})
	}
}

// Health check handler
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

// API Handlers - Placeholders until we implement proper handlers

func getTaskTemplatesHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"templates": []}`))
}

func createTaskTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Task template created"}`))
}

func getTaskTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"template": {}}`))
}

func updateTaskTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Task template updated"}`))
}

func deleteTaskTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Task template deleted"}`))
}

func getEnvironmentTemplatesHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"templates": []}`))
}

func createEnvironmentTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Environment template created"}`))
}

func getEnvironmentTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"template": {}}`))
}

func updateEnvironmentTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Environment template updated"}`))
}

func deleteEnvironmentTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Environment template deleted"}`))
}

func getAssessmentTemplatesHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"templates": []}`))
}

func createAssessmentTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Assessment template created"}`))
}

func getAssessmentTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"template": {}}`))
}

func updateAssessmentTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Assessment template updated"}`))
}

func deleteAssessmentTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Assessment template deleted"}`))
}

func getAssessmentsHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"assessments": []}`))
}
