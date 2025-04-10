package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/database"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// UserRepository handles database operations for users
type UserRepository struct {
	db *database.Database
}

// NewUserRepository creates a new UserRepository instance
func NewUserRepository(db *database.Database) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, role, status,
		       organization_id, last_login_at, created_at, updated_at,
		       invitation_token, invitation_expires_at
		FROM users
		WHERE id = $1
	`

	var user model.User
	var lastLoginAt *time.Time

	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Status,
		&user.OrganizationID,
		&lastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.InvitationToken,
		&user.InvitationExpiresAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, database.ErrRecordNotFound
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	// Set last login time if not nil
	if lastLoginAt != nil {
		user.LastLoginAt = *lastLoginAt
	}

	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, role, status,
		       organization_id, last_login_at, created_at, updated_at,
		       invitation_token, invitation_expires_at
		FROM users
		WHERE email = $1
	`

	var user model.User
	var lastLoginAt *time.Time

	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Status,
		&user.OrganizationID,
		&lastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.InvitationToken,
		&user.InvitationExpiresAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, database.ErrRecordNotFound
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	// Set last login time if not nil
	if lastLoginAt != nil {
		user.LastLoginAt = *lastLoginAt
	}

	return &user, nil
}

// Create creates a new user
func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
	query := `
		INSERT INTO users (
			id, email, password_hash, first_name, last_name, role, status, organization_id,
			created_at, updated_at, invitation_token, invitation_expires_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	// Generate a new UUID if not provided
	if user.ID == "" {
		user.ID = uuid.New().String()
	}

	// Ensure created_at and updated_at are set
	now := time.Now().UTC()
	if user.CreatedAt.IsZero() {
		user.CreatedAt = now
	}
	if user.UpdatedAt.IsZero() {
		user.UpdatedAt = now
	}

	_, err := r.db.Exec(ctx, query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Status,
		user.OrganizationID,
		user.CreatedAt,
		user.UpdatedAt,
		user.InvitationToken,
		user.InvitationExpiresAt,
	)

	if err != nil {
		if database.IsUniqueViolation(err) {
			return fmt.Errorf("user with this email already exists: %w", database.ErrDuplicateKey)
		}
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// Update updates an existing user
func (r *UserRepository) Update(ctx context.Context, user *model.User) error {
	query := `
		UPDATE users
		SET email = $1, first_name = $2, last_name = $3, role = $4, status = $5,
		    organization_id = $6, updated_at = $7
		WHERE id = $8
	`

	// Ensure updated_at is set
	user.UpdateTimestamp()

	_, err := r.db.Exec(ctx, query,
		user.Email,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Status,
		user.OrganizationID,
		user.UpdatedAt,
		user.ID,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return database.ErrRecordNotFound
		}
		if database.IsUniqueViolation(err) {
			return fmt.Errorf("user with this email already exists: %w", database.ErrDuplicateKey)
		}
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

// UpdatePassword updates a user's password
func (r *UserRepository) UpdatePassword(ctx context.Context, userID string, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $1, updated_at = $2
		WHERE id = $3
	`

	now := time.Now().UTC()

	_, err := r.db.Exec(ctx, query, passwordHash, now, userID)

	if err != nil {
		if err == pgx.ErrNoRows {
			return database.ErrRecordNotFound
		}
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

// UpdateLastLogin updates a user's last login timestamp
func (r *UserRepository) UpdateLastLogin(ctx context.Context, userID string) error {
	query := `
		UPDATE users
		SET last_login_at = $1
		WHERE id = $2
	`

	now := time.Now().UTC()

	_, err := r.db.Exec(ctx, query, now, userID)

	if err != nil {
		if err == pgx.ErrNoRows {
			return database.ErrRecordNotFound
		}
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

// Delete deletes a user
func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`

	_, err := r.db.Exec(ctx, query, id)

	if err != nil {
		if err == pgx.ErrNoRows {
			return database.ErrRecordNotFound
		}
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}

// List retrieves a list of users with pagination
func (r *UserRepository) List(ctx context.Context, limit, offset int, organizationID *string) ([]*model.User, error) {
	var query string
	var args []interface{}

	if organizationID != nil && *organizationID != "" {
		query = `
			SELECT id, email, password_hash, first_name, last_name, role, status,
			       organization_id, last_login_at, created_at, updated_at
			FROM users
			WHERE organization_id = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`
		args = append(args, *organizationID, limit, offset)
	} else {
		query = `
			SELECT id, email, password_hash, first_name, last_name, role, status,
			       organization_id, last_login_at, created_at, updated_at
			FROM users
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2
		`
		args = append(args, limit, offset)
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}

	return database.ScanRowsIntoSlice(ctx, rows, r.scanUser)
}

// Count counts the total number of users, optionally filtered by organization
func (r *UserRepository) Count(ctx context.Context, organizationID *string) (int, error) {
	var query string
	var args []interface{}

	if organizationID != nil && *organizationID != "" {
		query = `SELECT COUNT(*) FROM users WHERE organization_id = $1`
		args = append(args, *organizationID)
	} else {
		query = `SELECT COUNT(*) FROM users`
	}

	var count int
	err := r.db.QueryRow(ctx, query, args...).Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("failed to count users: %w", err)
	}

	return count, nil
}

// scanUser is a helper function to scan a row into a User struct
func (r *UserRepository) scanUser(row pgx.Rows) (*model.User, error) {
	var user model.User
	var lastLoginAt *time.Time

	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Status,
		&user.OrganizationID,
		&lastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.InvitationToken,
		&user.InvitationExpiresAt,
	)

	if err != nil {
		return nil, err
	}

	// Set last login time if not nil
	if lastLoginAt != nil {
		user.LastLoginAt = *lastLoginAt
	}

	return &user, nil
}

// ListPaginated retrieves a paginated list of users
func (r *UserRepository) ListPaginated(ctx context.Context, params database.PaginationParams, organizationID *string) ([]*model.User, error) {
	return r.List(ctx, params.Limit(), params.Offset(), organizationID)
}

// GetPaginatedUsers returns a paginated response of users
func (r *UserRepository) GetPaginatedUsers(ctx context.Context, params database.PaginationParams, organizationID *string) (database.PaginatedResponse, error) {
	users, err := r.ListPaginated(ctx, params, organizationID)
	if err != nil {
		return database.PaginatedResponse{}, err
	}

	count, err := r.Count(ctx, organizationID)
	if err != nil {
		return database.PaginatedResponse{}, err
	}

	return database.NewPaginatedResponse(users, params, count), nil
}

// GetByInvitationToken retrieves a user by their invitation token
func (r *UserRepository) GetByInvitationToken(ctx context.Context, token string) (*model.User, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, role, status,
		       organization_id, last_login_at, created_at, updated_at,
		       invitation_token, invitation_expires_at
		FROM users
		WHERE invitation_token = $1
	`

	var user model.User
	var lastLoginAt *time.Time

	err := r.db.QueryRow(ctx, query, token).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Status,
		&user.OrganizationID,
		&lastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.InvitationToken,
		&user.InvitationExpiresAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, database.ErrRecordNotFound
		}
		return nil, fmt.Errorf("failed to get user by invitation token: %w", err)
	}

	// Set last login time if not nil
	if lastLoginAt != nil {
		user.LastLoginAt = *lastLoginAt
	}

	return &user, nil
}

// ActivateUser updates a user's status to active and clears invitation token
func (r *UserRepository) ActivateUser(ctx context.Context, userID string) error {
	query := `
		UPDATE users
		SET status = $1, invitation_token = NULL, invitation_expires_at = NULL, updated_at = $2
		WHERE id = $3
	`

	now := time.Now().UTC()

	_, err := r.db.Exec(ctx, query, model.StatusActive, now, userID)

	if err != nil {
		if err == pgx.ErrNoRows {
			return database.ErrRecordNotFound
		}
		return fmt.Errorf("failed to activate user: %w", err)
	}

	return nil
}

// SetPassword updates only the password hash for a given user ID
func (r *UserRepository) SetPassword(ctx context.Context, userID string, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $1, updated_at = $2
		WHERE id = $3
	`

	now := time.Now().UTC()

	result, err := r.db.Exec(ctx, query, passwordHash, now, userID)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	if result.RowsAffected() == 0 {
		return database.ErrRecordNotFound // Use the correct error constant
	}

	return nil
}
