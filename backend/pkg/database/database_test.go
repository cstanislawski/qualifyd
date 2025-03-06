package database

import (
	"context"
	"testing"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/config"
)

func TestBuildConnectionString(t *testing.T) {
	cfg := &config.DatabaseConfig{
		Host:     "localhost",
		Port:     5432,
		Name:     "testdb",
		User:     "testuser",
		Password: "testpass",
		SSLMode:  "disable",
	}

	expected := "postgres://testuser:testpass@localhost:5432/testdb?sslmode=disable"
	actual := buildConnectionString(cfg)

	if actual != expected {
		t.Errorf("Expected connection string: %s, got: %s", expected, actual)
	}
}

func TestDatabase_New_InvalidConfig(t *testing.T) {
	// Testing with an invalid host to ensure error handling works
	cfg := &config.DatabaseConfig{
		Host:        "nonexistenthost",
		Port:        5432,
		Name:        "testdb",
		User:        "testuser",
		Password:    "testpass",
		SSLMode:     "disable",
		MaxConns:    5,
		MinConns:    1,
		MaxIdleTime: 15 * time.Minute,
		MaxLifetime: 1 * time.Hour,
		HealthCheck: 1 * time.Minute,
	}

	ctx := context.Background()
	// This should time out or fail quickly
	ctx, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
	defer cancel()

	_, err := New(ctx, cfg)
	if err == nil {
		t.Error("Expected an error when connecting to non-existent host, but got nil")
	}
}

// Note: Integration tests that require a real database connection should be in a separate file
// with a _integration_test.go suffix and use a tag to conditionally run them.
