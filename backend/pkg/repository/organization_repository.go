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

// OrganizationRepository handles database operations for organizations
type OrganizationRepository struct {
	db *database.Database
}

// NewOrganizationRepository creates a new OrganizationRepository instance
func NewOrganizationRepository(db *database.Database) *OrganizationRepository {
	return &OrganizationRepository{
		db: db,
	}
}

// GetByID retrieves an organization by ID
func (r *OrganizationRepository) GetByID(ctx context.Context, id string) (*model.Organization, error) {
	query := `
		SELECT id, name, subscription_plan, subscription_status, contact_email, contact_phone, billing_email,
		       billing_address, logo_url, website_url,
		       subscription_start_date, subscription_end_date, payment_due_date,
		       last_payment_date, payment_method, payment_method_details, auto_renew, email_reminders,
		       created_at, updated_at
		FROM organizations
		WHERE id = $1
	`

	var org model.Organization

	err := r.db.QueryRow(ctx, query, id).Scan(
		&org.ID,
		&org.Name,
		&org.SubscriptionPlan,
		&org.SubscriptionStatus,
		&org.ContactEmail,
		&org.ContactPhone,
		&org.BillingEmail,
		&org.BillingAddress,
		&org.LogoURL,
		&org.WebsiteURL,
		&org.SubscriptionStartDate,
		&org.SubscriptionEndDate,
		&org.PaymentDueDate,
		&org.LastPaymentDate,
		&org.PaymentMethod,
		&org.PaymentMethodDetails,
		&org.AutoRenew,
		&org.EmailReminders,
		&org.CreatedAt,
		&org.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, database.ErrRecordNotFound
		}
		return nil, fmt.Errorf("failed to get organization by ID: %w", err)
	}

	return &org, nil
}

// Create creates a new organization
func (r *OrganizationRepository) Create(ctx context.Context, org *model.Organization) error {
	query := `
		INSERT INTO organizations (id, name, subscription_plan, subscription_status, contact_email, contact_phone, billing_email,
		                         billing_address, logo_url, website_url,
		                         subscription_start_date, subscription_end_date, payment_due_date,
		                         last_payment_date, payment_method, payment_method_details, auto_renew, email_reminders,
		                         created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
	`

	// Generate a new UUID if not provided
	if org.ID == "" {
		org.ID = uuid.New().String()
	}

	// Ensure created_at and updated_at are set
	now := time.Now().UTC()
	if org.CreatedAt.IsZero() {
		org.CreatedAt = now
	}
	if org.UpdatedAt.IsZero() {
		org.UpdatedAt = now
	}

	_, err := r.db.Exec(ctx, query,
		org.ID,
		org.Name,
		org.SubscriptionPlan,
		org.SubscriptionStatus,
		org.ContactEmail,
		org.ContactPhone,
		org.BillingEmail,
		org.BillingAddress,
		org.LogoURL,
		org.WebsiteURL,
		org.SubscriptionStartDate,
		org.SubscriptionEndDate,
		org.PaymentDueDate,
		org.LastPaymentDate,
		org.PaymentMethod,
		org.PaymentMethodDetails,
		org.AutoRenew,
		org.EmailReminders,
		org.CreatedAt,
		org.UpdatedAt,
	)

	if err != nil {
		if database.IsUniqueViolation(err) {
			return fmt.Errorf("organization with this name already exists: %w", database.ErrDuplicateKey)
		}
		return fmt.Errorf("failed to create organization: %w", err)
	}

	return nil
}

// Update updates an existing organization
func (r *OrganizationRepository) Update(ctx context.Context, org *model.Organization) error {
	query := `
		UPDATE organizations
		SET name = $1, subscription_plan = $2, subscription_status = $3, contact_email = $4, contact_phone = $5,
		    billing_email = $6, billing_address = $7, logo_url = $8, website_url = $9,
		    subscription_start_date = $10, subscription_end_date = $11, payment_due_date = $12,
		    last_payment_date = $13, payment_method = $14, payment_method_details = $15, auto_renew = $16, email_reminders = $17,
		    updated_at = $18
		WHERE id = $19
	`

	// Ensure updated_at is set
	org.UpdateTimestamp()

	_, err := r.db.Exec(ctx, query,
		org.Name,
		org.SubscriptionPlan,
		org.SubscriptionStatus,
		org.ContactEmail,
		org.ContactPhone,
		org.BillingEmail,
		org.BillingAddress,
		org.LogoURL,
		org.WebsiteURL,
		org.SubscriptionStartDate,
		org.SubscriptionEndDate,
		org.PaymentDueDate,
		org.LastPaymentDate,
		org.PaymentMethod,
		org.PaymentMethodDetails,
		org.AutoRenew,
		org.EmailReminders,
		org.UpdatedAt,
		org.ID,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return database.ErrRecordNotFound
		}
		if database.IsUniqueViolation(err) {
			return fmt.Errorf("organization with this name already exists: %w", database.ErrDuplicateKey)
		}
		return fmt.Errorf("failed to update organization: %w", err)
	}

	return nil
}

