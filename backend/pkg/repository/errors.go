package repository

import "errors"

// Common repository errors
var (
	// ErrUserNotFound is returned when a user is not found
	ErrUserNotFound = errors.New("user not found")

	// ErrOrganizationNotFound is returned when an organization is not found
	ErrOrganizationNotFound = errors.New("organization not found")

	// ErrDuplicateEmail is returned when trying to create a user with an email that already exists
	ErrDuplicateEmail = errors.New("email already exists")

	// ErrDuplicateOrganization is returned when trying to create an organization with a name that already exists
	ErrDuplicateOrganization = errors.New("organization name already exists")

	// ErrInvalidID is returned when an invalid ID is provided
	ErrInvalidID = errors.New("invalid ID")

	// ErrDatabaseOperation is returned when a database operation fails
	ErrDatabaseOperation = errors.New("database operation failed")
)
