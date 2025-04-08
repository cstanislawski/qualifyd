package model

import (
	"time"
)

// AssessmentStatus defines the possible statuses of an assessment
const (
	AssessmentStatusScheduled  = "scheduled"
	AssessmentStatusInProgress = "in_progress"
	AssessmentStatusCompleted  = "completed"
	AssessmentStatusExpired    = "expired"
)

// Assessment represents an assessment instance assigned to a candidate
type Assessment struct {
	ID                   string              `json:"id"`
	AssessmentTemplateID string              `json:"assessment_template_id"`
	CandidateID          string              `json:"candidate_id"`
	Status               string              `json:"status"`
	ScheduledStartTime   time.Time           `json:"scheduled_start_time,omitempty"`
	ActualStartTime      time.Time           `json:"actual_start_time,omitempty"`
	CompletionTime       time.Time           `json:"completion_time,omitempty"`
	TotalScore           *int                `json:"total_score,omitempty"`
	EnvironmentID        string              `json:"environment_id,omitempty"`
	Feedback             string              `json:"feedback,omitempty"`
	CreatedBy            string              `json:"created_by"`
	CreatedAt            time.Time           `json:"created_at"`
	UpdatedAt            time.Time           `json:"updated_at"`
	Template             *AssessmentTemplate `json:"template,omitempty"`
	Tasks                []*AssessmentTask   `json:"tasks,omitempty"`
}

// NewAssessment creates a new assessment for a candidate
func NewAssessment(templateID, candidateID, createdBy string, scheduledStartTime time.Time) *Assessment {
	now := time.Now().UTC()
	return &Assessment{
		AssessmentTemplateID: templateID,
		CandidateID:          candidateID,
		Status:               AssessmentStatusScheduled,
		ScheduledStartTime:   scheduledStartTime,
		CreatedBy:            createdBy,
		CreatedAt:            now,
		UpdatedAt:            now,
	}
}

// Start marks the assessment as started
func (a *Assessment) Start() {
	a.Status = AssessmentStatusInProgress
	a.ActualStartTime = time.Now().UTC()
	a.UpdatedAt = a.ActualStartTime
}

// Complete marks the assessment as completed with the final score
func (a *Assessment) Complete(score int) {
	a.Status = AssessmentStatusCompleted
	a.CompletionTime = time.Now().UTC()
	a.TotalScore = &score
	a.UpdatedAt = a.CompletionTime
}

// Expire marks the assessment as expired
func (a *Assessment) Expire() {
	a.Status = AssessmentStatusExpired
	a.CompletionTime = time.Now().UTC()
	a.UpdatedAt = a.CompletionTime
}

// IsScheduled returns true if the assessment is scheduled
func (a *Assessment) IsScheduled() bool {
	return a.Status == AssessmentStatusScheduled
}

// IsInProgress returns true if the assessment is in progress
func (a *Assessment) IsInProgress() bool {
	return a.Status == AssessmentStatusInProgress
}

// IsCompleted returns true if the assessment is completed
func (a *Assessment) IsCompleted() bool {
	return a.Status == AssessmentStatusCompleted
}

// IsExpired returns true if the assessment is expired
func (a *Assessment) IsExpired() bool {
	return a.Status == AssessmentStatusExpired
}

// Duration returns the duration of the assessment in seconds
func (a *Assessment) Duration() int {
	if a.IsInProgress() {
		return int(time.Since(a.ActualStartTime).Seconds())
	}
	if a.IsCompleted() || a.IsExpired() {
		return int(a.CompletionTime.Sub(a.ActualStartTime).Seconds())
	}
	return 0
}

// TimeRemaining returns the time remaining for the assessment in seconds
// Returns -1 if the assessment doesn't have a time limit
func (a *Assessment) TimeRemaining() int {
	if a.Template == nil || a.Template.TotalTimeLimit == nil {
		return -1
	}

	if !a.IsInProgress() {
		return *a.Template.TotalTimeLimit
	}

	elapsed := a.Duration()
	remaining := *a.Template.TotalTimeLimit - elapsed
	if remaining < 0 {
		return 0
	}
	return remaining
}

// AssessmentTemplate represents a template for assessments
type AssessmentTemplate struct {
	ID                    string               `json:"id"`
	OrganizationID        string               `json:"organization_id"`
	Name                  string               `json:"name"`
	Description           string               `json:"description"`
	EnvironmentTemplateID string               `json:"environment_template_id"`
	TotalTimeLimit        *int                 `json:"total_time_limit"` // in seconds, nil for no limit
	PassingScore          int                  `json:"passing_score"`
	InternetAccess        bool                 `json:"internet_access"`
	CreatedBy             string               `json:"created_by"`
	CreatedAt             time.Time            `json:"created_at"`
	UpdatedAt             time.Time            `json:"updated_at"`
	EnvironmentTemplate   *EnvironmentTemplate `json:"environment_template,omitempty"`
	Tasks                 []*TaskTemplate      `json:"tasks,omitempty"`
	TaskWeights           map[string]float64   `json:"task_weights,omitempty"` // Maps task ID to weight
}

// NewAssessmentTemplate creates a new assessment template
func NewAssessmentTemplate(orgID, name, envTemplateID string, timeLimit *int) *AssessmentTemplate {
	now := time.Now().UTC()
	return &AssessmentTemplate{
		OrganizationID:        orgID,
		Name:                  name,
		EnvironmentTemplateID: envTemplateID,
		TotalTimeLimit:        timeLimit,
		PassingScore:          0,
		InternetAccess:        false,
		CreatedAt:             now,
		UpdatedAt:             now,
		TaskWeights:           make(map[string]float64),
	}
}

// AssessmentReview represents a review of an assessment
type AssessmentReview struct {
	ID             string    `json:"id"`
	AssessmentID   string    `json:"assessment_id"`
	ReviewerID     string    `json:"reviewer_id"`
	Score          int       `json:"score"`
	Comments       string    `json:"comments"`
	Recommendation string    `json:"recommendation"` // 'hire', 'consider', 'reject'
	ReviewTime     time.Time `json:"review_time"`
	UpdatedAt      time.Time `json:"updated_at"`
	Reviewer       *User     `json:"reviewer,omitempty"`
}

// NewAssessmentReview creates a new assessment review
func NewAssessmentReview(assessmentID, reviewerID string) *AssessmentReview {
	now := time.Now().UTC()
	return &AssessmentReview{
		AssessmentID: assessmentID,
		ReviewerID:   reviewerID,
		ReviewTime:   now,
		UpdatedAt:    now,
	}
}
