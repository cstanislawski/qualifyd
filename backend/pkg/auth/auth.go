package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/config"
	"github.com/cstanislawski/qualifyd/pkg/model"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Common errors
var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrTokenExpired       = errors.New("token has expired")
	ErrInvalidToken       = errors.New("invalid token")
	ErrNoToken            = errors.New("no token provided")
	ErrNotAuthorized      = errors.New("not authorized")
)

// Claims represents the JWT claims
type Claims struct {
	UserID         string `json:"user_id"`
	Email          string `json:"email"`
	Role           string `json:"role"`
	OrganizationID string `json:"organization_id,omitempty"`
	jwt.RegisteredClaims
}

// Auth represents an authentication service
type Auth struct {
	config *config.JWTConfig
}

// New creates a new Auth instance
func New(config *config.JWTConfig) *Auth {
	return &Auth{
		config: config,
	}
}

// HashPassword generates a bcrypt hash from a password
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedPassword), nil
}

// CheckPassword compares a password with a hashed password
func CheckPassword(password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// GenerateTokens generates both access and refresh tokens for a user
func (a *Auth) GenerateTokens(user *model.User) (accessToken, refreshToken string, err error) {
	// Generate access token
	accessToken, err = a.GenerateAccessToken(user)
	if err != nil {
		return "", "", err
	}

	// Generate refresh token
	refreshToken, err = a.GenerateRefreshToken(user.ID)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

// GenerateAccessToken generates a JWT access token for a user
func (a *Auth) GenerateAccessToken(user *model.User) (string, error) {
	expirationTime := time.Now().Add(time.Duration(a.config.ExpirationHours) * time.Hour)

	claims := &Claims{
		UserID:         user.ID,
		Email:          user.Email,
		Role:           user.Role,
		OrganizationID: user.OrganizationID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "qualifyd",
			Subject:   user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(a.config.Secret))
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	return tokenString, nil
}

// GenerateRefreshToken generates a JWT refresh token for a user
func (a *Auth) GenerateRefreshToken(userID string) (string, error) {
	expirationTime := time.Now().Add(time.Duration(a.config.RefreshExpirationHours) * time.Hour)

	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expirationTime),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		NotBefore: jwt.NewNumericDate(time.Now()),
		Issuer:    "qualifyd",
		Subject:   userID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(a.config.RefreshSecret))
	if err != nil {
		return "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return tokenString, nil
}

// ValidateAccessToken validates a JWT access token and returns the claims
func (a *Auth) ValidateAccessToken(tokenString string) (*Claims, error) {
	if tokenString == "" {
		return nil, ErrNoToken
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(a.config.Secret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// ValidateRefreshToken validates a JWT refresh token and returns the user ID
func (a *Auth) ValidateRefreshToken(tokenString string) (string, error) {
	if tokenString == "" {
		return "", ErrNoToken
	}

	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(a.config.RefreshSecret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return "", ErrTokenExpired
		}
		return "", fmt.Errorf("failed to parse refresh token: %w", err)
	}

	if !token.Valid {
		return "", ErrInvalidToken
	}

	return claims.Subject, nil
}

// GenerateResetToken generates a password reset token
func (a *Auth) GenerateResetToken(userID string) (string, error) {
	// Reset tokens expire in 1 hour
	expirationTime := time.Now().Add(1 * time.Hour)

	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expirationTime),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		NotBefore: jwt.NewNumericDate(time.Now()),
		Issuer:    "qualifyd",
		Subject:   userID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(a.config.Secret))
	if err != nil {
		return "", fmt.Errorf("failed to generate reset token: %w", err)
	}

	return tokenString, nil
}

// ValidateResetToken validates a password reset token
func (a *Auth) ValidateResetToken(tokenString string) (string, error) {
	if tokenString == "" {
		return "", ErrNoToken
	}

	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(a.config.Secret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return "", ErrTokenExpired
		}
		return "", fmt.Errorf("failed to parse reset token: %w", err)
	}

	if !token.Valid {
		return "", ErrInvalidToken
	}

	return claims.Subject, nil
}
