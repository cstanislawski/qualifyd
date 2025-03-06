package database

import (
	"context"
	"fmt"

	"github.com/cstanislawski/qualifyd/pkg/config"
	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Database represents a PostgreSQL database connection pool
type Database struct {
	pool   *pgxpool.Pool
	config *config.DatabaseConfig
}

// New creates a new Database instance with the provided configuration
func New(ctx context.Context, cfg *config.DatabaseConfig) (*Database, error) {
	poolConfig, err := pgxpool.ParseConfig(buildConnectionString(cfg))
	if err != nil {
		return nil, fmt.Errorf("failed to parse database config: %w", err)
	}

	// Configure the connection pool
	poolConfig.MaxConns = int32(cfg.MaxConns)
	poolConfig.MinConns = int32(cfg.MinConns)
	poolConfig.MaxConnIdleTime = cfg.MaxIdleTime
	poolConfig.MaxConnLifetime = cfg.MaxLifetime
	poolConfig.HealthCheckPeriod = cfg.HealthCheck
	// Note: LazyConnect is not directly available in pgxpool.Config
	// If lazy connection is needed, implement connection retries or use a connection manager

	// Create a connection pool
	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create database connection pool: %w", err)
	}

	// Test the connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Connected to database", map[string]interface{}{
		"host": cfg.Host,
		"port": cfg.Port,
		"name": cfg.Name,
		"user": cfg.User,
	})

	return &Database{
		pool:   pool,
		config: cfg,
	}, nil
}

// Close closes the database connection pool
func (db *Database) Close() {
	if db.pool != nil {
		db.pool.Close()
		logger.Info("Database connection pool closed", nil)
	}
}

// WithTx executes the given function within a transaction
func (db *Database) WithTx(ctx context.Context, fn func(pgx.Tx) error) error {
	tx, err := db.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Defer rollback in case of panic or error
	defer func() {
		if p := recover(); p != nil {
			if rbErr := tx.Rollback(ctx); rbErr != nil {
				logger.Error("Failed to rollback transaction after panic", rbErr, map[string]interface{}{
					"panic": p,
				})
			}
			panic(p) // Re-throw the panic after rollback
		}
	}()

	if err := fn(tx); err != nil {
		// Try to rollback the transaction
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			logger.Error("Failed to rollback transaction", rbErr, nil)
		}
		return err
	}

	// Commit the transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// Pool returns the underlying connection pool
func (db *Database) Pool() *pgxpool.Pool {
	return db.pool
}

// Query executes a query that returns rows using the default connection pool
func (db *Database) Query(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
	return db.pool.Query(ctx, query, args...)
}

// QueryRow executes a query that is expected to return at most one row
func (db *Database) QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row {
	return db.pool.QueryRow(ctx, query, args...)
}

// Exec executes a query that doesn't return rows
func (db *Database) Exec(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
	return db.pool.Exec(ctx, query, args...)
}

// Ping checks if the database is available
func (db *Database) Ping(ctx context.Context) error {
	return db.pool.Ping(ctx)
}

// Private helpers

// buildConnectionString builds a connection string from a DatabaseConfig
func buildConnectionString(cfg *config.DatabaseConfig) string {
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name, cfg.SSLMode)
}
