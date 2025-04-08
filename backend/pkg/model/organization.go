package model

import (
	"strings"
	"time"
)

// Organization subscription plans
const (
	OrgPlanStarter    = "starter"
	OrgPlanTeam       = "team"
	OrgPlanEnterprise = "enterprise"
)

// Organization represents an organization in the system
type Organization struct {
	ID                 string `json:"id"`
	Name               string `json:"name"`
	SubscriptionPlan   string `json:"subscription_plan"`
	SubscriptionStatus string `json:"subscription_status"`
	ContactEmail       string `json:"contact_email"`
	ContactPhone       string `json:"contact_phone,omitempty"`
	BillingEmail       string `json:"billing_email,omitempty"`
	BillingAddress     string `json:"billing_address,omitempty"`
	LogoURL            string `json:"logo_url,omitempty"`
	WebsiteURL         string `json:"website_url,omitempty"`
	// Subscription fields
	SubscriptionStartDate time.Time `json:"subscription_start_date"`
	SubscriptionEndDate   time.Time `json:"subscription_end_date"`
	PaymentDueDate        time.Time `json:"payment_due_date,omitempty"`
	LastPaymentDate       time.Time `json:"last_payment_date,omitempty"`
	PaymentMethod         string    `json:"payment_method,omitempty"`
	PaymentMethodDetails  string    `json:"payment_method_details,omitempty"`
	AutoRenew             bool      `json:"auto_renew"`
	EmailReminders        bool      `json:"email_reminders"`
	// Legacy fields that will be moved to quota system
	MaxUsers        int       `json:"max_users"`
	MaxTemplates    int       `json:"max_templates"`
	MaxEnvironments int       `json:"max_environments"`
	MaxRuntime      int       `json:"max_runtime_minutes"` // in minutes
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// NewOrganization creates a new organization with default values
func NewOrganization(id, name, contactEmail string) *Organization {
	now := time.Now().UTC()
	thirtyDaysLater := now.AddDate(0, 1, 0)

	return &Organization{
		ID:                    id,
		Name:                  strings.TrimSpace(name),
		SubscriptionPlan:      OrgPlanStarter,
		SubscriptionStatus:    SubscriptionStatusTrial,
		ContactEmail:          strings.ToLower(strings.TrimSpace(contactEmail)),
		SubscriptionStartDate: now,
		SubscriptionEndDate:   thirtyDaysLater,
		PaymentDueDate:        thirtyDaysLater,
		AutoRenew:             true,
		EmailReminders:        true,
		MaxUsers:              10,
		MaxTemplates:          5,
		MaxEnvironments:       2,
		MaxRuntime:            120, // 2 hours
		CreatedAt:             now,
		UpdatedAt:             now,
	}
}

// IsEnterprise returns true if the organization has an enterprise subscription
func (o *Organization) IsEnterprise() bool {
	return o.SubscriptionPlan == OrgPlanEnterprise
}

// IsTeam returns true if the organization has a team subscription
func (o *Organization) IsTeam() bool {
	return o.SubscriptionPlan == OrgPlanTeam
}

// IsStarter returns true if the organization has a starter subscription
func (o *Organization) IsStarter() bool {
	return o.SubscriptionPlan == OrgPlanStarter
}

// HasActiveSubscription returns true if the organization has an active subscription
func (o *Organization) HasActiveSubscription() bool {
	return o.SubscriptionStatus == SubscriptionStatusActive
}

// IsTrialActive returns true if the organization is on an active trial
func (o *Organization) IsTrialActive() bool {
	return o.SubscriptionStatus == SubscriptionStatusTrial && time.Now().UTC().Before(o.SubscriptionEndDate)
}

// IsSubscriptionExpired returns true if the organization's subscription has expired
func (o *Organization) IsSubscriptionExpired() bool {
	return time.Now().UTC().After(o.SubscriptionEndDate)
}

// DaysUntilExpiration returns the number of days until the subscription expires
func (o *Organization) DaysUntilExpiration() int {
	now := time.Now().UTC()
	if now.After(o.SubscriptionEndDate) {
		return 0
	}
	return int(o.SubscriptionEndDate.Sub(now).Hours() / 24)
}

// UpdateTimestamp updates the updated_at timestamp to the current time
func (o *Organization) UpdateTimestamp() {
	o.UpdatedAt = time.Now().UTC()
}

// OrganizationProfile returns a map of public organization information
func (o *Organization) OrganizationProfile() map[string]interface{} {
	return map[string]interface{}{
		"id":                    o.ID,
		"name":                  o.Name,
		"subscription_plan":     o.SubscriptionPlan,
		"subscription_status":   o.SubscriptionStatus,
		"logo_url":              o.LogoURL,
		"website_url":           o.WebsiteURL,
		"max_users":             o.MaxUsers,
		"max_templates":         o.MaxTemplates,
		"max_environments":      o.MaxEnvironments,
		"max_runtime":           o.MaxRuntime,
		"subscription_end_date": o.SubscriptionEndDate,
		"created_at":            o.CreatedAt,
	}
}

// Validate performs basic validation on the organization data
func (o *Organization) Validate() map[string]string {
	errors := make(map[string]string)

	// Name validation
	if o.Name == "" {
		errors["name"] = "Organization name is required"
	}

	// Email validation
	if o.ContactEmail == "" {
		errors["contact_email"] = "Contact email is required"
	} else if !strings.Contains(o.ContactEmail, "@") || !strings.Contains(o.ContactEmail, ".") {
		errors["contact_email"] = "Invalid contact email format"
	}

	// Plan validation
	switch o.SubscriptionPlan {
	case OrgPlanStarter, OrgPlanTeam, OrgPlanEnterprise:
		// Valid plan
	default:
		errors["subscription_plan"] = "Invalid subscription plan"
	}

	// Status validation
	switch o.SubscriptionStatus {
	case SubscriptionStatusActive, SubscriptionStatusInactive, SubscriptionStatusCanceled,
		SubscriptionStatusSuspended, SubscriptionStatusPastDue, SubscriptionStatusTrial:
		// Valid status
	default:
		errors["subscription_status"] = "Invalid subscription status"
	}

	// Validate limits
	if o.MaxUsers < 1 {
		errors["max_users"] = "Maximum users must be at least 1"
	}
	if o.MaxTemplates < 1 {
		errors["max_templates"] = "Maximum templates must be at least 1"
	}
	if o.MaxEnvironments < 1 {
		errors["max_environments"] = "Maximum environments must be at least 1"
	}
	if o.MaxRuntime < 15 {
		errors["max_runtime"] = "Maximum runtime must be at least 15 minutes"
	}

	return errors
}
