package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AssessmentRepository handles database operations for assessments
type AssessmentRepository struct {
	db *pgxpool.Pool
}

// NewAssessmentRepository creates a new assessment repository
func NewAssessmentRepository(db *pgxpool.Pool) *AssessmentRepository {
	return &AssessmentRepository{
		db: db,
	}
}

// Create inserts a new assessment
func (r *AssessmentRepository) Create(ctx context.Context, assessment *model.Assessment) error {
	query := `
		INSERT INTO assessments (
			assessment_template_id, candidate_id, status, scheduled_start_time,
			actual_start_time, completion_time, total_score, environment_id,
			feedback, created_by, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`

	now := time.Now().UTC()
	assessment.CreatedAt = now
	assessment.UpdatedAt = now

	return r.db.QueryRow(ctx, query,
		assessment.AssessmentTemplateID, assessment.CandidateID, assessment.Status, assessment.ScheduledStartTime,
		assessment.ActualStartTime, assessment.CompletionTime, assessment.TotalScore, assessment.EnvironmentID,
		assessment.Feedback, assessment.CreatedBy, assessment.CreatedAt, assessment.UpdatedAt,
	).Scan(&assessment.ID)
}

// GetByID retrieves an assessment by ID
func (r *AssessmentRepository) GetByID(ctx context.Context, id string) (*model.Assessment, error) {
	query := `
		SELECT
			id, assessment_template_id, candidate_id, status, scheduled_start_time,
			actual_start_time, completion_time, total_score, environment_id,
			feedback, created_by, created_at, updated_at
		FROM assessments
		WHERE id = $1
	`

	assessment := &model.Assessment{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&assessment.ID, &assessment.AssessmentTemplateID, &assessment.CandidateID, &assessment.Status, &assessment.ScheduledStartTime,
		&assessment.ActualStartTime, &assessment.CompletionTime, &assessment.TotalScore, &assessment.EnvironmentID,
		&assessment.Feedback, &assessment.CreatedBy, &assessment.CreatedAt, &assessment.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("assessment not found: %s", id)
		}
		return nil, err
	}

	return assessment, nil
}

// Update updates an existing assessment
func (r *AssessmentRepository) Update(ctx context.Context, assessment *model.Assessment) error {
	query := `
		UPDATE assessments
		SET
			status = $1,
			scheduled_start_time = $2,
			actual_start_time = $3,
			completion_time = $4,
			total_score = $5,
			environment_id = $6,
			feedback = $7,
			updated_at = $8
		WHERE id = $9
	`

	assessment.UpdatedAt = time.Now().UTC()

	_, err := r.db.Exec(ctx, query,
		assessment.Status, assessment.ScheduledStartTime, assessment.ActualStartTime, assessment.CompletionTime,
		assessment.TotalScore, assessment.EnvironmentID, assessment.Feedback, assessment.UpdatedAt, assessment.ID,
	)
	return err
}

// ListByCandidate lists all assessments for a candidate
func (r *AssessmentRepository) ListByCandidate(ctx context.Context, candidateID string) ([]*model.Assessment, error) {
	query := `
		SELECT
			id, assessment_template_id, candidate_id, status, scheduled_start_time,
			actual_start_time, completion_time, total_score, environment_id,
			feedback, created_by, created_at, updated_at
		FROM assessments
		WHERE candidate_id = $1
		ORDER BY scheduled_start_time DESC
	`

	return r.queryAssessments(ctx, query, candidateID)
}

// ListByTemplate lists all assessments for a template
func (r *AssessmentRepository) ListByTemplate(ctx context.Context, templateID string) ([]*model.Assessment, error) {
	query := `
		SELECT
			id, assessment_template_id, candidate_id, status, scheduled_start_time,
			actual_start_time, completion_time, total_score, environment_id,
			feedback, created_by, created_at, updated_at
		FROM assessments
		WHERE assessment_template_id = $1
		ORDER BY scheduled_start_time DESC
	`

	return r.queryAssessments(ctx, query, templateID)
}

// ListActiveByOrganization lists all active assessments for an organization
func (r *AssessmentRepository) ListActiveByOrganization(ctx context.Context, organizationID string) ([]*model.Assessment, error) {
	query := `
		SELECT
			a.id, a.assessment_template_id, a.candidate_id, a.status, a.scheduled_start_time,
			a.actual_start_time, a.completion_time, a.total_score, a.environment_id,
			a.feedback, a.created_by, a.created_at, a.updated_at
		FROM assessments a
		JOIN assessment_templates at ON a.assessment_template_id = at.id
		WHERE at.organization_id = $1 AND a.status IN ('scheduled', 'in_progress')
		ORDER BY a.scheduled_start_time
	`

	return r.queryAssessments(ctx, query, organizationID)
}

