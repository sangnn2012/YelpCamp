package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sangnn2012/yelpcamp-api-go/internal/middleware"
	"github.com/sangnn2012/yelpcamp-api-go/internal/models"
	"github.com/sangnn2012/yelpcamp-api-go/pkg/validator"
)

type CommentHandler struct {
	db *pgxpool.Pool
}

func NewCommentHandler(db *pgxpool.Pool) *CommentHandler {
	return &CommentHandler{db: db}
}

func (h *CommentHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	campgroundID, err := strconv.Atoi(chi.URLParam(r, "campgroundId"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid campground ID")
		return
	}

	// Check campground exists
	var exists bool
	h.db.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM campgrounds WHERE id = $1)", campgroundID).Scan(&exists)
	if !exists {
		respondError(w, http.StatusNotFound, "Campground not found")
		return
	}

	var req models.CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validator.Validate(req); err != nil {
		errors := validator.ValidationErrors(err)
		respondError(w, http.StatusBadRequest, errors[0])
		return
	}

	now := time.Now()
	var id int
	err = h.db.QueryRow(context.Background(), `
		INSERT INTO comments (text, campground_id, author_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, req.Text, campgroundID, userID, now, now).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create comment")
		return
	}

	respondJSON(w, http.StatusCreated, models.Comment{
		ID:           id,
		Text:         req.Text,
		CampgroundID: campgroundID,
		AuthorID:     &userID,
		CreatedAt:    now,
		UpdatedAt:    now,
	})
}

func (h *CommentHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid comment ID")
		return
	}

	// Check ownership
	var authorID *string
	h.db.QueryRow(context.Background(), "SELECT author_id FROM comments WHERE id = $1", id).Scan(&authorID)
	if authorID == nil || *authorID != userID {
		respondError(w, http.StatusForbidden, "You do not have permission to do that")
		return
	}

	var req models.UpdateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validator.Validate(req); err != nil {
		errors := validator.ValidationErrors(err)
		respondError(w, http.StatusBadRequest, errors[0])
		return
	}

	_, err = h.db.Exec(context.Background(), `
		UPDATE comments SET text = $1, updated_at = $2 WHERE id = $3
	`, req.Text, time.Now(), id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update comment")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Comment updated"})
}

func (h *CommentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid comment ID")
		return
	}

	// Check ownership
	var authorID *string
	h.db.QueryRow(context.Background(), "SELECT author_id FROM comments WHERE id = $1", id).Scan(&authorID)
	if authorID == nil || *authorID != userID {
		respondError(w, http.StatusForbidden, "You do not have permission to do that")
		return
	}

	_, err = h.db.Exec(context.Background(), "DELETE FROM comments WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete comment")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Comment deleted"})
}
