package handler

import (
	"encoding/json"
	"net/http"

	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/cstanislawski/qualifyd/pkg/repository"
	"github.com/go-chi/chi/v5"
)

// EnvironmentHandler handles HTTP requests for environment templates
type EnvironmentHandler struct {
	environmentRepo *repository.EnvironmentRepository
	logger          logger.Logger
}

// NewEnvironmentHandler creates a new environment handler
func NewEnvironmentHandler(
	environmentRepo *repository.EnvironmentRepository,
	logger logger.Logger,
) *EnvironmentHandler {
	return &EnvironmentHandler{
		environmentRepo: environmentRepo,
		logger:          logger,
	}
}

// CreateEnvironmentTemplate creates a new environment template
func (h *EnvironmentHandler) CreateEnvironmentTemplate(w http.ResponseWriter, r *http.Request) {
	var request struct {
		OrganizationID string                 `json:"organization_id"`
		Name           string                 `json:"name"`
		Description    string                 `json:"description"`
		Type           string                 `json:"type"`
		Specs          model.EnvironmentSpecs `json:"specs"`
		Configuration  json.RawMessage        `json:"configuration"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("Error decoding request", err, nil)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if request.OrganizationID == "" || request.Name == "" || request.Type == "" {
		http.Error(w, "Organization ID, name, and type are required", http.StatusBadRequest)
		return
	}

	// Validate environment type
	validTypes := []string{model.EnvironmentTypeKubernetes, model.EnvironmentTypeLinux, model.EnvironmentTypeDocker}
	validType := false
	for _, t := range validTypes {
		if request.Type == t {
			validType = true
			break
		}
	}
	if !validType {
		http.Error(w, "Invalid environment type. Must be one of: k8s, linux, docker", http.StatusBadRequest)
		return
	}

	// Get user context
	userID := r.Context().Value("userID").(string)

	// Create environment template
	envTemplate := model.NewEnvironmentTemplate(
		request.OrganizationID,
		request.Name,
		request.Type,
		request.Specs,
	)
	envTemplate.Description = request.Description
	envTemplate.CreatedBy = userID

	if request.Configuration != nil {
		envTemplate.Configuration = request.Configuration
	}

	if err := h.environmentRepo.Create(r.Context(), envTemplate); err != nil {
		h.logger.Error("Error creating environment template", err, nil)
		http.Error(w, "Error creating environment template", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(envTemplate)
}

// GetEnvironmentTemplate gets an environment template by ID
func (h *EnvironmentHandler) GetEnvironmentTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Environment template ID is required", http.StatusBadRequest)
		return
	}

	envTemplate, err := h.environmentRepo.GetByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting environment template", err, map[string]interface{}{"id": id})
		http.Error(w, "Environment template not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(envTemplate)
}

// UpdateEnvironmentTemplate updates an environment template
func (h *EnvironmentHandler) UpdateEnvironmentTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Environment template ID is required", http.StatusBadRequest)
		return
	}

	var request struct {
		Name          string                 `json:"name"`
		Description   string                 `json:"description"`
		Specs         model.EnvironmentSpecs `json:"specs"`
		Configuration json.RawMessage        `json:"configuration"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("Error decoding request", err, nil)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get existing environment template
	envTemplate, err := h.environmentRepo.GetByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting environment template", err, map[string]interface{}{"id": id})
		http.Error(w, "Environment template not found", http.StatusNotFound)
		return
	}

	// Update fields
	if request.Name != "" {
		envTemplate.Name = request.Name
	}
	if request.Description != "" {
		envTemplate.Description = request.Description
	}
	if request.Specs.CPU != "" || request.Specs.Memory != "" || request.Specs.Storage != "" {
		if request.Specs.CPU != "" {
			envTemplate.Specs.CPU = request.Specs.CPU
		}
		if request.Specs.Memory != "" {
			envTemplate.Specs.Memory = request.Specs.Memory
		}
		if request.Specs.Storage != "" {
			envTemplate.Specs.Storage = request.Specs.Storage
		}
	}
	if request.Configuration != nil {
		envTemplate.Configuration = request.Configuration
	}

	if err := h.environmentRepo.Update(r.Context(), envTemplate); err != nil {
		h.logger.Error("Error updating environment template", err, map[string]interface{}{"id": id})
		http.Error(w, "Error updating environment template", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(envTemplate)
}

// DeleteEnvironmentTemplate deletes an environment template
func (h *EnvironmentHandler) DeleteEnvironmentTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Environment template ID is required", http.StatusBadRequest)
		return
	}

	if err := h.environmentRepo.Delete(r.Context(), id); err != nil {
		h.logger.Error("Error deleting environment template", err, map[string]interface{}{"id": id})
		http.Error(w, "Error deleting environment template", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Environment template deleted successfully",
	})
}

// ListOrganizationEnvironmentTemplates lists all environment templates for an organization
func (h *EnvironmentHandler) ListOrganizationEnvironmentTemplates(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		http.Error(w, "Organization ID is required", http.StatusBadRequest)
		return
	}

	envTemplates, err := h.environmentRepo.ListByOrganization(r.Context(), orgID)
	if err != nil {
		h.logger.Error("Error listing environment templates", err, map[string]interface{}{"organization_id": orgID})
		http.Error(w, "Error listing environment templates", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"environment_templates": envTemplates,
	})
}
