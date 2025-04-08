package model

import (
	"time"
)

// TaskStatus defines the possible statuses of an assessment task
const (
	TaskStatusPending    = "pending"
	TaskStatusInProgress = "in_progress"
	TaskStatusCompleted  = "completed"
	TaskStatusFailed     = "failed"
	TaskStatusSkipped    = "skipped"
)

// TaskTemplate represents a template for assessment tasks
type TaskTemplate struct {
	ID                     string    `json:"id"`
	OrganizationID         string    `json:"organization_id"`
	Name                   string    `json:"name"`
	Description            string    `json:"description"`
	Instructions           string    `json:"instructions"`
	TimeLimit              *int      `json:"time_limit"` // in seconds, nil for no limit
	Points                 int       `json:"points"`
	ValidationScript       string    `json:"validation_script"`
	ReadinessScript        string    `json:"readiness_script"`
	EnvironmentSetupScript string    `json:"environment_setup_script"`
	CreatedBy              string    `json:"created_by"`
	CreatedAt              time.Time `json:"created_at"`
	UpdatedAt              time.Time `json:"updated_at"`
}

// NewTaskTemplate creates a new task template
func NewTaskTemplate(orgID, name, instructions string, timeLimit *int) *TaskTemplate {
	now := time.Now().UTC()
	return &TaskTemplate{
		OrganizationID: orgID,
		Name:           name,
		Instructions:   instructions,
		TimeLimit:      timeLimit,
		Points:         0,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}

// AssessmentTask represents an instance of a task template within an assessment
type AssessmentTask struct {
	ID             string        `json:"id"`
	AssessmentID   string        `json:"assessment_id"`
	TaskTemplateID string        `json:"task_template_id"`
	Status         string        `json:"status"`
	StartTime      time.Time     `json:"start_time,omitempty"`
	CompletionTime time.Time     `json:"completion_time,omitempty"`
	Score          *int          `json:"score,omitempty"`
	Attempts       int           `json:"attempts"`
	Notes          string        `json:"notes,omitempty"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
	TaskTemplate   *TaskTemplate `json:"task_template,omitempty"`
}

// NewAssessmentTask creates a new assessment task
func NewAssessmentTask(assessmentID, taskTemplateID string) *AssessmentTask {
	now := time.Now().UTC()
	return &AssessmentTask{
		AssessmentID:   assessmentID,
		TaskTemplateID: taskTemplateID,
		Status:         TaskStatusPending,
		Attempts:       0,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}

// Start marks the task as started
func (t *AssessmentTask) Start() {
	t.Status = TaskStatusInProgress
	t.StartTime = time.Now().UTC()
	t.UpdatedAt = t.StartTime
}

// Complete marks the task as completed with a score
func (t *AssessmentTask) Complete(score int) {
	t.Status = TaskStatusCompleted
	t.CompletionTime = time.Now().UTC()
	t.Score = &score
	t.UpdatedAt = t.CompletionTime
}

// Fail marks the task as failed
func (t *AssessmentTask) Fail() {
	t.Status = TaskStatusFailed
	t.CompletionTime = time.Now().UTC()
	t.UpdatedAt = t.CompletionTime
}

// Skip marks the task as skipped
func (t *AssessmentTask) Skip() {
	t.Status = TaskStatusSkipped
	t.CompletionTime = time.Now().UTC()
	t.UpdatedAt = t.CompletionTime
}

// IncrementAttempts increments the number of attempts
func (t *AssessmentTask) IncrementAttempts() {
	t.Attempts++
	t.UpdatedAt = time.Now().UTC()
}

// IsCompleted returns true if the task is completed
func (t *AssessmentTask) IsCompleted() bool {
	return t.Status == TaskStatusCompleted
}

// IsFailed returns true if the task is failed
func (t *AssessmentTask) IsFailed() bool {
	return t.Status == TaskStatusFailed
}

// IsSkipped returns true if the task is skipped
func (t *AssessmentTask) IsSkipped() bool {
	return t.Status == TaskStatusSkipped
}

// IsInProgress returns true if the task is in progress
func (t *AssessmentTask) IsInProgress() bool {
	return t.Status == TaskStatusInProgress
}

// IsPending returns true if the task is pending
func (t *AssessmentTask) IsPending() bool {
	return t.Status == TaskStatusPending
}

// Duration returns the duration of the task in seconds
func (t *AssessmentTask) Duration() int {
	if t.IsInProgress() {
		return int(time.Since(t.StartTime).Seconds())
	}
	if t.IsCompleted() || t.IsFailed() || t.IsSkipped() {
		return int(t.CompletionTime.Sub(t.StartTime).Seconds())
	}
	return 0
}
