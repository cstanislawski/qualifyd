package handler

import (
	"encoding/json"
	"net/http"

	"github.com/cstanislawski/qualifyd/pkg/auth"
	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/cstanislawski/qualifyd/pkg/repository"
	"github.com/google/uuid"
)

// InitialSetupRequest represents the request payload for initial platform setup
type InitialSetupRequest struct {
	OrganizationName string `json:"organization_name"`
	AdminName        string `json:"admin_name"`
	AdminEmail       string `json:"admin_email"`
	AdminPassword    string `json:"admin_password"`
}

// SetupHandler handles initial platform setup
type SetupHandler struct {
	userRepo         *repository.UserRepository
	organizationRepo *repository.OrganizationRepository
	auth             *auth.Auth
	logger           logger.Logger
}

// NewSetupHandler creates a new SetupHandler instance
func NewSetupHandler(
	userRepo *repository.UserRepository,
	organizationRepo *repository.OrganizationRepository,
	auth *auth.Auth,
	logger logger.Logger,
) *SetupHandler {
	return &SetupHandler{
		userRepo:         userRepo,
		organizationRepo: organizationRepo,
		auth:             auth,
		logger:           logger,
	}
}

// HandleInitialSetup handles the initial platform setup
func (h *SetupHandler) HandleInitialSetup(w http.ResponseWriter, r *http.Request) {
	// Check if setup has already been completed
	userCount, err := h.userRepo.Count(r.Context(), nil)
	if err != nil {
		h.logger.Error("Failed to check user count", err, nil)
		respondWithError(w, http.StatusInternalServerError, "Failed to check setup status", "")
		return
	}

	if userCount > 0 {
		respondWithError(w, http.StatusConflict, "Setup has already been completed", "")
		return
	}

	// Parse request
	var req InitialSetupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode setup request", err, nil)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	// Validate request
	if req.OrganizationName == "" || req.AdminName == "" || req.AdminEmail == "" || req.AdminPassword == "" {
		respondWithError(w, http.StatusBadRequest, "All fields are required", "")
		return
	}

	// Create organization
	org := &model.Organization{
		ID:               uuid.New().String(),
		Name:             req.OrganizationName,
		SubscriptionPlan: model.OrgPlanStarter, // Default to starter plan
		ContactEmail:     req.AdminEmail,
	}

	if err := h.organizationRepo.Create(r.Context(), org); err != nil {
		h.logger.Error("Failed to create organization", err, map[string]interface{}{
			"organization_name": req.OrganizationName,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to create organization", "")
		return
	}

	// Hash admin password
	hashedPassword, err := auth.HashPassword(req.AdminPassword)
	if err != nil {
		h.logger.Error("Failed to hash password", err, nil)
		respondWithError(w, http.StatusInternalServerError, "Failed to create admin user", "")
		return
	}

	// Create admin user
	adminUser := &model.User{
		ID:             uuid.New().String(),
		Email:          req.AdminEmail,
		FirstName:      req.AdminName,
		LastName:       "", // Could be split from AdminName if needed
		PasswordHash:   hashedPassword,
		Role:           model.RoleAdmin,
		Status:         model.StatusActive,
		OrganizationID: org.ID,
	}

	if err := h.userRepo.Create(r.Context(), adminUser); err != nil {
		h.logger.Error("Failed to create admin user", err, map[string]interface{}{
			"email": req.AdminEmail,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to create admin user", "")
		return
	}

	// Generate tokens for immediate login
	accessToken, refreshToken, err := h.auth.GenerateTokens(adminUser)
	if err != nil {
		h.logger.Error("Failed to generate tokens", err, map[string]interface{}{
			"user_id": adminUser.ID,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to generate authentication tokens", "")
		return
	}

	// Return success response with tokens
	respondWithJSON(w, http.StatusCreated, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *adminUser,
	})
}
