package model

import (
	"strings"
	"time"
)

// User roles
const (
	RoleAdmin          = "admin"
	RoleTemplateEditor = "template_editor"
	RoleRecruiter      = "recruiter"
	RoleCandidate      = "candidate"
	RoleReviewer       = "reviewer"
)

// User status
const (
	StatusActive   = "active"
	StatusInactive = "inactive"
	StatusPending  = "pending"
)

// User represents a user in the system
type User struct {
	ID                  string     `json:"id"`
	Email               string     `json:"email"`
	PasswordHash        string     `json:"-"`
	FirstName           string     `json:"first_name"`
	LastName            string     `json:"last_name"`
	Role                string     `json:"role"`
	Status              string     `json:"status"`
	OrganizationID      string     `json:"organization_id,omitempty"`
	LastLoginAt         time.Time  `json:"last_login_at,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
	InvitationToken     *string    `json:"-"` // Pointer to handle nullable
	InvitationExpiresAt *time.Time `json:"-"` // Pointer to handle nullable
}

// NewUser creates a new user with the provided information
func NewUser(id, email, firstName, lastName, role string) *User {
	now := time.Now().UTC()
	return &User{
		ID:          id,
		Email:       strings.ToLower(strings.TrimSpace(email)),
		FirstName:   strings.TrimSpace(firstName),
		LastName:    strings.TrimSpace(lastName),
		Role:        role,
		Status:      StatusPending,
		LastLoginAt: time.Time{}, // Zero time
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// FullName returns the user's full name
func (u *User) FullName() string {
	return strings.TrimSpace(u.FirstName + " " + u.LastName)
}

// IsAdmin returns true if the user has admin role
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// IsTemplateEditor returns true if the user has template editor role
func (u *User) IsTemplateEditor() bool {
	return u.Role == RoleTemplateEditor
}

// IsRecruiter returns true if the user has recruiter role
func (u *User) IsRecruiter() bool {
	return u.Role == RoleRecruiter
}

// IsCandidate returns true if the user has candidate role
func (u *User) IsCandidate() bool {
	return u.Role == RoleCandidate
}

// IsReviewer returns true if the user has reviewer role
func (u *User) IsReviewer() bool {
	return u.Role == RoleReviewer
}

// IsActive returns true if the user status is active
func (u *User) IsActive() bool {
	return u.Status == StatusActive
}

// UserProfile represents publicly visible user information
func (u *User) UserProfile() map[string]interface{} {
	return map[string]interface{}{
		"id":              u.ID,
		"email":           u.Email,
		"first_name":      u.FirstName,
		"last_name":       u.LastName,
		"full_name":       u.FullName(),
		"role":            u.Role,
		"status":          u.Status,
		"organization_id": u.OrganizationID,
		"created_at":      u.CreatedAt,
		"last_login":      u.LastLoginAt,
	}
}

// UpdateLoginTimestamp updates the last login timestamp to the current time
func (u *User) UpdateLoginTimestamp() {
	u.LastLoginAt = time.Now().UTC()
}

// UpdateTimestamp updates the updated_at timestamp to the current time
func (u *User) UpdateTimestamp() {
	u.UpdatedAt = time.Now().UTC()
}

// Validate performs basic validation on the user data
func (u *User) Validate() map[string]string {
	errors := make(map[string]string)

	// Email validation
	if u.Email == "" {
		errors["email"] = "Email is required"
	} else if !strings.Contains(u.Email, "@") || !strings.Contains(u.Email, ".") {
		errors["email"] = "Invalid email format"
	}

	// Name validation
	if u.FirstName == "" {
		errors["first_name"] = "First name is required"
	}
	if u.LastName == "" {
		errors["last_name"] = "Last name is required"
	}

	// Role validation
	switch u.Role {
	case RoleAdmin, RoleTemplateEditor, RoleRecruiter, RoleCandidate, RoleReviewer:
		// Valid role
	default:
		errors["role"] = "Invalid role"
	}

	// Status validation
	switch u.Status {
	case StatusActive, StatusInactive, StatusPending:
		// Valid status
	default:
		errors["status"] = "Invalid status"
	}

	return errors
}
