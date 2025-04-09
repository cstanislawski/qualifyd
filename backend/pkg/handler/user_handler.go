package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/auth"
	"github.com/cstanislawski/qualifyd/pkg/database"
	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/cstanislawski/qualifyd/pkg/middleware"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/cstanislawski/qualifyd/pkg/repository"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// CreateUserRequest represents the request payload for creating a user
type CreateUserRequest struct {
	OrganizationID string `json:"organization_id"`
	Email          string `json:"email"`
	FirstName      string `json:"first_name"`
	LastName       string `json:"last_name"`
	Role           string `json:"role"`
}

// UpdateUserRequest represents the request payload for updating a user
type UpdateUserRequest struct {
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	Role      string `json:"role,omitempty"`
	Status    string `json:"status,omitempty"`
}

// UpdateProfileRequest represents the request payload for updating user's own profile
type UpdateProfileRequest struct {
	FirstName       string `json:"first_name,omitempty"`
	LastName        string `json:"last_name,omitempty"`
	CurrentPassword string `json:"current_password,omitempty"`
	NewPassword     string `json:"new_password,omitempty"`
}

// UserHandler handles user management operations
type UserHandler struct {
	userRepo         *repository.UserRepository
	organizationRepo *repository.OrganizationRepository
	auth             *auth.Auth
	logger           logger.Logger
}

// NewUserHandler creates a new UserHandler instance
func NewUserHandler(
	userRepo *repository.UserRepository,
	organizationRepo *repository.OrganizationRepository,
	auth *auth.Auth,
	logger logger.Logger,
) *UserHandler {
	return &UserHandler{
		userRepo:         userRepo,
		organizationRepo: organizationRepo,
		auth:             auth,
		logger:           logger,
	}
}

// HandleCreateUser handles user creation by admin
func (h *UserHandler) HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	// Parse request
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode create user request", err, nil)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	// Validate request
	if req.Email == "" || req.FirstName == "" || req.LastName == "" || req.Role == "" || req.OrganizationID == "" {
		respondWithError(w, http.StatusBadRequest, "All fields are required", "")
		return
	}

	// Validate role
	if !isValidRole(req.Role) {
		respondWithError(w, http.StatusBadRequest, "Invalid role", "")
		return
	}

	// Check if organization exists
	org, err := h.organizationRepo.GetByID(r.Context(), req.OrganizationID)
	if err != nil {
		if errors.Is(err, database.ErrRecordNotFound) {
			respondWithError(w, http.StatusNotFound, "Organization not found", "")
			return
		}
		h.logger.Error("Failed to get organization", err, map[string]interface{}{
			"organization_id": req.OrganizationID,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to create user", "")
		return
	}

	// Generate invitation token
	invitationToken := uuid.New().String()
	invitationExpiry := time.Now().UTC().Add(72 * time.Hour) // Token valid for 72 hours

	// Create user with pending status and invitation token
	// PasswordHash can be initially empty or a placeholder, as user will set it
	user := &model.User{
		ID:                  uuid.New().String(),
		Email:               strings.ToLower(req.Email),
		FirstName:           req.FirstName,
		LastName:            req.LastName,
		PasswordHash:        "", // User will set password via invitation
		Role:                req.Role,
		Status:              model.StatusPending,
		OrganizationID:      org.ID,
		InvitationToken:     &invitationToken,
		InvitationExpiresAt: &invitationExpiry,
	}

	if err := h.userRepo.Create(r.Context(), user); err != nil {
		if errors.Is(err, database.ErrDuplicateKey) {
			respondWithError(w, http.StatusConflict, "Email already exists", "")
			return
		}
		h.logger.Error("Failed to create user", err, map[string]interface{}{
			"email": req.Email,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to create user", "")
		return
	}

	// TODO: Send invitation email with token (e.g., queue a task)
	h.logger.Info("User invited, needs to accept invitation", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"token":   invitationToken, // Log token for now (remove in prod)
	})

	// Return success response
	user.PasswordHash = ""     // Ensure sensitive data is not returned
	user.InvitationToken = nil // Don't return token in response
	user.InvitationExpiresAt = nil
	respondWithJSON(w, http.StatusCreated, user)
}

// HandleListUsers handles listing users (admin only)
func (h *UserHandler) HandleListUsers(w http.ResponseWriter, r *http.Request) {
	// Get pagination parameters using the new helper
	params := getPaginationParams(r, 10, 100) // Default limit 10, max 100

	// Get organization filter from query parameters
	orgID := r.URL.Query().Get("organization_id")
	var orgIDPtr *string
	if orgID != "" {
		orgIDPtr = &orgID
	}

	// Get paginated users
	response, err := h.userRepo.GetPaginatedUsers(r.Context(), params, orgIDPtr)
	if err != nil {
		h.logger.Error("Failed to list users", err, nil)
		respondWithError(w, http.StatusInternalServerError, "Failed to list users", "")
		return
	}

	// Ensure password hash is not included in the response
	if paginatedUsers, ok := response.Data.([]*model.User); ok {
		for _, u := range paginatedUsers {
			u.PasswordHash = ""
		}
		response.Data = paginatedUsers
	}

	respondWithJSON(w, http.StatusOK, response)
}

// HandleGetUser handles getting a single user by ID
func (h *UserHandler) HandleGetUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "user_id") // Use chi.URLParam

	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, database.ErrRecordNotFound) {
			respondWithError(w, http.StatusNotFound, "User not found", "")
			return
		}
		h.logger.Error("Failed to get user", err, map[string]interface{}{
			"user_id": userID,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to get user", "")
		return
	}

	user.PasswordHash = "" // Remove sensitive data
	user.InvitationToken = nil
	user.InvitationExpiresAt = nil
	respondWithJSON(w, http.StatusOK, user)
}

