package model

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// Common database errors
var (
	ErrRecordNotFound      = errors.New("record not found")
	ErrDuplicateKey        = errors.New("duplicate key violation")
	ErrForeignKeyViolation = errors.New("foreign key violation")
	ErrInvalidQuery        = errors.New("invalid query")
	ErrDeadlockDetected    = errors.New("deadlock detected")
)

// IsUniqueViolation checks if the error is a unique constraint violation
func IsUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505" // unique_violation
	}
	return false
}

// IsForeignKeyViolation checks if the error is a foreign key constraint violation
func IsForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23503" // foreign_key_violation
	}
	return false
}

// ClassifyError classifies a database error into a more user-friendly error
func ClassifyError(err error) error {
	if err == nil {
		return nil
	}

	// Check for pgx.ErrNoRows first
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrRecordNotFound
	}

	// Then check for PostgreSQL-specific errors
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505": // unique_violation
			return fmt.Errorf("%w: %s", ErrDuplicateKey, pgErr.Detail)
		case "23503": // foreign_key_violation
			return fmt.Errorf("%w: %s", ErrForeignKeyViolation, pgErr.Detail)
		case "42601", "42703", "42P01": // syntax_error, undefined_column, undefined_table
			return fmt.Errorf("%w: %s", ErrInvalidQuery, pgErr.Message)
		case "40P01": // deadlock_detected
			return fmt.Errorf("%w: %s", ErrDeadlockDetected, pgErr.Message)
		}
	}

	// Return the original error if it doesn't match any of the above
	return err
}

// BaseModel represents a database model with common fields
type BaseModel struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// NewBaseModel creates a new model with default values
func NewBaseModel(id string) BaseModel {
	now := time.Now().UTC()
	return BaseModel{
		ID:        id,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// UpdatedTimestamp updates the UpdatedAt field
func (m *BaseModel) UpdatedTimestamp() {
	m.UpdatedAt = time.Now().UTC()
}

// ScanRowsIntoSlice scans multiple rows into a slice of structs
func ScanRowsIntoSlice[T any](ctx context.Context, rows pgx.Rows, scanFn func(rows pgx.Rows) (T, error)) ([]T, error) {
	defer rows.Close()

	var result []T
	for rows.Next() {
		item, err := scanFn(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, item)
	}

	if err := rows.Err(); err != nil {
		return nil, ClassifyError(err)
	}

	return result, nil
}
