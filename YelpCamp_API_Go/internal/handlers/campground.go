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

type CampgroundHandler struct {
	db *pgxpool.Pool
}

func NewCampgroundHandler(db *pgxpool.Pool) *CampgroundHandler {
	return &CampgroundHandler{db: db}
}

func (h *CampgroundHandler) List(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit := 12
	offset := (page - 1) * limit
	search := r.URL.Query().Get("search")

	// Count total
	var total int
	countQuery := "SELECT COUNT(*) FROM campgrounds"
	args := []interface{}{}
	if search != "" {
		countQuery += " WHERE name ILIKE $1 OR description ILIKE $1 OR location ILIKE $1"
		args = append(args, "%"+search+"%")
	}
	h.db.QueryRow(context.Background(), countQuery, args...).Scan(&total)

	// Get campgrounds
	query := `
		SELECT c.id, c.name, c.price, c.image, c.description, c.location, c.author_id,
			   c.created_at, c.updated_at, u.id, u.username
		FROM campgrounds c
		LEFT JOIN users u ON c.author_id = u.id
	`
	if search != "" {
		query += " WHERE c.name ILIKE $1 OR c.description ILIKE $1 OR c.location ILIKE $1"
		query += " ORDER BY c.created_at DESC LIMIT $2 OFFSET $3"
		args = append(args, limit, offset)
	} else {
		query += " ORDER BY c.created_at DESC LIMIT $1 OFFSET $2"
		args = []interface{}{limit, offset}
	}

	rows, err := h.db.Query(context.Background(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Database error")
		return
	}
	defer rows.Close()

	campgrounds := []models.Campground{}
	for rows.Next() {
		var c models.Campground
		var authorID, authorUsername *string
		err := rows.Scan(&c.ID, &c.Name, &c.Price, &c.Image, &c.Description, &c.Location,
			&c.AuthorID, &c.CreatedAt, &c.UpdatedAt, &authorID, &authorUsername)
		if err != nil {
			continue
		}
		if authorID != nil && authorUsername != nil {
			c.Author = &models.Author{ID: *authorID, Username: *authorUsername}
		}
		campgrounds = append(campgrounds, c)
	}

	totalPages := (total + limit - 1) / limit
	respondJSON(w, http.StatusOK, models.PaginatedResponse{
		Data: campgrounds,
		Pagination: models.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
			HasMore:    page < totalPages,
		},
	})
}

func (h *CampgroundHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid campground ID")
		return
	}

	var c models.Campground
	var authorID, authorUsername *string
	err = h.db.QueryRow(context.Background(), `
		SELECT c.id, c.name, c.price, c.image, c.description, c.location, c.author_id,
			   c.created_at, c.updated_at, u.id, u.username
		FROM campgrounds c
		LEFT JOIN users u ON c.author_id = u.id
		WHERE c.id = $1
	`, id).Scan(&c.ID, &c.Name, &c.Price, &c.Image, &c.Description, &c.Location,
		&c.AuthorID, &c.CreatedAt, &c.UpdatedAt, &authorID, &authorUsername)

	if err != nil {
		respondError(w, http.StatusNotFound, "Campground not found")
		return
	}

	if authorID != nil && authorUsername != nil {
		c.Author = &models.Author{ID: *authorID, Username: *authorUsername}
	}

	// Get comments
	rows, _ := h.db.Query(context.Background(), `
		SELECT c.id, c.text, c.campground_id, c.author_id, c.created_at, c.updated_at,
			   u.id, u.username
		FROM comments c
		LEFT JOIN users u ON c.author_id = u.id
		WHERE c.campground_id = $1
		ORDER BY c.created_at DESC
	`, id)
	defer rows.Close()

	c.Comments = []models.Comment{}
	for rows.Next() {
		var comment models.Comment
		var aID, aUsername *string
		rows.Scan(&comment.ID, &comment.Text, &comment.CampgroundID, &comment.AuthorID,
			&comment.CreatedAt, &comment.UpdatedAt, &aID, &aUsername)
		if aID != nil && aUsername != nil {
			comment.Author = &models.Author{ID: *aID, Username: *aUsername}
		}
		c.Comments = append(c.Comments, comment)
	}

	respondJSON(w, http.StatusOK, c)
}

func (h *CampgroundHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req models.CreateCampgroundRequest
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
	err := h.db.QueryRow(context.Background(), `
		INSERT INTO campgrounds (name, price, image, description, location, author_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`, req.Name, req.Price, req.Image, req.Description, req.Location, userID, now, now).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create campground")
		return
	}

	respondJSON(w, http.StatusCreated, models.Campground{
		ID:          id,
		Name:        req.Name,
		Price:       req.Price,
		Image:       req.Image,
		Description: req.Description,
		Location:    req.Location,
		AuthorID:    &userID,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
}

func (h *CampgroundHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid campground ID")
		return
	}

	// Check ownership
	var authorID *string
	h.db.QueryRow(context.Background(), "SELECT author_id FROM campgrounds WHERE id = $1", id).Scan(&authorID)
	if authorID == nil || *authorID != userID {
		respondError(w, http.StatusForbidden, "You don't have permission to do that")
		return
	}

	var req models.UpdateCampgroundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	_, err = h.db.Exec(context.Background(), `
		UPDATE campgrounds SET
			name = COALESCE($1, name),
			price = COALESCE($2, price),
			image = COALESCE($3, image),
			description = COALESCE($4, description),
			location = COALESCE($5, location),
			updated_at = $6
		WHERE id = $7
	`, req.Name, req.Price, req.Image, req.Description, req.Location, time.Now(), id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update campground")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Campground updated"})
}

func (h *CampgroundHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid campground ID")
		return
	}

	// Check ownership
	var authorID *string
	h.db.QueryRow(context.Background(), "SELECT author_id FROM campgrounds WHERE id = $1", id).Scan(&authorID)
	if authorID == nil || *authorID != userID {
		respondError(w, http.StatusForbidden, "You don't have permission to do that")
		return
	}

	_, err = h.db.Exec(context.Background(), "DELETE FROM campgrounds WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete campground")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Campground deleted"})
}
