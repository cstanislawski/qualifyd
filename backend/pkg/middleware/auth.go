package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/cstanislawski/qualifyd/pkg/auth"
	"github.com/cstanislawski/qualifyd/pkg/logger"
)

// contextKey is a custom type to avoid collisions in the context
type contextKey string

// Context keys
const (
	UserIDKey          contextKey = "user_id"
	UserEmailKey       contextKey = "user_email"
	UserRoleKey        contextKey = "user_role"
	OrganizationIDKey  contextKey = "organization_id"
	IsAuthenticatedKey contextKey = "is_authenticated"
)

// AuthMiddleware creates a middleware that validates JWT tokens and sets user info in context
func AuthMiddleware(authService *auth.Auth) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := extractTokenFromHeader(r)
			if tokenString == "" {
				// No token found, proceed as unauthenticated
				r = setUnauthenticatedContext(r)
				next.ServeHTTP(w, r)
				return
			}

			// Validate the token
			claims, err := authService.ValidateAccessToken(tokenString)
			if err != nil {
				logger.Warn("Invalid token", map[string]interface{}{
					"error": err.Error(),
					"path":  r.URL.Path,
				})
				r = setUnauthenticatedContext(r)
				next.ServeHTTP(w, r)
				return
			}

			// Set authenticated user info in context
			r = setAuthenticatedContext(r, claims)
			next.ServeHTTP(w, r)
		})
	}
}

// RequireAuth creates a middleware that requires authentication
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if user is authenticated
		isAuthenticated := r.Context().Value(IsAuthenticatedKey)
		if isAuthenticated == nil || isAuthenticated.(bool) == false {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error":"Unauthorized"}`))
			return
		}
		next.ServeHTTP(w, r)
	})
}

// RequireRole creates a middleware that requires a specific role
func RequireRole(roles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Check if user is authenticated
			isAuthenticated := r.Context().Value(IsAuthenticatedKey)
			if isAuthenticated == nil || isAuthenticated.(bool) == false {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(`{"error":"Unauthorized"}`))
				return
			}

			// Check if user has required role
			userRole := r.Context().Value(UserRoleKey)
			if userRole == nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				w.Write([]byte(`{"error":"Forbidden"}`))
				return
			}

			hasRole := false
			for _, role := range roles {
				if userRole.(string) == role {
					hasRole = true
					break
				}
			}

			if !hasRole {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				w.Write([]byte(`{"error":"Forbidden"}`))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// GetUserID returns the user ID from the request context
func GetUserID(r *http.Request) string {
	userID := r.Context().Value(UserIDKey)
	if userID == nil {
		return ""
	}
	return userID.(string)
}

// GetUserEmail returns the user email from the request context
func GetUserEmail(r *http.Request) string {
	email := r.Context().Value(UserEmailKey)
	if email == nil {
		return ""
	}
	return email.(string)
}

// GetUserRole returns the user role from the request context
func GetUserRole(r *http.Request) string {
	role := r.Context().Value(UserRoleKey)
	if role == nil {
		return ""
	}
	return role.(string)
}

// GetOrganizationID returns the organization ID from the request context
func GetOrganizationID(r *http.Request) string {
	orgID := r.Context().Value(OrganizationIDKey)
	if orgID == nil {
		return ""
	}
	return orgID.(string)
}

// IsAuthenticated returns true if the user is authenticated
func IsAuthenticated(r *http.Request) bool {
	isAuth := r.Context().Value(IsAuthenticatedKey)
	if isAuth == nil {
		return false
	}
	return isAuth.(bool)
}

// Helper functions

// extractTokenFromHeader extracts the JWT token from the Authorization header
func extractTokenFromHeader(r *http.Request) string {
	// Get the Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}

	// Check if the header starts with "Bearer "
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}

	return parts[1]
}

// setUnauthenticatedContext sets context values for an unauthenticated request
func setUnauthenticatedContext(r *http.Request) *http.Request {
	ctx := r.Context()
	ctx = context.WithValue(ctx, IsAuthenticatedKey, false)
	return r.WithContext(ctx)
}

// setAuthenticatedContext sets context values for an authenticated user
func setAuthenticatedContext(r *http.Request, claims *auth.Claims) *http.Request {
	ctx := r.Context()
	ctx = context.WithValue(ctx, UserIDKey, claims.UserID)
	ctx = context.WithValue(ctx, UserEmailKey, claims.Email)
	ctx = context.WithValue(ctx, UserRoleKey, claims.Role)
	ctx = context.WithValue(ctx, OrganizationIDKey, claims.OrganizationID)
	ctx = context.WithValue(ctx, IsAuthenticatedKey, true)
	return r.WithContext(ctx)
}
