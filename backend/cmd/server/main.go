package main

import (
	"context"
	"fmt"
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
	logger.Init(
		logger.WithLevel(zerolog.InfoLevel),
		logger.WithCaller(true),
	)
	log := &logger.DefaultLogger{} // Create a new default logger

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
	k8sClient, err = k8s.NewClient(
		context.Background(),
		k8s.WithLogger(log),
	)
	if err != nil {
		// Log error but don't exit - continue without K8s capabilities
		fmt.Printf("WARNING: Kubernetes client initialization failed: %v\n", err)
		log.Error("Failed to create Kubernetes client, continuing without Kubernetes capabilities", err, nil)
	} else {
		fmt.Println("Successfully initialized Kubernetes client")
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	orgRepo := repository.NewOrganizationRepository(db)

	// Initialize authentication service
	authService := auth.New(&cfg.JWT)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userRepo, orgRepo, authService, log)

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
				r.Get("/templates", getTemplatesHandler)
				r.Post("/templates", createTemplateHandler)
				r.Get("/evaluations", getEvaluationsHandler)
			})

			// Recruiter API routes
			r.Route("/recruiter", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleRecruiter, model.RoleAdmin))
				// TODO: Add recruiter-specific endpoints
			})

			// Candidate API routes
			r.Route("/candidate", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleCandidate))
				r.Get("/assessments", getAssessmentsHandler)
			})

			// Reviewer API routes
			r.Route("/reviewer", func(r chi.Router) {
				r.Use(localmiddleware.RequireRole(model.RoleReviewer, model.RoleAdmin))
				// TODO: Add reviewer-specific endpoints
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

	fmt.Printf("API Server starting on port %s...\n", port)
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

func getTemplatesHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"templates": []}`))
}

func createTemplateHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "Template created"}`))
}

func getEvaluationsHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"evaluations": []}`))
}

func getAssessmentsHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"assessments": []}`))
}
