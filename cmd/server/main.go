package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/cstanislawski/qualifyd/internal/ws"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Initialize websocket hub
	terminalHub := ws.NewTerminalHub()
	go terminalHub.Run()

	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(middleware.SetHeader("Content-Type", "application/json"))

	// Enable CORS for the frontend
	r.Use(middleware.SetHeader("Access-Control-Allow-Origin", "*"))
	r.Use(middleware.SetHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"))
	r.Use(middleware.SetHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"))

	// API routes
	r.Route("/api", func(r chi.Router) {
		// Admin API routes
		r.Route("/admin", func(r chi.Router) {
			r.Get("/templates", getTemplatesHandler)
			r.Post("/templates", createTemplateHandler)
			r.Get("/evaluations", getEvaluationsHandler)
		})

		// Candidate API routes
		r.Route("/candidate", func(r chi.Router) {
			r.Get("/assessments", getAssessmentsHandler)
		})

		// Authentication API routes
		r.Post("/login", apiLoginHandler)
		r.Post("/register", apiRegisterHandler)
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
	log.Fatal(http.ListenAndServe(":"+port, r))
}

// API Handlers

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

func apiLoginHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "token": "sample-token"}`))
}

func apiRegisterHandler(w http.ResponseWriter, r *http.Request) {
	// Placeholder for API response
	w.Write([]byte(`{"status": "success", "message": "User registered"}`))
}
