package model

import (
	"encoding/json"
	"time"
)

// EnvironmentType defines the possible types of environments
const (
	EnvironmentTypeKubernetes = "k8s"
	EnvironmentTypeLinux      = "linux"
	EnvironmentTypeDocker     = "docker"
)

// SnapshotType defines the possible types of environment snapshots
const (
	SnapshotTypeInitial        = "initial"
	SnapshotTypeTaskCompletion = "task_completion"
	SnapshotTypeFinal          = "final"
	SnapshotTypeCustom         = "custom"
)

// EnvironmentSpecs represents the resource specifications for an environment
type EnvironmentSpecs struct {
	CPU     string `json:"cpu"`
	Memory  string `json:"memory"`
	Storage string `json:"storage"`
}

// EnvironmentTemplate represents a template for assessment environments
type EnvironmentTemplate struct {
	ID             string           `json:"id"`
	OrganizationID string           `json:"organization_id"`
	Name           string           `json:"name"`
	Description    string           `json:"description"`
	Type           string           `json:"type"` // 'k8s', 'linux', 'docker', etc.
	Specs          EnvironmentSpecs `json:"specs"`
	Configuration  json.RawMessage  `json:"configuration"` // Software, services, configurations
	CreatedBy      string           `json:"created_by"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`
}

// NewEnvironmentTemplate creates a new environment template
func NewEnvironmentTemplate(orgID, name, envType string, specs EnvironmentSpecs) *EnvironmentTemplate {
	now := time.Now().UTC()
	return &EnvironmentTemplate{
		OrganizationID: orgID,
		Name:           name,
		Type:           envType,
		Specs:          specs,
		Configuration:  json.RawMessage("{}"),
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}

// EnvironmentSnapshot represents a snapshot of an environment
type EnvironmentSnapshot struct {
	ID               string    `json:"id"`
	AssessmentID     string    `json:"assessment_id"`
	SnapshotTime     time.Time `json:"snapshot_time"`
	SnapshotType     string    `json:"snapshot_type"` // 'initial', 'task_completion', 'final', 'custom'
	TaskID           string    `json:"task_id,omitempty"`
	SnapshotLocation string    `json:"snapshot_location"`
	RetentionPeriod  int       `json:"retention_period,omitempty"` // in days
	CreatedAt        time.Time `json:"created_at"`
}

// NewEnvironmentSnapshot creates a new environment snapshot
func NewEnvironmentSnapshot(assessmentID, snapshotType, location string) *EnvironmentSnapshot {
	now := time.Now().UTC()
	return &EnvironmentSnapshot{
		AssessmentID:     assessmentID,
		SnapshotTime:     now,
		SnapshotType:     snapshotType,
		SnapshotLocation: location,
		CreatedAt:        now,
	}
}

// CommandHistory represents a command executed in an environment
type CommandHistory struct {
	ID           string    `json:"id"`
	AssessmentID string    `json:"assessment_id"`
	TaskID       string    `json:"task_id,omitempty"`
	Command      string    `json:"command"`
	Timestamp    time.Time `json:"timestamp"`
	ExitCode     int       `json:"exit_code,omitempty"`
	Output       string    `json:"output,omitempty"`
	Duration     int       `json:"duration,omitempty"` // in milliseconds
}

// NewCommandHistory creates a new command history entry
func NewCommandHistory(assessmentID, command string) *CommandHistory {
	now := time.Now().UTC()
	return &CommandHistory{
		AssessmentID: assessmentID,
		Command:      command,
		Timestamp:    now,
	}
}

// FileChange represents a change to a file in an environment
type FileChange struct {
	ID           string    `json:"id"`
	AssessmentID string    `json:"assessment_id"`
	TaskID       string    `json:"task_id,omitempty"`
	FilePath     string    `json:"file_path"`
	ChangeType   string    `json:"change_type"` // 'create', 'modify', 'delete'
	Content      string    `json:"content,omitempty"`
	Timestamp    time.Time `json:"timestamp"`
}

// NewFileChange creates a new file change entry
func NewFileChange(assessmentID, filePath, changeType, content string) *FileChange {
	now := time.Now().UTC()
	return &FileChange{
		AssessmentID: assessmentID,
		FilePath:     filePath,
		ChangeType:   changeType,
		Content:      content,
		Timestamp:    now,
	}
}
