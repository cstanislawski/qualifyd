package config

import (
	"os"
	"strconv"
	"time"
)

// Config represents the application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	RabbitMQ RabbitMQConfig
	Log      LogConfig
	JWT      JWTConfig
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Host string
	Port int
	CORS CORSConfig
}

// CORSConfig holds CORS-related configuration
type CORSConfig struct {
	AllowedOrigins   []string
	AllowCredentials bool
}

// DatabaseConfig holds database-related configuration
type DatabaseConfig struct {
	Host     string
	Port     int
	Name     string
	User     string
	Password string
	SSLMode  string
	// Connection pool settings
	MaxConns    int
	MinConns    int
	MaxIdleTime time.Duration
	MaxLifetime time.Duration
	HealthCheck time.Duration
}

// RabbitMQConfig holds RabbitMQ-related configuration
type RabbitMQConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	VHost    string
}

// LogConfig holds logging-related configuration
type LogConfig struct {
	Level  string
	Format string
}

// JWTConfig holds JWT-related configuration
type JWTConfig struct {
	Secret                 string
	ExpirationHours        int
	RefreshSecret          string
	RefreshExpirationHours int
}

// Load loads the configuration from environment variables
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Host: getEnvString("SERVER_HOST", "0.0.0.0"),
			Port: getEnvInt("SERVER_PORT", 8080),
			CORS: CORSConfig{
				AllowedOrigins:   getEnvStringSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
				AllowCredentials: getEnvBool("CORS_ALLOW_CREDENTIALS", true),
			},
		},
		Database: DatabaseConfig{
			Host:        getEnvString("DATABASE_HOST", "postgresql.qualifyd-dev.svc.cluster.local"),
			Port:        getEnvInt("DATABASE_PORT", 5432),
			Name:        getEnvString("DATABASE_NAME", "qualifyd"),
			User:        getEnvString("DATABASE_USER", "qualifyd"),
			Password:    getEnvString("DATABASE_PASSWORD", "qualifyd"),
			SSLMode:     getEnvString("DATABASE_SSL_MODE", "disable"),
			MaxConns:    getEnvInt("DATABASE_MAX_CONNS", 10),
			MinConns:    getEnvInt("DATABASE_MIN_CONNS", 2),
			MaxIdleTime: getEnvDuration("DATABASE_MAX_IDLE_TIME", 15*time.Minute),
			MaxLifetime: getEnvDuration("DATABASE_MAX_LIFETIME", 1*time.Hour),
			HealthCheck: getEnvDuration("DATABASE_HEALTH_CHECK", 1*time.Minute),
		},
		RabbitMQ: RabbitMQConfig{
			Host:     getEnvString("RABBITMQ_HOST", "rabbitmq.qualifyd-dev.svc.cluster.local"),
			Port:     getEnvInt("RABBITMQ_PORT", 5672),
			User:     getEnvString("RABBITMQ_USER", "qualifyd"),
			Password: getEnvString("RABBITMQ_PASSWORD", "qualifyd"),
			VHost:    getEnvString("RABBITMQ_VHOST", "/"),
		},
		Log: LogConfig{
			Level:  getEnvString("LOG_LEVEL", "info"),
			Format: getEnvString("LOG_FORMAT", "json"),
		},
		JWT: JWTConfig{
			Secret:                 getEnvString("JWT_SECRET", "default-jwt-secret-change-me-in-production"),
			ExpirationHours:        getEnvInt("JWT_EXPIRATION_HOURS", 24),
			RefreshSecret:          getEnvString("JWT_REFRESH_SECRET", "default-jwt-refresh-secret-change-me-in-production"),
			RefreshExpirationHours: getEnvInt("JWT_REFRESH_EXPIRATION_HOURS", 168), // 7 days
		},
	}
}

// Helper functions to get environment variables with defaults

func getEnvString(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if value, exists := os.LookupEnv(key); exists {
		if durationValue, err := time.ParseDuration(value); err == nil {
			return durationValue
		}
	}
	return defaultValue
}

func getEnvStringSlice(key string, defaultValue []string) []string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return splitAndTrim(value)
	}
	return defaultValue
}

// splitAndTrim splits a string by comma and trims whitespace from each part
func splitAndTrim(s string) []string {
	// TODO: implement proper splitting with handling for commas in quotes, etc.
	return []string{s} // Simplified for now
}