// Delete deletes an organization
func (r *OrganizationRepository) Delete(ctx context.Context, id string) error {
	// Start a transaction to ensure atomicity
	return r.db.WithTx(ctx, func(tx pgx.Tx) error {
		// First, check if there are any users associated with this organization
		var userCount int
		err := tx.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE organization_id = $1", id).Scan(&userCount)
		if err != nil {
			return fmt.Errorf("failed to check users in organization: %w", err)
		}

		if userCount > 0 {
			return fmt.Errorf("cannot delete organization with active users: %w", database.ErrForeignKeyViolation)
		}

		// Delete the organization
		_, err = tx.Exec(ctx, "DELETE FROM organizations WHERE id = $1", id)
		if err != nil {
			if err == pgx.ErrNoRows {
				return database.ErrRecordNotFound
			}
			return fmt.Errorf("failed to delete organization: %w", err)
		}

		return nil
	})
}

// List retrieves a list of organizations with pagination
func (r *OrganizationRepository) List(ctx context.Context, limit, offset int) ([]*model.Organization, error) {
	query := `
		SELECT id, name, subscription_plan, subscription_status, contact_email, contact_phone, billing_email,
		       billing_address, logo_url, website_url,
		       subscription_start_date, subscription_end_date, payment_due_date,
		       last_payment_date, payment_method, payment_method_details, auto_renew, email_reminders,
		       created_at, updated_at
		FROM organizations
		ORDER BY name ASC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list organizations: %w", err)
	}

	return database.ScanRowsIntoSlice(ctx, rows, r.scanOrganization)
}

// ListPaginated retrieves a paginated list of organizations
func (r *OrganizationRepository) ListPaginated(ctx context.Context, params database.PaginationParams) ([]*model.Organization, error) {
	return r.List(ctx, params.Limit(), params.Offset())
}

// GetPaginatedOrganizations returns a paginated response of organizations
func (r *OrganizationRepository) GetPaginatedOrganizations(ctx context.Context, params database.PaginationParams) (database.PaginatedResponse, error) {
	organizations, err := r.ListPaginated(ctx, params)
	if err != nil {
		return database.PaginatedResponse{}, err
	}

	count, err := r.Count(ctx)
	if err != nil {
		return database.PaginatedResponse{}, err
	}

	return database.NewPaginatedResponse(organizations, params, count), nil
}

// Count counts the total number of organizations
func (r *OrganizationRepository) Count(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM organizations`

	var count int
	err := r.db.QueryRow(ctx, query).Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("failed to count organizations: %w", err)
	}

	return count, nil
}

// GetUserCount retrieves the number of users in an organization
func (r *OrganizationRepository) GetUserCount(ctx context.Context, organizationID string) (int, error) {
	query := `SELECT COUNT(*) FROM users WHERE organization_id = $1`

	var count int
	err := r.db.QueryRow(ctx, query, organizationID).Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("failed to count users in organization: %w", err)
	}

	return count, nil
}

// scanOrganization is a helper function to scan a row into an Organization struct
func (r *OrganizationRepository) scanOrganization(row pgx.Rows) (*model.Organization, error) {
	var org model.Organization

	err := row.Scan(
		&org.ID,
		&org.Name,
		&org.SubscriptionPlan,
		&org.SubscriptionStatus,
		&org.ContactEmail,
		&org.ContactPhone,
		&org.BillingEmail,
		&org.BillingAddress,
		&org.LogoURL,
		&org.WebsiteURL,
		&org.SubscriptionStartDate,
		&org.SubscriptionEndDate,
		&org.PaymentDueDate,
		&org.LastPaymentDate,
		&org.PaymentMethod,
		&org.PaymentMethodDetails,
		&org.AutoRenew,
		&org.EmailReminders,
		&org.CreatedAt,
		&org.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &org, nil
}
