package handler

import (
	"encoding/json"
	"net/http"

	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/cstanislawski/qualifyd/pkg/repository"
	"github.com/go-chi/chi/v5"
)

// AssessmentTemplateHandler handles HTTP requests for assessment templates
type AssessmentTemplateHandler struct {
	assessmentRepo  *repository.AssessmentRepository
	environmentRepo *repository.EnvironmentRepository
	taskRepo        *repository.TaskRepository
	logger          logger.Logger
}

// NewAssessmentTemplateHandler creates a new assessment template handler
func NewAssessmentTemplateHandler(
	assessmentRepo *repository.AssessmentRepository,
	environmentRepo *repository.EnvironmentRepository,
	taskRepo *repository.TaskRepository,
	logger logger.Logger,
) *AssessmentTemplateHandler {
	return &AssessmentTemplateHandler{
		assessmentRepo:  assessmentRepo,
		environmentRepo: environmentRepo,
		taskRepo:        taskRepo,
		logger:          logger,
	}
}

// CreateAssessmentTemplate creates a new assessment template
func (h *AssessmentTemplateHandler) CreateAssessmentTemplate(w http.ResponseWriter, r *http.Request) {
	var request struct {
		OrganizationID        string             `json:"organization_id"`
		Name                  string             `json:"name"`
		Description           string             `json:"description"`
		EnvironmentTemplateID string             `json:"environment_template_id"`
		TotalTimeLimit        *int               `json:"total_time_limit"`
		PassingScore          int                `json:"passing_score"`
		InternetAccess        bool               `json:"internet_access"`
		Tasks                 []string           `json:"tasks"`
		TaskWeights           map[string]float64 `json:"task_weights"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("Error decoding request", err, nil)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if request.OrganizationID == "" || request.Name == "" || request.EnvironmentTemplateID == "" {
		http.Error(w, "Organization ID, name, and environment template ID are required", http.StatusBadRequest)
		return
	}

	// Verify environment template exists
	envTemplate, err := h.environmentRepo.GetByID(r.Context(), request.EnvironmentTemplateID)
	if err != nil {
		h.logger.Error("Error getting environment template", err, map[string]interface{}{"id": request.EnvironmentTemplateID})
		http.Error(w, "Environment template not found", http.StatusBadRequest)
		return
	}

	// Verify environment template belongs to organization
	if envTemplate.OrganizationID != request.OrganizationID {
		http.Error(w, "Environment template does not belong to the organization", http.StatusBadRequest)
		return
	}

	// Get user context
	userID := r.Context().Value("userID").(string)

	// Create assessment template
	assessmentTemplate := model.NewAssessmentTemplate(
		request.OrganizationID,
		request.Name,
		request.EnvironmentTemplateID,
		request.TotalTimeLimit,
	)
	assessmentTemplate.Description = request.Description
	assessmentTemplate.PassingScore = request.PassingScore
	assessmentTemplate.InternetAccess = request.InternetAccess
	assessmentTemplate.CreatedBy = userID

	if request.TaskWeights != nil {
		assessmentTemplate.TaskWeights = request.TaskWeights
	}

	// Create the assessment template
	if err := h.assessmentRepo.CreateTemplate(r.Context(), assessmentTemplate); err != nil {
		h.logger.Error("Error creating assessment template", err, nil)
		http.Error(w, "Error creating assessment template", http.StatusInternalServerError)
		return
	}

	// Add tasks to the assessment template if provided
	if len(request.Tasks) > 0 {
		for i, taskID := range request.Tasks {
			// Verify task exists
			task, err := h.taskRepo.GetByID(r.Context(), taskID)
			if err != nil {
				h.logger.Error("Error getting task", err, map[string]interface{}{"id": taskID})
				http.Error(w, "Task not found: "+taskID, http.StatusBadRequest)
				return
			}

			// Verify task belongs to organization
			if task.OrganizationID != request.OrganizationID {
				http.Error(w, "Task does not belong to the organization: "+taskID, http.StatusBadRequest)
				return
			}

			weight := 1.0
			if w, ok := request.TaskWeights[taskID]; ok {
				weight = w
			}

			if err := h.assessmentRepo.AddTaskToTemplate(r.Context(), assessmentTemplate.ID, taskID, i, weight); err != nil {
				h.logger.Error("Error adding task to template", err, map[string]interface{}{"template_id": assessmentTemplate.ID, "task_id": taskID})
				http.Error(w, "Error adding task to template", http.StatusInternalServerError)
				return
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(assessmentTemplate)
}

// GetAssessmentTemplate gets an assessment template by ID
func (h *AssessmentTemplateHandler) GetAssessmentTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Assessment template ID is required", http.StatusBadRequest)
		return
	}

	assessmentTemplate, err := h.assessmentRepo.GetTemplateByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting assessment template", err, map[string]interface{}{"id": id})
		http.Error(w, "Assessment template not found", http.StatusNotFound)
		return
	}

	// Load environment template
	if assessmentTemplate.EnvironmentTemplateID != "" {
		envTemplate, err := h.environmentRepo.GetByID(r.Context(), assessmentTemplate.EnvironmentTemplateID)
		if err == nil {
			assessmentTemplate.EnvironmentTemplate = envTemplate
		} else {
			h.logger.Error("Error getting environment template", err, map[string]interface{}{"id": assessmentTemplate.EnvironmentTemplateID})
		}
	}

	// Load tasks
	tasks, err := h.assessmentRepo.GetTemplateTasks(r.Context(), id)
	if err == nil {
		assessmentTemplate.Tasks = tasks
	} else {
		h.logger.Error("Error getting template tasks", err, map[string]interface{}{"template_id": id})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessmentTemplate)
}

// UpdateAssessmentTemplate updates an assessment template
func (h *AssessmentTemplateHandler) UpdateAssessmentTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Assessment template ID is required", http.StatusBadRequest)
		return
	}

	var request struct {
		Name                  string `json:"name"`
		Description           string `json:"description"`
		EnvironmentTemplateID string `json:"environment_template_id"`
		TotalTimeLimit        *int   `json:"total_time_limit"`
		PassingScore          int    `json:"passing_score"`
		InternetAccess        bool   `json:"internet_access"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("Error decoding request", err, nil)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get existing assessment template
	assessmentTemplate, err := h.assessmentRepo.GetTemplateByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting assessment template", err, map[string]interface{}{"id": id})
		http.Error(w, "Assessment template not found", http.StatusNotFound)
		return
	}

	// Verify environment template exists if provided
	if request.EnvironmentTemplateID != "" && request.EnvironmentTemplateID != assessmentTemplate.EnvironmentTemplateID {
		envTemplate, err := h.environmentRepo.GetByID(r.Context(), request.EnvironmentTemplateID)
		if err != nil {
			h.logger.Error("Error getting environment template", err, map[string]interface{}{"id": request.EnvironmentTemplateID})
			http.Error(w, "Environment template not found", http.StatusBadRequest)
			return
		}

		// Verify environment template belongs to organization
		if envTemplate.OrganizationID != assessmentTemplate.OrganizationID {
			http.Error(w, "Environment template does not belong to the organization", http.StatusBadRequest)
			return
		}

		assessmentTemplate.EnvironmentTemplateID = request.EnvironmentTemplateID
	}

	// Update fields
	if request.Name != "" {
		assessmentTemplate.Name = request.Name
	}
	if request.Description != "" {
		assessmentTemplate.Description = request.Description
	}
	if request.TotalTimeLimit != nil {
		assessmentTemplate.TotalTimeLimit = request.TotalTimeLimit
	}
	if request.PassingScore > 0 {
		assessmentTemplate.PassingScore = request.PassingScore
	}
	assessmentTemplate.InternetAccess = request.InternetAccess

	if err := h.assessmentRepo.UpdateTemplate(r.Context(), assessmentTemplate); err != nil {
		h.logger.Error("Error updating assessment template", err, map[string]interface{}{"id": id})
		http.Error(w, "Error updating assessment template", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessmentTemplate)
}

// DeleteAssessmentTemplate deletes an assessment template
func (h *AssessmentTemplateHandler) DeleteAssessmentTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Assessment template ID is required", http.StatusBadRequest)
		return
	}

	if err := h.assessmentRepo.DeleteTemplate(r.Context(), id); err != nil {
		h.logger.Error("Error deleting assessment template", err, map[string]interface{}{"id": id})
		http.Error(w, "Error deleting assessment template", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Assessment template deleted successfully",
	})
}

// ListOrganizationAssessmentTemplates lists all assessment templates for an organization
func (h *AssessmentTemplateHandler) ListOrganizationAssessmentTemplates(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		http.Error(w, "Organization ID is required", http.StatusBadRequest)
		return
	}

	assessmentTemplates, err := h.assessmentRepo.ListTemplatesByOrganization(r.Context(), orgID)
	if err != nil {
		h.logger.Error("Error listing assessment templates", err, map[string]interface{}{"organization_id": orgID})
		http.Error(w, "Error listing assessment templates", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"assessment_templates": assessmentTemplates,
	})
}
