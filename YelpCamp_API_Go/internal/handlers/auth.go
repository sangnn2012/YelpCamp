package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sangnn2012/yelpcamp-api-go/internal/middleware"
	"github.com/sangnn2012/yelpcamp-api-go/internal/models"
	"github.com/sangnn2012/yelpcamp-api-go/pkg/validator"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db *pgxpool.Pool
}

func NewAuthHandler(db *pgxpool.Pool) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validator.Validate(req); err != nil {
		errors := validator.ValidationErrors(err)
		respondError(w, http.StatusBadRequest, errors[0])
		return
	}

	// Check if user exists
	var exists bool
	err := h.db.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2)",
		req.Username, req.Email).Scan(&exists)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Database error")
		return
	}
	if exists {
		respondError(w, http.StatusConflict, "Username or email already exists")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	// Create user
	userID := uuid.New().String()
	now := time.Now()
	_, err = h.db.Exec(context.Background(),
		`INSERT INTO users (id, username, email, password, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		userID, req.Username, req.Email, string(hashedPassword), now, now)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Generate token and set cookie
	token := generateToken(userID)
	setTokenCookie(w, token)

	respondJSON(w, http.StatusCreated, models.User{
		ID:        userID,
		Username:  req.Username,
		Email:     req.Email,
		CreatedAt: now,
		UpdatedAt: now,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validator.Validate(req); err != nil {
		errors := validator.ValidationErrors(err)
		respondError(w, http.StatusBadRequest, errors[0])
		return
	}

	// Find user
	var user models.User
	var hashedPassword string
	err := h.db.QueryRow(context.Background(),
		`SELECT id, username, email, password, created_at, updated_at
		 FROM users WHERE username = $1`,
		req.Username).Scan(&user.ID, &user.Username, &user.Email, &hashedPassword, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generate token and set cookie
	token := generateToken(user.ID)
	setTokenCookie(w, token)

	respondJSON(w, http.StatusOK, user)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})
	respondJSON(w, http.StatusOK, map[string]string{"message": "Logged out"})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var user models.User
	err := h.db.QueryRow(context.Background(),
		`SELECT id, username, email, created_at, updated_at
		 FROM users WHERE id = $1`, userID).
		Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		respondError(w, http.StatusNotFound, "User not found")
		return
	}

	respondJSON(w, http.StatusOK, user)
}

func generateToken(userID string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	return tokenString
}

func setTokenCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		MaxAge:   7 * 24 * 60 * 60,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}
