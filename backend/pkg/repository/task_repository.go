package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// TaskRepository handles database operations for task templates
type TaskRepository struct {
	db *pgxpool.Pool
}

// NewTaskRepository creates a new task repository
func NewTaskRepository(db *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{
		db: db,
	}
}

// Create inserts a new task template
func (r *TaskRepository) Create(ctx context.Context, task *model.TaskTemplate) error {
	query := `
		INSERT INTO task_templates (
			organization_id, name, description, instructions,
			time_limit, points, validation_script, readiness_script,
			environment_setup_script, created_by, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`

	now := time.Now().UTC()
	task.CreatedAt = now
	task.UpdatedAt = now

	return r.db.QueryRow(ctx, query,
		task.OrganizationID, task.Name, task.Description, task.Instructions,
		task.TimeLimit, task.Points, task.ValidationScript, task.ReadinessScript,
		task.EnvironmentSetupScript, task.CreatedBy, task.CreatedAt, task.UpdatedAt,
	).Scan(&task.ID)
}

// GetByID retrieves a task template by ID
func (r *TaskRepository) GetByID(ctx context.Context, id string) (*model.TaskTemplate, error) {
	query := `
		SELECT
			id, organization_id, name, description, instructions,
			time_limit, points, validation_script, readiness_script,
			environment_setup_script, created_by, created_at, updated_at
		FROM task_templates
		WHERE id = $1
	`

	task := &model.TaskTemplate{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&task.ID, &task.OrganizationID, &task.Name, &task.Description, &task.Instructions,
		&task.TimeLimit, &task.Points, &task.ValidationScript, &task.ReadinessScript,
		&task.EnvironmentSetupScript, &task.CreatedBy, &task.CreatedAt, &task.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("task template not found: %s", id)
		}
		return nil, err
	}

	return task, nil
}

// Update updates an existing task template
func (r *TaskRepository) Update(ctx context.Context, task *model.TaskTemplate) error {
	query := `
		UPDATE task_templates
		SET
			name = $1,
			description = $2,
			instructions = $3,
			time_limit = $4,
			points = $5,
			validation_script = $6,
			readiness_script = $7,
			environment_setup_script = $8,
			updated_at = $9
		WHERE id = $10
	`

	task.UpdatedAt = time.Now().UTC()

	_, err := r.db.Exec(ctx, query,
		task.Name, task.Description, task.Instructions,
		task.TimeLimit, task.Points, task.ValidationScript, task.ReadinessScript,
		task.EnvironmentSetupScript, task.UpdatedAt, task.ID,
	)
	return err
}

// Delete deletes a task template
func (r *TaskRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM task_templates WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

// ListByOrganization lists all task templates for an organization
func (r *TaskRepository) ListByOrganization(ctx context.Context, organizationID string) ([]*model.TaskTemplate, error) {
	query := `
		SELECT
			id, organization_id, name, description, instructions,
			time_limit, points, validation_script, readiness_script,
			environment_setup_script, created_by, created_at, updated_at
		FROM task_templates
		WHERE organization_id = $1
		ORDER BY name
	`

	rows, err := r.db.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []*model.TaskTemplate{}
	for rows.Next() {
		task := &model.TaskTemplate{}
		err := rows.Scan(
			&task.ID, &task.OrganizationID, &task.Name, &task.Description, &task.Instructions,
			&task.TimeLimit, &task.Points, &task.ValidationScript, &task.ReadinessScript,
			&task.EnvironmentSetupScript, &task.CreatedBy, &task.CreatedAt, &task.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tasks, nil
}

// Search searches for task templates by name or description
func (r *TaskRepository) Search(ctx context.Context, organizationID, query string) ([]*model.TaskTemplate, error) {
	sqlQuery := `
		SELECT
			id, organization_id, name, description, instructions,
			time_limit, points, validation_script, readiness_script,
			environment_setup_script, created_by, created_at, updated_at
		FROM task_templates
		WHERE organization_id = $1 AND (name ILIKE $2 OR description ILIKE $2)
		ORDER BY name
	`

	searchPattern := "%" + query + "%"
	rows, err := r.db.Query(ctx, sqlQuery, organizationID, searchPattern)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []*model.TaskTemplate{}
	for rows.Next() {
		task := &model.TaskTemplate{}
		err := rows.Scan(
			&task.ID, &task.OrganizationID, &task.Name, &task.Description, &task.Instructions,
			&task.TimeLimit, &task.Points, &task.ValidationScript, &task.ReadinessScript,
			&task.EnvironmentSetupScript, &task.CreatedBy, &task.CreatedAt, &task.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tasks, nil
}