// queryAssessments is a helper function for running assessment queries
func (r *AssessmentRepository) queryAssessments(ctx context.Context, query string, args ...interface{}) ([]*model.Assessment, error) {
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	assessments := []*model.Assessment{}
	for rows.Next() {
		assessment := &model.Assessment{}
		err := rows.Scan(
			&assessment.ID, &assessment.AssessmentTemplateID, &assessment.CandidateID, &assessment.Status, &assessment.ScheduledStartTime,
			&assessment.ActualStartTime, &assessment.CompletionTime, &assessment.TotalScore, &assessment.EnvironmentID,
			&assessment.Feedback, &assessment.CreatedBy, &assessment.CreatedAt, &assessment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		assessments = append(assessments, assessment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return assessments, nil
}

// GetAssessmentWithTasksAndTemplate retrieves an assessment with its tasks and template
func (r *AssessmentRepository) GetAssessmentWithTasksAndTemplate(ctx context.Context, id string) (*model.Assessment, error) {
	// First get the assessment
	assessment, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Then get the template
	query := `
		SELECT
			id, organization_id, name, description, environment_template_id,
			total_time_limit, passing_score, internet_access, created_by, created_at, updated_at
		FROM assessment_templates
		WHERE id = $1
	`

	template := &model.AssessmentTemplate{}
	err = r.db.QueryRow(ctx, query, assessment.AssessmentTemplateID).Scan(
		&template.ID, &template.OrganizationID, &template.Name, &template.Description, &template.EnvironmentTemplateID,
		&template.TotalTimeLimit, &template.PassingScore, &template.InternetAccess, &template.CreatedBy, &template.CreatedAt, &template.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get assessment template: %w", err)
	}

	// Get the task weights
	weightsQuery := `
		SELECT task_template_id, weight
		FROM assessment_template_tasks
		WHERE assessment_template_id = $1
	`

	weightsRows, err := r.db.Query(ctx, weightsQuery, template.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get task weights: %w", err)
	}
	defer weightsRows.Close()

	template.TaskWeights = make(map[string]float64)
	for weightsRows.Next() {
		var taskID string
		var weight float64
		if err := weightsRows.Scan(&taskID, &weight); err != nil {
			return nil, fmt.Errorf("failed to scan task weight: %w", err)
		}
		template.TaskWeights[taskID] = weight
	}

	// Then get the tasks
	tasksQuery := `
		SELECT
			at.id, at.assessment_id, at.task_template_id, at.status, at.start_time,
			at.completion_time, at.score, at.attempts, at.notes, at.created_at, at.updated_at,
			tt.id, tt.organization_id, tt.name, tt.description, tt.instructions,
			tt.time_limit, tt.points, tt.validation_script, tt.readiness_script,
			tt.environment_setup_script, tt.created_by, tt.created_at, tt.updated_at
		FROM assessment_tasks at
		JOIN task_templates tt ON at.task_template_id = tt.id
		WHERE at.assessment_id = $1
		ORDER BY at.id
	`

	tasksRows, err := r.db.Query(ctx, tasksQuery, assessment.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get assessment tasks: %w", err)
	}
	defer tasksRows.Close()

	assessment.Tasks = []*model.AssessmentTask{}
	for tasksRows.Next() {
		task := &model.AssessmentTask{}
		taskTemplate := &model.TaskTemplate{}

		err := tasksRows.Scan(
			&task.ID, &task.AssessmentID, &task.TaskTemplateID, &task.Status, &task.StartTime,
			&task.CompletionTime, &task.Score, &task.Attempts, &task.Notes, &task.CreatedAt, &task.UpdatedAt,
			&taskTemplate.ID, &taskTemplate.OrganizationID, &taskTemplate.Name, &taskTemplate.Description, &taskTemplate.Instructions,
			&taskTemplate.TimeLimit, &taskTemplate.Points, &taskTemplate.ValidationScript, &taskTemplate.ReadinessScript,
			&taskTemplate.EnvironmentSetupScript, &taskTemplate.CreatedBy, &taskTemplate.CreatedAt, &taskTemplate.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan assessment task: %w", err)
		}

		task.TaskTemplate = taskTemplate
		assessment.Tasks = append(assessment.Tasks, task)
	}

	assessment.Template = template
	return assessment, nil
}

// CreateAssessmentTasks creates tasks for an assessment based on a template
func (r *AssessmentRepository) CreateAssessmentTasks(ctx context.Context, assessmentID string, templateID string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Get tasks from the template
	query := `
		SELECT task_template_id, order_index, dependencies
		FROM assessment_template_tasks
		WHERE assessment_template_id = $1
		ORDER BY order_index
	`

	rows, err := tx.Query(ctx, query, templateID)
	if err != nil {
		return fmt.Errorf("failed to get template tasks: %w", err)
	}
	defer rows.Close()

	// Insert each task
	insertQuery := `
		INSERT INTO assessment_tasks (
			assessment_id, task_template_id, status, attempts, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	now := time.Now().UTC()
	for rows.Next() {
		var taskTemplateID string
		var orderIndex int
		var dependenciesJSON []byte

		err := rows.Scan(&taskTemplateID, &orderIndex, &dependenciesJSON)
		if err != nil {
			return fmt.Errorf("failed to scan template task: %w", err)
		}

		// Insert the task
		_, err = tx.Exec(ctx, insertQuery,
			assessmentID, taskTemplateID, model.TaskStatusPending, 0, now, now,
		)
		if err != nil {
			return fmt.Errorf("failed to insert assessment task: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
