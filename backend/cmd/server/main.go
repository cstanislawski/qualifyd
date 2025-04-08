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

	// Get database connection pool for repositories
	dbPool := db.Pool()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	orgRepo := repository.NewOrganizationRepository(db)
	taskRepo := repository.NewTaskRepository(dbPool)
	environmentRepo := repository.NewEnvironmentRepository(dbPool)
	assessmentRepo := repository.NewAssessmentRepository(dbPool)

	// Initialize authentication service
	authService := auth.New(&cfg.JWT)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userRepo, orgRepo, authService, log)
	assessmentHandler := handler.NewAssessmentHandler(assessmentRepo, taskRepo, environmentRepo, log)

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

			// Admin API routes
			r.Route("/admin", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleAdmin))

				// Task templates
				r.Route("/task-templates", func(r chi.Router) {
					r.Get("/", getTaskTemplatesHandler)
					r.Post("/", createTaskTemplateHandler)
					r.Get("/{id}", getTaskTemplateHandler)
					r.Put("/{id}", updateTaskTemplateHandler)
					r.Delete("/{id}", deleteTaskTemplateHandler)
				})

				// Environment templates
				r.Route("/environment-templates", func(r chi.Router) {
					r.Get("/", getEnvironmentTemplatesHandler)
					r.Post("/", createEnvironmentTemplateHandler)
					r.Get("/{id}", getEnvironmentTemplateHandler)
					r.Put("/{id}", updateEnvironmentTemplateHandler)
					r.Delete("/{id}", deleteEnvironmentTemplateHandler)
				})

				// Assessment templates
				r.Route("/assessment-templates", func(r chi.Router) {
					r.Get("/", getAssessmentTemplatesHandler)
					r.Post("/", createAssessmentTemplateHandler)
					r.Get("/{id}", getAssessmentTemplateHandler)
					r.Put("/{id}", updateAssessmentTemplateHandler)
					r.Delete("/{id}", deleteAssessmentTemplateHandler)
				})

				// Organization assessments
				r.Route("/org/{orgId}/assessments", func(r chi.Router) {
					r.Get("/active", assessmentHandler.GetActiveOrganizationAssessments)
				})
			})

			// Recruiter API routes
			r.Route("/recruiter", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleRecruiter, model.RoleAdmin))

				// Assessment management
				r.Route("/assessments", func(r chi.Router) {
					r.Post("/", assessmentHandler.CreateAssessment)
					r.Get("/{id}", assessmentHandler.GetAssessment)
				})
			})

			// Candidate API routes
			r.Route("/candidate", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleCandidate))

				// Assessments
				r.Route("/assessments", func(r chi.Router) {
					r.Get("/", assessmentHandler.GetCandidateAssessments)
					r.Get("/{id}", assessmentHandler.GetAssessment)
					r.Post("/{id}/start", assessmentHandler.StartAssessment)
					r.Post("/{id}/complete", assessmentHandler.CompleteAssessment)
				})
			})

			// Reviewer API routes
			r.Route("/reviewer", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleReviewer, model.RoleAdmin))

				// Assessment review
				r.Route("/assessments", func(r chi.Router) {
					r.Get("/{id}", assessmentHandler.GetAssessment)
				})
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
