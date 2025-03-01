package logger

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5/middleware"
)

// HTTPMiddleware returns a middleware that logs HTTP requests using the configured zerolog logger
func HTTPMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		start := time.Now()

		// Call the next handler
		next.ServeHTTP(ww, r)

		// Log the request
		duration := time.Since(start)

		// Create fields for the log entry
		fields := map[string]interface{}{
			"method":    r.Method,
			"path":      r.URL.Path,
			"status":    ww.Status(),
			"bytes":     ww.BytesWritten(),
			"duration":  duration.Milliseconds(),
			"ip":        r.RemoteAddr,
			"proto":     r.Proto,
			"userAgent": r.UserAgent(),
		}

		// Log with appropriate level based on status code
		statusCode := ww.Status()
		msg := http.StatusText(statusCode)
		if statusCode >= 500 {
			Error(msg, nil, fields)
		} else if statusCode >= 400 {
			Warn(msg, fields)
		} else {
			Info(msg, fields)
		}
	})
}
