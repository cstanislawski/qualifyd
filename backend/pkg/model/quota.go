package model

import (
	"encoding/json"
	"errors"
	"time"
)

// Subscription status constants
const (
	SubscriptionStatusActive    = "active"
	SubscriptionStatusInactive  = "inactive"
	SubscriptionStatusCanceled  = "canceled"
	SubscriptionStatusSuspended = "suspended"
	SubscriptionStatusPastDue   = "past_due"
	SubscriptionStatusTrial     = "trial"
)

// Billing status constants
const (
	BillingStatusPending    = "pending"
	BillingStatusSuccessful = "successful"
	BillingStatusFailed     = "failed"
	BillingStatusRefunded   = "refunded"
)

// Resource type constants
const (
	ResourceTypeAssessmentCreated  = "assessment_created"
	ResourceTypeEnvironmentMinutes = "environment_minutes"
)

// Subscription-related errors
var (
	ErrSubscriptionInactive      = errors.New("subscription is inactive")
	ErrSubscriptionExpired       = errors.New("subscription has expired")
	ErrTrialExpired              = errors.New("trial period has expired")
	ErrSubscriptionLimitExceeded = errors.New("subscription limit exceeded")
	ErrQuotaLimitExceeded        = errors.New("organization quota limit exceeded")
)

// OrganizationQuota represents the usage limits and current usage for an organization
type OrganizationQuota struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organization_id"`

	// User quotas
	MaxUsers     int `json:"max_users"`
	CurrentUsers int `json:"current_users"`

	// Template quotas
	MaxTaskTemplates            int `json:"max_task_templates"`
	CurrentTaskTemplates        int `json:"current_task_templates"`
	MaxEnvironmentTemplates     int `json:"max_environment_templates"`
	CurrentEnvironmentTemplates int `json:"current_environment_templates"`
	MaxAssessmentTemplates      int `json:"max_assessment_templates"`
	CurrentAssessmentTemplates  int `json:"current_assessment_templates"`

	// Assessment quotas
	MaxAssessmentsPerMonth    int `json:"max_assessments_per_month"`
	AssessmentsThisMonth      int `json:"assessments_this_month"`
	MaxConcurrentEnvironments int `json:"max_concurrent_environments"`
	CurrentActiveEnvironments int `json:"current_active_environments"`

	// Resource quotas
	IncludedEnvironmentMinutes   int `json:"included_environment_minutes"`
	UsedEnvironmentMinutes       int `json:"used_environment_minutes"`
	MaxEnvironmentRuntimeMinutes int `json:"max_environment_runtime_minutes"`
	MaxSnapshotRetentionDays     int `json:"max_snapshot_retention_days"`

	// Tracking fields
	UpdatedAt time.Time `json:"updated_at"`
	CreatedAt time.Time `json:"created_at"`
}

