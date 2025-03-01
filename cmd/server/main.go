package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

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

	// Serve static files
	workDir, _ := os.Getwd()
	staticDir := filepath.Join(workDir, "ui/static")
	fileServer(r, "/static", http.Dir(staticDir))

	// Routes
	r.Get("/", homeHandler)
	r.Get("/login", loginHandler)
	r.Get("/register", registerHandler)

	// Admin routes
	r.Route("/admin", func(r chi.Router) {
		r.Get("/", adminDashboardHandler)
		r.Get("/templates", templatesListHandler)
		r.Get("/templates/new", newTemplateHandler)
		r.Get("/evaluations", evaluationsListHandler)
	})

	// Candidate routes
	r.Route("/candidate", func(r chi.Router) {
		r.Get("/", candidateDashboardHandler)
		r.Get("/assessments", assessmentsListHandler)
		r.Get("/terminal/{id}", terminalHandler)
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

	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

// fileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func fileServer(r chi.Router, path string, root http.FileSystem) {
	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", http.StatusMovedPermanently).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		http.FileServer(root).ServeHTTP(w, r)
	})
}

// Handlers
func homeHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "home", nil)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "login", nil)
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "register", nil)
}

func adminDashboardHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "admin/dashboard", nil)
}

func templatesListHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "admin/templates/list", nil)
}

func newTemplateHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "admin/templates/new", nil)
}

func evaluationsListHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "admin/evaluations/list", nil)
}

func candidateDashboardHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "candidate/dashboard", nil)
}

func assessmentsListHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "candidate/assessments", nil)
}

func terminalHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	data := map[string]interface{}{
		"AssessmentID": id,
	}
	renderTemplate(w, "candidate/terminal", data)
}

// renderTemplate renders a template with the given name and data
func renderTemplate(w http.ResponseWriter, name string, data interface{}) {
	tmpl, err := template.ParseFiles(
		"ui/templates/layout.html",
		fmt.Sprintf("ui/templates/%s.html", name),
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If data is nil, initialize it
	var templateData map[string]interface{}
	if data == nil {
		templateData = make(map[string]interface{})
	} else {
		templateData = data.(map[string]interface{})
	}

	// Add the current year to templateData
	templateData["Year"] = time.Now().Year()

	err = tmpl.ExecuteTemplate(w, "layout", templateData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
