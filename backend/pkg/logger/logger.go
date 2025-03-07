package logger

import (
	"io"
	"os"
	"sort"
	"time"

	"github.com/rs/zerolog"
)

// Logger is an interface that defines logging methods
type Logger interface {
	Debug(msg string, fields ...map[string]interface{})
	Info(msg string, fields ...map[string]interface{})
	Warn(msg string, fields ...map[string]interface{})
	Error(msg string, err error, fields ...map[string]interface{})
	Fatal(msg string, err error, fields ...map[string]interface{})
}

// DefaultLogger implements the Logger interface using zerolog
type DefaultLogger struct {
	log zerolog.Logger
}

var (
	// Log is the global logger instance
	Log zerolog.Logger
	// GlobalLogger is the default logger implementation
	GlobalLogger *DefaultLogger
)

// standardFields returns a sorted list of standard field names
func standardFields() []string {
	return []string{
		"t",         // timestamp
		"l",         // level
		"m",         // message
		"error",     // error message
		"caller",    // caller information
		"method",    // HTTP method
		"path",      // request path
		"status",    // HTTP status
		"duration",  // request duration
		"ip",        // client IP
		"proto",     // HTTP protocol
		"bytes",     // response size
		"userAgent", // user agent
	}
}

// orderedFieldWriter ensures consistent field ordering
type orderedFieldWriter struct {
	event *zerolog.Event
}

func newOrderedFieldWriter(event *zerolog.Event) *orderedFieldWriter {
	return &orderedFieldWriter{event: event}
}

func (w *orderedFieldWriter) writeFields(fields map[string]interface{}) {
	// Get standard fields in predefined order
	standardFieldNames := standardFields()

	// Create a map for quick lookup of standard fields
	standardFieldsMap := make(map[string]bool)
	for _, field := range standardFieldNames {
		standardFieldsMap[field] = true
	}

	// Write standard fields in predefined order
	for _, field := range standardFieldNames {
		if value, exists := fields[field]; exists {
			w.event.Interface(field, value)
			delete(fields, field)
		}
	}

	// Get remaining fields and sort them
	var remainingFields []string
	for field := range fields {
		if !standardFieldsMap[field] {
			remainingFields = append(remainingFields, field)
		}
	}
	sort.Strings(remainingFields)

	// Write remaining fields in alphabetical order
	for _, field := range remainingFields {
		w.event.Interface(field, fields[field])
	}
}

// Init initializes the logger with the specified configuration
func Init(opts ...Option) {
	// Default configuration
	config := &Config{
		output:       os.Stdout,
		level:        zerolog.InfoLevel,
		prettyPrint:  false,
		callerEnable: false,
	}

	// Apply options
	for _, opt := range opts {
		opt(config)
	}

	// Configure zerolog
	zerolog.TimeFieldFormat = time.RFC3339
	zerolog.TimestampFieldName = "t"
	zerolog.LevelFieldName = "l"
	zerolog.MessageFieldName = "m"
	zerolog.ErrorFieldName = "error"
	zerolog.CallerFieldName = "caller"

	// Create logger with configured output
	logContext := zerolog.New(config.output).With().Timestamp()

	// Add caller if enabled
	if config.callerEnable {
		logContext = logContext.Caller()
	}

	// Create final logger
	Log = logContext.Logger().Level(config.level)

	// Initialize the global logger implementation
	GlobalLogger = &DefaultLogger{log: Log}
}

// NewLogger creates a new logger instance
func NewLogger(log zerolog.Logger) *DefaultLogger {
	return &DefaultLogger{log: log}
}

// Config holds the logger configuration
type Config struct {
	output       io.Writer
	level        zerolog.Level
	prettyPrint  bool
	callerEnable bool
}

// Option is a function that configures the logger
type Option func(*Config)

// WithOutput sets the logger output
func WithOutput(output io.Writer) Option {
	return func(c *Config) {
		c.output = output
	}
}

// WithLevel sets the logger level
func WithLevel(level zerolog.Level) Option {
	return func(c *Config) {
		c.level = level
	}
}

// WithPrettyPrint enables pretty printing (not JSON) for development
func WithPrettyPrint(enable bool) Option {
	return func(c *Config) {
		c.prettyPrint = enable
		if enable {
			c.output = zerolog.ConsoleWriter{
				Out:        c.output,
				TimeFormat: time.RFC3339,
			}
		}
	}
}

// addFields adds custom fields to the log event in a consistent order
func addFields(event *zerolog.Event, fields []map[string]interface{}) {
	if len(fields) > 0 {
		writer := newOrderedFieldWriter(event)
		writer.writeFields(fields[0])
	}
}

// DefaultLogger implementation methods

// Debug logs a debug message
func (l *DefaultLogger) Debug(msg string, fields ...map[string]interface{}) {
	event := l.log.Debug()
	addFields(event, fields)
	event.Msg(msg)
}

// Info logs an info message
func (l *DefaultLogger) Info(msg string, fields ...map[string]interface{}) {
	event := l.log.Info()
	addFields(event, fields)
	event.Msg(msg)
}

// Warn logs a warning message
func (l *DefaultLogger) Warn(msg string, fields ...map[string]interface{}) {
	event := l.log.Warn()
	addFields(event, fields)
	event.Msg(msg)
}

// Error logs an error message
func (l *DefaultLogger) Error(msg string, err error, fields ...map[string]interface{}) {
	event := l.log.Error()
	if err != nil {
		event = event.Err(err)
	}
	addFields(event, fields)
	event.Msg(msg)
}

// Fatal logs a fatal message and exits
func (l *DefaultLogger) Fatal(msg string, err error, fields ...map[string]interface{}) {
	event := l.log.Fatal()
	if err != nil {
		event = event.Err(err)
	}
	addFields(event, fields)
	event.Msg(msg)
}

// Package-level functions that use the global logger

// Debug logs a debug message
func Debug(msg string, fields ...map[string]interface{}) {
	event := Log.Debug()
	addFields(event, fields)
	event.Msg(msg)
}

// Info logs an info message
func Info(msg string, fields ...map[string]interface{}) {
	event := Log.Info()
	addFields(event, fields)
	event.Msg(msg)
}

// Warn logs a warning message
func Warn(msg string, fields ...map[string]interface{}) {
	event := Log.Warn()
	addFields(event, fields)
	event.Msg(msg)
}

// Error logs an error message
func Error(msg string, err error, fields ...map[string]interface{}) {
	event := Log.Error()
	if err != nil {
		event = event.Err(err)
	}
	addFields(event, fields)
	event.Msg(msg)
}

// Fatal logs a fatal message and exits
func Fatal(msg string, err error, fields ...map[string]interface{}) {
	event := Log.Fatal()
	if err != nil {
		event = event.Err(err)
	}
	addFields(event, fields)
	event.Msg(msg)
}