// HandleUpdateUser handles updating a user (admin only)
func (h *UserHandler) HandleUpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "user_id") // Use chi.URLParam

	// Get existing user
	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, database.ErrRecordNotFound) {
			respondWithError(w, http.StatusNotFound, "User not found", "")
			return
		}
		h.logger.Error("Failed to get user", err, map[string]interface{}{
			"user_id": userID,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to update user", "")
		return
	}

	// Parse request
	var req UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode update user request", err, nil)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	// Update fields if provided
	updated := false
	if req.FirstName != "" && user.FirstName != req.FirstName {
		user.FirstName = req.FirstName
		updated = true
	}
	if req.LastName != "" && user.LastName != req.LastName {
		user.LastName = req.LastName
		updated = true
	}
	if req.Role != "" && user.Role != req.Role {
		if !isValidRole(req.Role) {
			respondWithError(w, http.StatusBadRequest, "Invalid role", "")
			return
		}
		user.Role = req.Role
		updated = true
	}
	if req.Status != "" && user.Status != req.Status {
		if !isValidStatus(req.Status) {
			respondWithError(w, http.StatusBadRequest, "Invalid status", "")
			return
		}
		// Prevent manually setting status back to pending?
		if req.Status == model.StatusPending {
			respondWithError(w, http.StatusBadRequest, "Cannot manually set status to pending", "")
			return
		}
		user.Status = req.Status
		updated = true
	}

	// Update user in DB only if something changed
	if updated {
		if err := h.userRepo.Update(r.Context(), user); err != nil {
			h.logger.Error("Failed to update user", err, map[string]interface{}{
				"user_id": userID,
			})
			respondWithError(w, http.StatusInternalServerError, "Failed to update user", "")
			return
		}
	}

	user.PasswordHash = "" // Remove sensitive data
	user.InvitationToken = nil
	user.InvitationExpiresAt = nil
	respondWithJSON(w, http.StatusOK, user)
}

// HandleDeleteUser handles user deletion (admin only)
func (h *UserHandler) HandleDeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "user_id") // Use chi.URLParam

	// We should implement soft delete (e.g., setting status to 'deleted') instead of hard delete
	// For now, assuming repository.Delete performs the desired action (hard or soft)
	if err := h.userRepo.Delete(r.Context(), userID); err != nil {
		if errors.Is(err, database.ErrRecordNotFound) {
			respondWithError(w, http.StatusNotFound, "User not found", "")
			return
		}
		h.logger.Error("Failed to delete user", err, map[string]interface{}{
			"user_id": userID,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to delete user", "")
		return
	}

	respondWithJSON(w, http.StatusNoContent, nil)
}

// HandleGetMyProfile handles getting the current user's profile
func (h *UserHandler) HandleGetMyProfile(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID := middleware.GetUserID(r) // Use middleware helper
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized", "Missing user ID in context")
		return
	}

	// Fetch the full user object
	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, database.ErrRecordNotFound) {
			h.logger.Warn("User from token not found in DB", map[string]interface{}{"user_id": userID})
			respondWithError(w, http.StatusUnauthorized, "Unauthorized", "User not found")
			return
		}
		h.logger.Error("Failed to get user profile", err, map[string]interface{}{"user_id": userID})
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve profile", "")
		return
	}

	user.PasswordHash = "" // Remove sensitive data
	user.InvitationToken = nil
	user.InvitationExpiresAt = nil
	respondWithJSON(w, http.StatusOK, user)
}