// NewOrganizationQuota creates a new organization quota with default values based on plan type
func NewOrganizationQuota(organizationID, planType string) *OrganizationQuota {
	now := time.Now().UTC()
	quota := &OrganizationQuota{
		OrganizationID: organizationID,
		UpdatedAt:      now,
		CreatedAt:      now,
	}

	// Set default values based on plan type
	switch planType {
	case OrgPlanStarter:
		quota.MaxUsers = 10
		quota.MaxTaskTemplates = 5
		quota.MaxEnvironmentTemplates = 5
		quota.MaxAssessmentTemplates = 5
		quota.MaxAssessmentsPerMonth = 10
		quota.MaxConcurrentEnvironments = 2
		quota.IncludedEnvironmentMinutes = 900
		quota.MaxEnvironmentRuntimeMinutes = 120
		quota.MaxSnapshotRetentionDays = 7
	case OrgPlanTeam:
		quota.MaxUsers = 100 // Unlimited but set a high value
		quota.MaxTaskTemplates = 20
		quota.MaxEnvironmentTemplates = 20
		quota.MaxAssessmentTemplates = 20
		quota.MaxAssessmentsPerMonth = 40
		quota.MaxConcurrentEnvironments = 10
		quota.IncludedEnvironmentMinutes = 3600
		quota.MaxEnvironmentRuntimeMinutes = 480 // 8 hours
		quota.MaxSnapshotRetentionDays = 30
	case OrgPlanEnterprise:
		quota.MaxUsers = 1000 // Unlimited but set a very high value
		quota.MaxTaskTemplates = 100
		quota.MaxEnvironmentTemplates = 100
		quota.MaxAssessmentTemplates = 100
		quota.MaxAssessmentsPerMonth = 1000
		quota.MaxConcurrentEnvironments = 50
		quota.IncludedEnvironmentMinutes = 10000
		quota.MaxEnvironmentRuntimeMinutes = 1440 // 24 hours
		quota.MaxSnapshotRetentionDays = 90
	default:
		// Use starter plan limits as default
		quota.MaxUsers = 10
		quota.MaxTaskTemplates = 5
		quota.MaxEnvironmentTemplates = 5
		quota.MaxAssessmentTemplates = 5
		quota.MaxAssessmentsPerMonth = 10
		quota.MaxConcurrentEnvironments = 2
		quota.IncludedEnvironmentMinutes = 900
		quota.MaxEnvironmentRuntimeMinutes = 120
		quota.MaxSnapshotRetentionDays = 7
	}

	return quota
}

// HasReachedUserLimit checks if the organization has reached its user limit
func (q *OrganizationQuota) HasReachedUserLimit() bool {
	return q.CurrentUsers >= q.MaxUsers
}

// HasReachedAssessmentLimit checks if the organization has reached its monthly assessment limit
func (q *OrganizationQuota) HasReachedAssessmentLimit() bool {
	return q.AssessmentsThisMonth >= q.MaxAssessmentsPerMonth
}

// HasReachedEnvironmentLimit checks if the organization has reached its concurrent environment limit
func (q *OrganizationQuota) HasReachedEnvironmentLimit() bool {
	return q.CurrentActiveEnvironments >= q.MaxConcurrentEnvironments
}

// HasReachedTaskTemplateLimit checks if the organization has reached its task template limit
func (q *OrganizationQuota) HasReachedTaskTemplateLimit() bool {
	return q.CurrentTaskTemplates >= q.MaxTaskTemplates
}

// HasReachedEnvironmentTemplateLimit checks if the organization has reached its environment template limit
func (q *OrganizationQuota) HasReachedEnvironmentTemplateLimit() bool {
	return q.CurrentEnvironmentTemplates >= q.MaxEnvironmentTemplates
}

// HasReachedAssessmentTemplateLimit checks if the organization has reached its assessment template limit
func (q *OrganizationQuota) HasReachedAssessmentTemplateLimit() bool {
	return q.CurrentAssessmentTemplates >= q.MaxAssessmentTemplates
}

// RemainingEnvironmentMinutes returns the remaining environment minutes in the quota
func (q *OrganizationQuota) RemainingEnvironmentMinutes() int {
	remaining := q.IncludedEnvironmentMinutes - q.UsedEnvironmentMinutes
	if remaining < 0 {
		return 0
	}
	return remaining
}

