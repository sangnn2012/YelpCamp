package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/sangnn2012/yelpcamp-api-go/internal/handlers"
	mw "github.com/sangnn2012/yelpcamp-api-go/internal/middleware"
	"github.com/sangnn2012/yelpcamp-api-go/pkg/database"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to database
	db, err := database.Connect(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db)
	campgroundHandler := handlers.NewCampgroundHandler(db)
	commentHandler := handlers.NewCommentHandler(db)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3003"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// Health check
	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"YelpCamp API (Go)"}`))
	})

	// Auth routes
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/logout", authHandler.Logout)
		r.Get("/me", mw.RequireAuth(authHandler.Me))
	})

	// Campground routes
	r.Route("/api/campgrounds", func(r chi.Router) {
		r.Get("/", campgroundHandler.List)
		r.Get("/{id}", campgroundHandler.GetByID)

		r.Group(func(r chi.Router) {
			r.Use(mw.RequireAuth)
			r.Post("/", campgroundHandler.Create)
			r.Put("/{id}", campgroundHandler.Update)
			r.Delete("/{id}", campgroundHandler.Delete)
		})
	})

	// Comment routes
	r.Route("/api/campgrounds/{campgroundId}/comments", func(r chi.Router) {
		r.Use(mw.RequireAuth)
		r.Post("/", commentHandler.Create)
	})

	r.Route("/api/comments", func(r chi.Router) {
		r.Use(mw.RequireAuth)
		r.Put("/{id}", commentHandler.Update)
		r.Delete("/{id}", commentHandler.Delete)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3004"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
