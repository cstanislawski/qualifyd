package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// EnvironmentRepository handles database operations for environment templates
type EnvironmentRepository struct {
	db *pgxpool.Pool
}

// NewEnvironmentRepository creates a new environment repository
func NewEnvironmentRepository(db *pgxpool.Pool) *EnvironmentRepository {
	return &EnvironmentRepository{
		db: db,
	}
}

// Create inserts a new environment template
func (r *EnvironmentRepository) Create(ctx context.Context, env *model.EnvironmentTemplate) error {
	query := `
		INSERT INTO environment_templates (
			organization_id, name, description, type, specs, configuration,
			created_by, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`

	now := time.Now().UTC()
	env.CreatedAt = now
	env.UpdatedAt = now

	// Convert specs to JSON
	specsJSON, err := json.Marshal(env.Specs)
	if err != nil {
		return fmt.Errorf("failed to encode specs: %w", err)
	}

	return r.db.QueryRow(ctx, query,
		env.OrganizationID, env.Name, env.Description, env.Type, specsJSON, env.Configuration,
		env.CreatedBy, env.CreatedAt, env.UpdatedAt,
	).Scan(&env.ID)
}

// GetByID retrieves an environment template by ID
func (r *EnvironmentRepository) GetByID(ctx context.Context, id string) (*model.EnvironmentTemplate, error) {
	query := `
		SELECT
			id, organization_id, name, description, type, specs, configuration,
			created_by, created_at, updated_at
		FROM environment_templates
		WHERE id = $1
	`

	env := &model.EnvironmentTemplate{}
	var specsJSON []byte

	err := r.db.QueryRow(ctx, query, id).Scan(
		&env.ID, &env.OrganizationID, &env.Name, &env.Description, &env.Type, &specsJSON, &env.Configuration,
		&env.CreatedBy, &env.CreatedAt, &env.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("environment template not found: %s", id)
		}
		return nil, err
	}

	// Parse specs from JSON
	err = json.Unmarshal(specsJSON, &env.Specs)
	if err != nil {
		return nil, fmt.Errorf("failed to decode specs: %w", err)
	}

	return env, nil
}

// Update updates an existing environment template
func (r *EnvironmentRepository) Update(ctx context.Context, env *model.EnvironmentTemplate) error {
	query := `
		UPDATE environment_templates
		SET
			name = $1,
			description = $2,
			type = $3,
			specs = $4,
			configuration = $5,
			updated_at = $6
		WHERE id = $7
	`

	env.UpdatedAt = time.Now().UTC()

	// Convert specs to JSON
	specsJSON, err := json.Marshal(env.Specs)
	if err != nil {
		return fmt.Errorf("failed to encode specs: %w", err)
	}

	_, err = r.db.Exec(ctx, query,
		env.Name, env.Description, env.Type, specsJSON, env.Configuration,
		env.UpdatedAt, env.ID,
	)
	return err
}

// Delete deletes an environment template
func (r *EnvironmentRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM environment_templates WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

// ListByOrganization lists all environment templates for an organization
func (r *EnvironmentRepository) ListByOrganization(ctx context.Context, organizationID string) ([]*model.EnvironmentTemplate, error) {
	query := `
		SELECT
			id, organization_id, name, description, type, specs, configuration,
			created_by, created_at, updated_at
		FROM environment_templates
		WHERE organization_id = $1
		ORDER BY name
	`

	rows, err := r.db.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	envs := []*model.EnvironmentTemplate{}
	for rows.Next() {
		env := &model.EnvironmentTemplate{}
		var specsJSON []byte

		err := rows.Scan(
			&env.ID, &env.OrganizationID, &env.Name, &env.Description, &env.Type, &specsJSON, &env.Configuration,
			&env.CreatedBy, &env.CreatedAt, &env.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Parse specs from JSON
		err = json.Unmarshal(specsJSON, &env.Specs)
		if err != nil {
			return nil, fmt.Errorf("failed to decode specs: %w", err)
		}

		envs = append(envs, env)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return envs, nil
}

// ListByType lists all environment templates for an organization with a specific type
func (r *EnvironmentRepository) ListByType(ctx context.Context, organizationID, envType string) ([]*model.EnvironmentTemplate, error) {
	query := `
		SELECT
			id, organization_id, name, description, type, specs, configuration,
			created_by, created_at, updated_at
		FROM environment_templates
		WHERE organization_id = $1 AND type = $2
		ORDER BY name
	`

	rows, err := r.db.Query(ctx, query, organizationID, envType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	envs := []*model.EnvironmentTemplate{}
	for rows.Next() {
		env := &model.EnvironmentTemplate{}
		var specsJSON []byte

		err := rows.Scan(
			&env.ID, &env.OrganizationID, &env.Name, &env.Description, &env.Type, &specsJSON, &env.Configuration,
			&env.CreatedBy, &env.CreatedAt, &env.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Parse specs from JSON
		err = json.Unmarshal(specsJSON, &env.Specs)
		if err != nil {
			return nil, fmt.Errorf("failed to decode specs: %w", err)
		}

		envs = append(envs, env)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return envs, nil
}
