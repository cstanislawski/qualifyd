package database

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/jackc/pgx/v5"
)

// Migration represents a database migration
type Migration struct {
	ID        int64
	Name      string
	Content   string
	AppliedAt time.Time
}

// MigrationService handles database migrations
type MigrationService struct {
	db     *Database
	dir    string
	logger logger.Logger
}

// NewMigrationService creates a new migration service
func NewMigrationService(db *Database, migrationsDir string, logger logger.Logger) *MigrationService {
	return &MigrationService{
		db:     db,
		dir:    migrationsDir,
		logger: logger,
	}
}

// EnsureMigrationsTable ensures the migrations table exists
func (m *MigrationService) EnsureMigrationsTable(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS migrations (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL UNIQUE,
			applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
		)
	`

	_, err := m.db.Exec(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	return nil
}

// GetAppliedMigrations retrieves the list of applied migrations
func (m *MigrationService) GetAppliedMigrations(ctx context.Context) (map[string]Migration, error) {
	query := `
		SELECT id, name, applied_at
		FROM migrations
		ORDER BY id
	`

	rows, err := m.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get applied migrations: %w", err)
	}
	defer rows.Close()

	migrations := make(map[string]Migration)
	for rows.Next() {
		var migration Migration
		err := rows.Scan(&migration.ID, &migration.Name, &migration.AppliedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan migration: %w", err)
		}
		migrations[migration.Name] = migration
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return migrations, nil
}

// GetPendingMigrations retrieves the list of pending migrations
func (m *MigrationService) GetPendingMigrations(ctx context.Context) ([]Migration, error) {
	// Get applied migrations
	appliedMigrations, err := m.GetAppliedMigrations(ctx)
	if err != nil {
		return nil, err
	}

	// Get migration files
	files, err := os.ReadDir(m.dir)
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var pendingMigrations []Migration
	for _, file := range files {
		if file.IsDir() || !strings.HasSuffix(file.Name(), ".sql") {
			continue
		}

		name := file.Name()
		if _, exists := appliedMigrations[name]; !exists {
			// Read migration content
			content, err := os.ReadFile(filepath.Join(m.dir, name))
			if err != nil {
				return nil, fmt.Errorf("failed to read migration file %s: %w", name, err)
			}

			pendingMigrations = append(pendingMigrations, Migration{
				Name:    name,
				Content: string(content),
			})
		}
	}

	// Sort migrations by name (assuming names start with timestamps or sequential numbers)
	sort.Slice(pendingMigrations, func(i, j int) bool {
		return pendingMigrations[i].Name < pendingMigrations[j].Name
	})

	return pendingMigrations, nil
}

// ApplyMigration applies a single migration
func (m *MigrationService) ApplyMigration(ctx context.Context, migration Migration) error {
	// Start a transaction
	return m.db.WithTx(ctx, func(tx pgx.Tx) error {
		// Execute the migration
		_, err := tx.Exec(ctx, migration.Content)
		if err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", migration.Name, err)
		}

		// Record the migration
		_, err = tx.Exec(ctx, "INSERT INTO migrations (name) VALUES ($1)", migration.Name)
		if err != nil {
			return fmt.Errorf("failed to record migration %s: %w", migration.Name, err)
		}

		return nil
	})
}

// MigrateUp applies all pending migrations
func (m *MigrationService) MigrateUp(ctx context.Context) error {
	// Ensure migrations table exists
	if err := m.EnsureMigrationsTable(ctx); err != nil {
		return err
	}

	// Get pending migrations
	pendingMigrations, err := m.GetPendingMigrations(ctx)
	if err != nil {
		return err
	}

	if len(pendingMigrations) == 0 {
		m.logger.Info("No pending migrations to apply")
		return nil
	}

	// Apply migrations
	for _, migration := range pendingMigrations {
		m.logger.Info(fmt.Sprintf("Applying migration: %s", migration.Name))
		if err := m.ApplyMigration(ctx, migration); err != nil {
			return err
		}
		m.logger.Info(fmt.Sprintf("Successfully applied migration: %s", migration.Name))
	}

	m.logger.Info(fmt.Sprintf("Successfully applied %d migrations", len(pendingMigrations)))
	return nil
}

// MigrateDown rolls back the last migration
func (m *MigrationService) MigrateDown(ctx context.Context) error {
	// Get the last applied migration
	query := `
		SELECT id, name
		FROM migrations
		ORDER BY id DESC
		LIMIT 1
	`

	var id int64
	var name string
	err := m.db.QueryRow(ctx, query).Scan(&id, &name)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			m.logger.Info("No migrations to roll back")
			return nil
		}
		return fmt.Errorf("failed to get last migration: %w", err)
	}

	// Find the corresponding down migration
	downName := strings.Replace(name, ".up.sql", ".down.sql", 1)
	content, err := os.ReadFile(filepath.Join(m.dir, downName))
	if err != nil {
		return fmt.Errorf("failed to read down migration %s: %w", downName, err)
	}

	// Roll back the migration
	return m.db.WithTx(ctx, func(tx pgx.Tx) error {
		// Execute the down migration
		_, err := tx.Exec(ctx, string(content))
		if err != nil {
			return fmt.Errorf("failed to execute down migration %s: %w", downName, err)
		}

		// Remove the migration record
		_, err = tx.Exec(ctx, "DELETE FROM migrations WHERE id = $1", id)
		if err != nil {
			return fmt.Errorf("failed to remove migration record %d: %w", id, err)
		}

		m.logger.Info(fmt.Sprintf("Successfully rolled back migration: %s", name))
		return nil
	})
}

// CreateMigration creates a new migration file
func (m *MigrationService) CreateMigration(name string) error {
	timestamp := time.Now().UTC().Format("20060102150405")
	baseName := fmt.Sprintf("%s_%s", timestamp, strings.ReplaceAll(strings.ToLower(name), " ", "_"))

	upFileName := fmt.Sprintf("%s.up.sql", baseName)
	downFileName := fmt.Sprintf("%s.down.sql", baseName)

	upFilePath := filepath.Join(m.dir, upFileName)
	downFilePath := filepath.Join(m.dir, downFileName)

	// Create up migration
	upFile, err := os.Create(upFilePath)
	if err != nil {
		return fmt.Errorf("failed to create up migration file: %w", err)
	}
	defer upFile.Close()

	// Add a comment to the up migration
	_, err = upFile.WriteString(fmt.Sprintf("-- Migration: %s\n\n", name))
	if err != nil {
		return fmt.Errorf("failed to write to up migration file: %w", err)
	}

	// Create down migration
	downFile, err := os.Create(downFilePath)
	if err != nil {
		return fmt.Errorf("failed to create down migration file: %w", err)
	}
	defer downFile.Close()

	// Add a comment to the down migration
	_, err = downFile.WriteString(fmt.Sprintf("-- Rollback: %s\n\n", name))
	if err != nil {
		return fmt.Errorf("failed to write to down migration file: %w", err)
	}

	m.logger.Info(fmt.Sprintf("Created migration files: %s and %s", upFileName, downFileName))
	return nil
}
