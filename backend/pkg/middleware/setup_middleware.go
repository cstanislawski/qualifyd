package middleware

import (
	"net/http"

	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/cstanislawski/qualifyd/pkg/repository"
)

// SetupMiddleware checks if the initial platform setup has been completed
type SetupMiddleware struct {
	userRepo *repository.UserRepository
	logger   logger.Logger
}

// NewSetupMiddleware creates a new SetupMiddleware instance
func NewSetupMiddleware(userRepo *repository.UserRepository, logger logger.Logger) *SetupMiddleware {
	return &SetupMiddleware{
		userRepo: userRepo,
		logger:   logger,
	}
}

// CheckInitialSetup ensures the setup endpoint is only accessible when no users exist
func (m *SetupMiddleware) CheckInitialSetup(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userCount, err := m.userRepo.Count(r.Context(), nil)
		if err != nil {
			m.logger.Error("Failed to check user count", err, nil)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if userCount > 0 {
			http.Error(w, "Setup has already been completed", http.StatusConflict)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// RequireSetupCompleted ensures routes are only accessible after setup is completed
func (m *SetupMiddleware) RequireSetupCompleted(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userCount, err := m.userRepo.Count(r.Context(), nil)
		if err != nil {
			m.logger.Error("Failed to check user count", err, nil)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if userCount == 0 {
			http.Error(w, "Platform setup required", http.StatusPreconditionFailed)
			return
		}

		next.ServeHTTP(w, r)
	})
}
