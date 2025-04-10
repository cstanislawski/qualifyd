package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/auth"
	"github.com/cstanislawski/qualifyd/pkg/database"
	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/cstanislawski/qualifyd/pkg/repository"
	"github.com/google/uuid"
)

// LoginRequest represents the login request payload
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterRequest represents the registration request payload
type RegisterRequest struct {
	Email           string `json:"email"`
	Password        string `json:"password"`
	FirstName       string `json:"first_name"`
	LastName        string `json:"last_name"`
	Organization    string `json:"organization,omitempty"`
	Role            string `json:"role,omitempty"`             // Optional role specification
	InvitationToken string `json:"invitation_token,omitempty"` // For invited users
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	AccessToken  string     `json:"access_token"`
	RefreshToken string     `json:"refresh_token,omitempty"`
	User         model.User `json:"user"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

// AcceptInvitationRequest represents the payload for accepting an invitation
type AcceptInvitationRequest struct {
	InvitationToken string `json:"invitation_token"`
	Password        string `json:"password"`
}

// AuthHandler handles authentication requests
type AuthHandler struct {
	userRepo         *repository.UserRepository
	organizationRepo *repository.OrganizationRepository
	auth             *auth.Auth
	logger           logger.Logger
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(
	userRepo *repository.UserRepository,
	organizationRepo *repository.OrganizationRepository,
	auth *auth.Auth,
	logger logger.Logger,
) *AuthHandler {
	return &AuthHandler{
		userRepo:         userRepo,
		organizationRepo: organizationRepo,
		auth:             auth,
		logger:           logger,
	}
}

// Login handles user login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode login request", err, nil)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Email and password are required", "")
		return
	}

	// Get user by email
	user, err := h.userRepo.GetByEmail(r.Context(), req.Email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			respondWithError(w, http.StatusUnauthorized, "Invalid credentials", "")
			return
		}
		h.logger.Error("Failed to get user by email", err, map[string]interface{}{"email": req.Email})
		respondWithError(w, http.StatusInternalServerError, "Failed to login", "")
		return
	}

	// Check if user is active
	if user.Status != model.StatusActive {
		respondWithError(w, http.StatusUnauthorized, "Account is not active", "")
		return
	}

	// Check password
	if err := auth.CheckPassword(req.Password, user.PasswordHash); err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials", "")
		return
	}

	// Update last login time
	if err := h.userRepo.UpdateLastLogin(r.Context(), user.ID); err != nil {
		h.logger.Error("Failed to update last login time", err, map[string]interface{}{"userID": user.ID})
	}

	// Generate JWT tokens
	accessToken, refreshToken, err := h.auth.GenerateTokens(user)
	if err != nil {
		h.logger.Error("Failed to generate tokens", err, map[string]interface{}{"userID": user.ID})
		respondWithError(w, http.StatusInternalServerError, "Failed to generate authentication tokens", "")
		return
	}

	// Sanitize user data before sending response
	user.PasswordHash = ""

	// Send response
	respondWithJSON(w, http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *user,
	})
}

// Register handles user registration
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode register request", err, nil)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		respondWithError(w, http.StatusBadRequest, "Email, password, first name, and last name are required", "")
		return
	}

	// Check if user already exists
	existingUser, err := h.userRepo.GetByEmail(r.Context(), req.Email)
	if err == nil && existingUser != nil {
		respondWithError(w, http.StatusConflict, "Email already in use", "")
		return
	} else if err != nil && !errors.Is(err, repository.ErrUserNotFound) {
		h.logger.Error("Failed to check existing user", err, map[string]interface{}{"email": req.Email})
		respondWithError(w, http.StatusInternalServerError, "Failed to register user", "")
		return
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		h.logger.Error("Failed to hash password", err, nil)
		respondWithError(w, http.StatusInternalServerError, "Failed to register user", "")
		return
	}

	// Determine user role based on registration scenario
	userRole := model.RoleCandidate // Default role is candidate if not specified

	// If role is specified, validate and use it
	if req.Role != "" {
		switch req.Role {
		case model.RoleAdmin, model.RoleRecruiter, model.RoleCandidate, model.RoleReviewer:
			userRole = req.Role
		default:
			respondWithError(w, http.StatusBadRequest, "Invalid role specified", "")
			return
		}
	}

	// Create organization if specified and set user as admin
	var organizationID string
	if req.Organization != "" {
		org := &model.Organization{
			ID:               uuid.New().String(),
			Name:             req.Organization,
			SubscriptionPlan: model.OrgPlanStarter,
			ContactEmail:     req.Email,
		}

		if err := h.organizationRepo.Create(r.Context(), org); err != nil {
			h.logger.Error("Failed to create organization", err, map[string]interface{}{"organization": req.Organization})
			respondWithError(w, http.StatusInternalServerError, "Failed to create organization", "")
			return
		}
		organizationID = org.ID
		userRole = model.RoleAdmin // If creating an organization, user is automatically an admin
	}

	// Handle invitation token if provided
	if req.InvitationToken != "" {
		// Validate invitation token and get organization and role
		// This would normally call a service to validate the token and get details
		// For now, we'll assume it's valid and use the specified role
		// TODO: Implement invitation token validation
	}

	// Create user
	user := &model.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Role:         userRole,
		Status:       model.StatusActive,
	}

	if organizationID != "" {
		user.OrganizationID = organizationID
	}

	// Special case for local development
	if req.Email == "candidate@example.com" {
		user.Role = model.RoleCandidate
	} else if req.Email == "recruiter@example.com" {
		user.Role = model.RoleRecruiter
	} else if req.Email == "admin@example.com" {
		user.Role = model.RoleAdmin
	} else if req.Email == "reviewer@example.com" {
		user.Role = model.RoleReviewer
	}

	if err := h.userRepo.Create(r.Context(), user); err != nil {
		h.logger.Error("Failed to create user", err, map[string]interface{}{"email": req.Email})
		respondWithError(w, http.StatusInternalServerError, "Failed to register user", "")
		return
	}

	// Generate JWT tokens
	accessToken, refreshToken, err := h.auth.GenerateTokens(user)
	if err != nil {
		h.logger.Error("Failed to generate tokens", err, map[string]interface{}{"userID": user.ID})
		respondWithError(w, http.StatusInternalServerError, "Failed to generate authentication tokens", "")
		return
	}

	// Sanitize user data before sending response
	user.PasswordHash = ""

	// Send response
	respondWithJSON(w, http.StatusCreated, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *user,
	})
}

// RefreshToken handles refreshing JWT tokens
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	// Get refresh token from Authorization header
	refreshToken := r.Header.Get("Authorization")
	if refreshToken == "" {
		respondWithError(w, http.StatusUnauthorized, "No refresh token provided", "")
		return
	}

	// Strip "Bearer " prefix if present
	if len(refreshToken) > 7 && refreshToken[:7] == "Bearer " {
		refreshToken = refreshToken[7:]
	}

	// Validate refresh token
	userID, err := h.auth.ValidateRefreshToken(refreshToken)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid refresh token", "")
		return
	}

	// Get user by ID
	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		h.logger.Error("Failed to get user by ID", err, map[string]interface{}{"userID": userID})
		respondWithError(w, http.StatusInternalServerError, "Failed to refresh token", "")
		return
	}

	// Generate new access token
	accessToken, err := h.auth.GenerateAccessToken(user)
	if err != nil {
		h.logger.Error("Failed to generate access token", err, map[string]interface{}{"userID": userID})
		respondWithError(w, http.StatusInternalServerError, "Failed to generate access token", "")
		return
	}

	// Sanitize user data before sending response
	user.PasswordHash = ""

	// Send response
	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"access_token": accessToken,
		"user":         user,
	})
}

// HandleAcceptInvitation handles the user accepting an invitation and setting their password
func (h *AuthHandler) HandleAcceptInvitation(w http.ResponseWriter, r *http.Request) {
	var req AcceptInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode accept invitation request", err, nil)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	// Validate required fields
	if req.InvitationToken == "" || req.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Invitation token and password are required", "")
		return
	}

	// Get user by invitation token
	user, err := h.userRepo.GetByInvitationToken(r.Context(), req.InvitationToken)
	if err != nil {
		if errors.Is(err, database.ErrRecordNotFound) {
			respondWithError(w, http.StatusNotFound, "Invalid or expired invitation token", "")
			return
		}
		h.logger.Error("Failed to get user by invitation token", err, map[string]interface{}{
			"token": req.InvitationToken,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to process invitation", "")
		return
	}

	// Check user status
	if user.Status != model.StatusPending {
		respondWithError(w, http.StatusConflict, "Invitation already used or user is not pending", "")
		return
	}

	// Check if token is expired
	if user.InvitationExpiresAt == nil || time.Now().UTC().After(*user.InvitationExpiresAt) {
		respondWithError(w, http.StatusBadRequest, "Invitation token has expired", "")
		return
	}

	// Hash the new password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		h.logger.Error("Failed to hash password during invitation acceptance", err, nil)
		respondWithError(w, http.StatusInternalServerError, "Failed to set password", "")
		return
	}

	// Set the user's password
	if err := h.userRepo.SetPassword(r.Context(), user.ID, hashedPassword); err != nil {
		h.logger.Error("Failed to set password during invitation acceptance", err, map[string]interface{}{
			"user_id": user.ID,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to set password", "")
		return
	}

	// Activate the user (sets status to active, clears token)
	if err := h.userRepo.ActivateUser(r.Context(), user.ID); err != nil {
		h.logger.Error("Failed to activate user during invitation acceptance", err, map[string]interface{}{
			"user_id": user.ID,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to activate user", "")
		return
	}

	// Fetch the updated user record (now active)
	activeUser, err := h.userRepo.GetByID(r.Context(), user.ID)
	if err != nil {
		// Log the error but proceed, as activation likely succeeded
		h.logger.Error("Failed to fetch user details after activation", err, map[string]interface{}{"user_id": user.ID})
		// Use the user object we have, but ensure status is active
		activeUser = user
		activeUser.Status = model.StatusActive
	}

	// Generate JWT tokens for immediate login
	accessToken, refreshToken, err := h.auth.GenerateTokens(activeUser)
	if err != nil {
		h.logger.Error("Failed to generate tokens after invitation acceptance", err, map[string]interface{}{
			"user_id": activeUser.ID,
		})
		respondWithError(w, http.StatusInternalServerError, "Failed to generate authentication tokens", "")
		return
	}

	// Sanitize user data before sending response
	activeUser.PasswordHash = ""
	activeUser.InvitationToken = nil
	activeUser.InvitationExpiresAt = nil

	// Send response
	respondWithJSON(w, http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *activeUser,
	})
}

// Helper functions for JSON responses
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "Failed to marshal response"}`))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func respondWithError(w http.ResponseWriter, code int, error string, message string) {
	response := ErrorResponse{
		Error:   error,
		Message: message,
	}
	respondWithJSON(w, code, response)
}
