package handler

import (
	"encoding/json"
	"net/http"

	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/cstanislawski/qualifyd/pkg/repository"
	"github.com/go-chi/chi/v5"
)

// TaskHandler handles HTTP requests for task templates
type TaskHandler struct {
	taskRepo *repository.TaskRepository
	logger   logger.Logger
}

// NewTaskHandler creates a new task template handler
func NewTaskHandler(taskRepo *repository.TaskRepository, logger logger.Logger) *TaskHandler {
	return &TaskHandler{
		taskRepo: taskRepo,
		logger:   logger,
	}
}

// CreateTaskTemplate creates a new task template
func (h *TaskHandler) CreateTaskTemplate(w http.ResponseWriter, r *http.Request) {
	var request struct {
		OrganizationID         string `json:"organization_id"`
		Name                   string `json:"name"`
		Description            string `json:"description"`
		Instructions           string `json:"instructions"`
		TimeLimit              *int   `json:"time_limit"`
		Points                 int    `json:"points"`
		ValidationScript       string `json:"validation_script"`
		ReadinessScript        string `json:"readiness_script"`
		EnvironmentSetupScript string `json:"environment_setup_script"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("Error decoding request", err, nil)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if request.OrganizationID == "" || request.Name == "" || request.Instructions == "" {
		http.Error(w, "Organization ID, name, and instructions are required", http.StatusBadRequest)
		return
	}

	// Get user context
	userID := r.Context().Value("userID").(string)

	// Create task template
	taskTemplate := model.NewTaskTemplate(
		request.OrganizationID,
		request.Name,
		request.Instructions,
		request.TimeLimit,
	)
	taskTemplate.Description = request.Description
	taskTemplate.Points = request.Points
	taskTemplate.ValidationScript = request.ValidationScript
	taskTemplate.ReadinessScript = request.ReadinessScript
	taskTemplate.EnvironmentSetupScript = request.EnvironmentSetupScript
	taskTemplate.CreatedBy = userID

	if err := h.taskRepo.Create(r.Context(), taskTemplate); err != nil {
		h.logger.Error("Error creating task template", err, nil)
		http.Error(w, "Error creating task template", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(taskTemplate)
}

// GetTaskTemplate gets a task template by ID
func (h *TaskHandler) GetTaskTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Task template ID is required", http.StatusBadRequest)
		return
	}

	taskTemplate, err := h.taskRepo.GetByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting task template", err, map[string]interface{}{"id": id})
		http.Error(w, "Task template not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(taskTemplate)
}

// UpdateTaskTemplate updates a task template
func (h *TaskHandler) UpdateTaskTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Task template ID is required", http.StatusBadRequest)
		return
	}

	var request struct {
		Name                   string `json:"name"`
		Description            string `json:"description"`
		Instructions           string `json:"instructions"`
		TimeLimit              *int   `json:"time_limit"`
		Points                 int    `json:"points"`
		ValidationScript       string `json:"validation_script"`
		ReadinessScript        string `json:"readiness_script"`
		EnvironmentSetupScript string `json:"environment_setup_script"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("Error decoding request", err, nil)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get existing task template
	taskTemplate, err := h.taskRepo.GetByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting task template", err, map[string]interface{}{"id": id})
		http.Error(w, "Task template not found", http.StatusNotFound)
		return
	}

	// Update fields
	if request.Name != "" {
		taskTemplate.Name = request.Name
	}
	if request.Description != "" {
		taskTemplate.Description = request.Description
	}
	if request.Instructions != "" {
		taskTemplate.Instructions = request.Instructions
	}
	if request.TimeLimit != nil {
		taskTemplate.TimeLimit = request.TimeLimit
	}
	if request.Points > 0 {
		taskTemplate.Points = request.Points
	}
	if request.ValidationScript != "" {
		taskTemplate.ValidationScript = request.ValidationScript
	}
	if request.ReadinessScript != "" {
		taskTemplate.ReadinessScript = request.ReadinessScript
	}
	if request.EnvironmentSetupScript != "" {
		taskTemplate.EnvironmentSetupScript = request.EnvironmentSetupScript
	}

	if err := h.taskRepo.Update(r.Context(), taskTemplate); err != nil {
		h.logger.Error("Error updating task template", err, map[string]interface{}{"id": id})
		http.Error(w, "Error updating task template", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(taskTemplate)
}

// DeleteTaskTemplate deletes a task template
func (h *TaskHandler) DeleteTaskTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Task template ID is required", http.StatusBadRequest)
		return
	}

	if err := h.taskRepo.Delete(r.Context(), id); err != nil {
		h.logger.Error("Error deleting task template", err, map[string]interface{}{"id": id})
		http.Error(w, "Error deleting task template", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Task template deleted successfully",
	})
}

// ListOrganizationTaskTemplates lists all task templates for an organization
func (h *TaskHandler) ListOrganizationTaskTemplates(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		http.Error(w, "Organization ID is required", http.StatusBadRequest)
		return
	}

	taskTemplates, err := h.taskRepo.ListByOrganization(r.Context(), orgID)
	if err != nil {
		h.logger.Error("Error listing task templates", err, map[string]interface{}{"organization_id": orgID})
		http.Error(w, "Error listing task templates", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"task_templates": taskTemplates,
	})
}
