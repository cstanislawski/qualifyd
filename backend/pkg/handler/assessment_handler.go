package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/cstanislawski/qualifyd/pkg/repository"
	"github.com/go-chi/chi/v5"
)

// AssessmentHandler handles HTTP requests for assessments
type AssessmentHandler struct {
	assessmentRepo  *repository.AssessmentRepository
	taskRepo        *repository.TaskRepository
	environmentRepo *repository.EnvironmentRepository
	logger          logger.Logger
}

// NewAssessmentHandler creates a new assessment handler
func NewAssessmentHandler(
	assessmentRepo *repository.AssessmentRepository,
	taskRepo *repository.TaskRepository,
	environmentRepo *repository.EnvironmentRepository,
	logger logger.Logger,
) *AssessmentHandler {
	return &AssessmentHandler{
		assessmentRepo:  assessmentRepo,
		taskRepo:        taskRepo,
		environmentRepo: environmentRepo,
		logger:          logger,
	}
}

// CreateAssessment creates a new assessment
func (h *AssessmentHandler) CreateAssessment(w http.ResponseWriter, r *http.Request) {
	var request struct {
		TemplateID         string    `json:"template_id"`
		CandidateID        string    `json:"candidate_id"`
		ScheduledStartTime time.Time `json:"scheduled_start_time"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("Error decoding request", err, nil)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if request.TemplateID == "" || request.CandidateID == "" {
		http.Error(w, "Template ID and candidate ID are required", http.StatusBadRequest)
		return
	}

	// Get user context
	userID := r.Context().Value("userID").(string)

	// Create assessment
	assessment := model.NewAssessment(
		request.TemplateID,
		request.CandidateID,
		userID,
		request.ScheduledStartTime,
	)

	if err := h.assessmentRepo.Create(r.Context(), assessment); err != nil {
		h.logger.Error("Error creating assessment", err, nil)
		http.Error(w, "Error creating assessment", http.StatusInternalServerError)
		return
	}

	// Create tasks for the assessment
	if err := h.assessmentRepo.CreateAssessmentTasks(r.Context(), assessment.ID, request.TemplateID); err != nil {
		h.logger.Error("Error creating assessment tasks", err, nil)
		http.Error(w, "Error creating assessment tasks", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      assessment.ID,
		"message": "Assessment created successfully",
	})
}

// GetAssessment gets an assessment by ID
func (h *AssessmentHandler) GetAssessment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Assessment ID is required", http.StatusBadRequest)
		return
	}

	assessment, err := h.assessmentRepo.GetAssessmentWithTasksAndTemplate(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting assessment", err, map[string]interface{}{"id": id})
		http.Error(w, "Assessment not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessment)
}

// StartAssessment starts an assessment
func (h *AssessmentHandler) StartAssessment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Assessment ID is required", http.StatusBadRequest)
		return
	}

	assessment, err := h.assessmentRepo.GetByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting assessment", err, map[string]interface{}{"id": id})
		http.Error(w, "Assessment not found", http.StatusNotFound)
		return
	}

	// Check if assessment can be started
	if !assessment.IsScheduled() {
		http.Error(w, "Assessment cannot be started", http.StatusBadRequest)
		return
	}

	// Start assessment
	assessment.Start()
	if err := h.assessmentRepo.Update(r.Context(), assessment); err != nil {
		h.logger.Error("Error updating assessment", err, map[string]interface{}{"id": id})
		http.Error(w, "Error updating assessment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      assessment.ID,
		"message": "Assessment started successfully",
		"status":  assessment.Status,
	})
}

// CompleteAssessment completes an assessment
func (h *AssessmentHandler) CompleteAssessment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Assessment ID is required", http.StatusBadRequest)
		return
	}

	var request struct {
		Score int `json:"score"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("Error decoding request", err, nil)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	assessment, err := h.assessmentRepo.GetByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Error getting assessment", err, map[string]interface{}{"id": id})
		http.Error(w, "Assessment not found", http.StatusNotFound)
		return
	}

	// Check if assessment can be completed
	if !assessment.IsInProgress() {
		http.Error(w, "Assessment cannot be completed", http.StatusBadRequest)
		return
	}

	// Complete assessment
	assessment.Complete(request.Score)
	if err := h.assessmentRepo.Update(r.Context(), assessment); err != nil {
		h.logger.Error("Error updating assessment", err, map[string]interface{}{"id": id})
		http.Error(w, "Error updating assessment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      assessment.ID,
		"message": "Assessment completed successfully",
		"status":  assessment.Status,
	})
}

// GetCandidateAssessments gets all assessments for a candidate
func (h *AssessmentHandler) GetCandidateAssessments(w http.ResponseWriter, r *http.Request) {
	// Get user context
	userID := r.Context().Value("userID").(string)

	assessments, err := h.assessmentRepo.ListByCandidate(r.Context(), userID)
	if err != nil {
		h.logger.Error("Error getting candidate assessments", err, map[string]interface{}{"candidate_id": userID})
		http.Error(w, "Error getting assessments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"assessments": assessments,
	})
}

// GetActiveOrganizationAssessments gets all active assessments for an organization
func (h *AssessmentHandler) GetActiveOrganizationAssessments(w http.ResponseWriter, r *http.Request) {
	// Get organization context
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		http.Error(w, "Organization ID is required", http.StatusBadRequest)
		return
	}

	assessments, err := h.assessmentRepo.ListActiveByOrganization(r.Context(), orgID)
	if err != nil {
		h.logger.Error("Error getting active organization assessments", err, map[string]interface{}{"org_id": orgID})
		http.Error(w, "Error getting assessments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"assessments": assessments,
	})
}