// UsagePercentage returns the percentage of usage for a specific resource
func (q *OrganizationQuota) UsagePercentage(resourceType string) float64 {
	switch resourceType {
	case "users":
		if q.MaxUsers == 0 {
			return 0
		}
		return float64(q.CurrentUsers) / float64(q.MaxUsers) * 100
	case "task_templates":
		if q.MaxTaskTemplates == 0 {
			return 0
		}
		return float64(q.CurrentTaskTemplates) / float64(q.MaxTaskTemplates) * 100
	case "environment_templates":
		if q.MaxEnvironmentTemplates == 0 {
			return 0
		}
		return float64(q.CurrentEnvironmentTemplates) / float64(q.MaxEnvironmentTemplates) * 100
	case "assessment_templates":
		if q.MaxAssessmentTemplates == 0 {
			return 0
		}
		return float64(q.CurrentAssessmentTemplates) / float64(q.MaxAssessmentTemplates) * 100
	case "assessments":
		if q.MaxAssessmentsPerMonth == 0 {
			return 0
		}
		return float64(q.AssessmentsThisMonth) / float64(q.MaxAssessmentsPerMonth) * 100
	case "environments":
		if q.MaxConcurrentEnvironments == 0 {
			return 0
		}
		return float64(q.CurrentActiveEnvironments) / float64(q.MaxConcurrentEnvironments) * 100
	case "environment_minutes":
		if q.IncludedEnvironmentMinutes == 0 {
			return 0
		}
		return float64(q.UsedEnvironmentMinutes) / float64(q.IncludedEnvironmentMinutes) * 100
	default:
		return 0
	}
}

// BillingRecord represents a payment transaction for an organization
type BillingRecord struct {
	ID                 string    `json:"id"`
	OrganizationID     string    `json:"organization_id"`
	Amount             float64   `json:"amount"`
	Currency           string    `json:"currency"`
	TransactionID      string    `json:"transaction_id,omitempty"`
	PaymentMethod      string    `json:"payment_method,omitempty"`
	Status             string    `json:"status"`
	Description        string    `json:"description,omitempty"`
	InvoiceURL         string    `json:"invoice_url,omitempty"`
	ReceiptURL         string    `json:"receipt_url,omitempty"`
	PaymentDate        time.Time `json:"payment_date,omitempty"`
	BillingPeriodStart time.Time `json:"billing_period_start,omitempty"`
	BillingPeriodEnd   time.Time `json:"billing_period_end,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
}

// NewBillingRecord creates a new billing record
func NewBillingRecord(organizationID string, amount float64, status string, description string) *BillingRecord {
	return &BillingRecord{
		OrganizationID: organizationID,
		Amount:         amount,
		Currency:       "USD",
		Status:         status,
		Description:    description,
		CreatedAt:      time.Now().UTC(),
	}
}

// UsageRecord represents a record of resource usage in the system
type UsageRecord struct {
	ID                    string          `json:"id"`
	OrganizationID        string          `json:"organization_id"`
	ResourceType          string          `json:"resource_type"`
	Quantity              float64         `json:"quantity"`
	UsageDate             time.Time       `json:"usage_date"`
	AssessmentID          string          `json:"assessment_id,omitempty"`
	EnvironmentTemplateID string          `json:"environment_template_id,omitempty"`
	UserID                string          `json:"user_id,omitempty"`
	Details               json.RawMessage `json:"details,omitempty"`
	CreatedAt             time.Time       `json:"created_at"`
}

// NewUsageRecord creates a new usage record
func NewUsageRecord(organizationID, resourceType string, quantity float64) *UsageRecord {
	now := time.Now().UTC()
	return &UsageRecord{
		OrganizationID: organizationID,
		ResourceType:   resourceType,
		Quantity:       quantity,
		UsageDate:      now,
		CreatedAt:      now,
	}
}

// WithAssessment adds assessment information to the usage record
func (u *UsageRecord) WithAssessment(assessmentID string) *UsageRecord {
	u.AssessmentID = assessmentID
	return u
}

// WithUser adds user information to the usage record
func (u *UsageRecord) WithUser(userID string) *UsageRecord {
	u.UserID = userID
	return u
}

// WithEnvironmentTemplate adds environment template information to the usage record
func (u *UsageRecord) WithEnvironmentTemplate(templateID string) *UsageRecord {
	u.EnvironmentTemplateID = templateID
	return u
}

// WithDetails adds detailed information to the usage record
func (u *UsageRecord) WithDetails(details map[string]interface{}) *UsageRecord {
	detailsJSON, err := json.Marshal(details)
	if err == nil {
		u.Details = detailsJSON
	}
	return u
}