// HandleUpdateMyProfile handles updating the current user's profile
func (h *UserHandler) HandleUpdateMyProfile(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID := middleware.GetUserID(r) // Use middleware helper
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized", "Missing user ID in context")
		return
	}

	// Fetch the user object
	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, database.ErrRecordNotFound) {
			h.logger.Warn("User from token not found in DB", map[string]interface{}{"user_id": userID})
			respondWithError(w, http.StatusUnauthorized, "Unauthorized", "User not found")
			return
		}
		h.logger.Error("Failed to get user for profile update", err, map[string]interface{}{"user_id": userID})
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve profile", "")
		return
	}

	// Parse request
	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode update profile request", err, nil)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	// Update fields if provided
	updated := false
	passwordChanged := false
	if req.FirstName != "" && user.FirstName != req.FirstName {
		user.FirstName = req.FirstName
		updated = true
	}
	if req.LastName != "" && user.LastName != req.LastName {
		user.LastName = req.LastName
		updated = true
	}

	// If password change is requested
	if req.NewPassword != "" {
		if req.CurrentPassword == "" {
			respondWithError(w, http.StatusBadRequest, "Current password is required to set a new password", "")
			return
		}

		// Verify current password
		if err := auth.CheckPassword(req.CurrentPassword, user.PasswordHash); err != nil {
			respondWithError(w, http.StatusUnauthorized, "Invalid current password", "")
			return
		}

		// Hash new password
		hashedPassword, err := auth.HashPassword(req.NewPassword)
		if err != nil {
			h.logger.Error("Failed to hash password", err, nil)
			respondWithError(w, http.StatusInternalServerError, "Failed to update password", "")
			return
		}

		// Update password in repository
		if err := h.userRepo.UpdatePassword(r.Context(), user.ID, hashedPassword); err != nil {
			h.logger.Error("Failed to update password", err, map[string]interface{}{
				"user_id": user.ID,
			})
			respondWithError(w, http.StatusInternalServerError, "Failed to update password", "")
			return
		}
		passwordChanged = true
	}

	// Update user profile only if non-password fields changed
	if updated {
		if err := h.userRepo.Update(r.Context(), user); err != nil {
			h.logger.Error("Failed to update user profile", err, map[string]interface{}{
				"user_id": user.ID,
			})
			respondWithError(w, http.StatusInternalServerError, "Failed to update profile", "")
			return
		}
	}

	if !updated && !passwordChanged {
		respondWithError(w, http.StatusBadRequest, "No changes provided", "")
		return
	}

	// Fetch the updated user to return (especially if only password changed)
	updatedUser, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		// Log error but proceed, maybe return the user object we have?
		h.logger.Error("Failed to fetch updated user profile", err, map[string]interface{}{"user_id": userID})
	} else {
		user = updatedUser
	}

	user.PasswordHash = "" // Remove sensitive data
	user.InvitationToken = nil
	user.InvitationExpiresAt = nil
	respondWithJSON(w, http.StatusOK, user)
}

// Helper functions

// getPaginationParams extracts limit and offset from request query parameters
func getPaginationParams(r *http.Request, defaultLimit, maxLimit int) database.PaginationParams {
	limitStr := r.URL.Query().Get("limit")
	pageStr := r.URL.Query().Get("page")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = defaultLimit
	}
	if limit > maxLimit {
		limit = maxLimit
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = 1
	}

	return database.NewPaginationParams(page, limit)
}

func isValidRole(role string) bool {
	switch role {
	case model.RoleAdmin, model.RoleRecruiter, model.RoleCandidate, model.RoleReviewer:
		return true
	default:
		return false
	}
}

func isValidStatus(status string) bool {
	switch status {
	case model.StatusActive, model.StatusInactive, model.StatusPending:
		return true
	default:
		return false
	}
}

// respondWithError and respondWithJSON are likely defined elsewhere (e.g., auth_handler.go)
// Removing duplicate definitions
/*
// respondWithError sends a JSON error response
func respondWithError(w http.ResponseWriter, code int, message string, details string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{
		"error":   message,
		"details": details,
	})
}

// respondWithJSON sends a JSON success response
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if payload != nil {
		json.NewEncoder(w).Encode(payload)
	}
}
*/
