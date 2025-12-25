# YelpCamp API Go - Claude Code Instructions

## Overview

Go REST API backend using idiomatic Go patterns with Chi router, pgx for PostgreSQL, and JWT authentication.

## Tech Stack

| Category | Technology |
|----------|------------|
| Language | Go 1.21+ |
| Router | Chi v5 (idiomatic, lightweight) |
| Database | pgx/v5 (PostgreSQL driver) |
| Validation | go-playground/validator/v10 |
| Auth | golang-jwt/jwt/v5 + bcrypt |
| Environment | godotenv |

## Project Structure

```
YelpCamp_API_Go/
├── cmd/
│   └── server/
│       └── main.go           # Entry point, router setup
├── internal/
│   ├── handlers/             # HTTP handlers
│   │   ├── auth.go           # Register, Login, Logout, Me
│   │   ├── campground.go     # CRUD + List with pagination
│   │   ├── comment.go        # CRUD
│   │   └── helpers.go        # respondJSON, respondError
│   ├── middleware/
│   │   └── auth.go           # JWT auth middleware
│   └── models/
│       └── models.go         # All domain models
├── pkg/
│   ├── database/
│   │   └── database.go       # pgx connection pool
│   └── validator/
│       └── validator.go      # Validation wrapper
├── go.mod
├── .env.example
└── .gitignore
```

## Quick Start

```bash
# Copy environment
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# DATABASE_URL=postgres://user:pass@localhost:5432/yelpcamp
# JWT_SECRET=your-secret-key

# Download dependencies
go mod tidy

# Run server (port 3004)
go run cmd/server/main.go
```

## API Endpoints

### Authentication
| Method | Path | Handler | Auth |
|--------|------|---------|------|
| POST | /api/auth/register | Register | No |
| POST | /api/auth/login | Login | No |
| POST | /api/auth/logout | Logout | No |
| GET | /api/auth/me | Me | Yes |

### Campgrounds
| Method | Path | Handler | Auth |
|--------|------|---------|------|
| GET | /api/campgrounds | List | No |
| GET | /api/campgrounds/{id} | GetByID | No |
| POST | /api/campgrounds | Create | Yes |
| PUT | /api/campgrounds/{id} | Update | Yes (owner) |
| DELETE | /api/campgrounds/{id} | Delete | Yes (owner) |

### Comments
| Method | Path | Handler | Auth |
|--------|------|---------|------|
| POST | /api/campgrounds/{campgroundId}/comments | Create | Yes |
| PUT | /api/comments/{id} | Update | Yes (owner) |
| DELETE | /api/comments/{id} | Delete | Yes (owner) |

## Code Patterns

### Handler Pattern
```go
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

    // Database operation...
    respondJSON(w, http.StatusCreated, result)
}
```

### Middleware Pattern
```go
func RequireAuth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Validate JWT from cookie or Authorization header
        // Add userID to context
        ctx := context.WithValue(r.Context(), UserIDKey, userID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### Ownership Check Pattern
```go
var authorID *string
h.db.QueryRow(ctx, "SELECT author_id FROM campgrounds WHERE id = $1", id).Scan(&authorID)
if authorID == nil || *authorID != userID {
    respondError(w, http.StatusForbidden, "You don't have permission")
    return
}
```

## Database Schema

Uses same PostgreSQL schema as other backends:

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Campgrounds table
CREATE TABLE campgrounds (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price DECIMAL NOT NULL,
    image VARCHAR,
    description TEXT,
    location VARCHAR,
    author_id VARCHAR REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    campground_id INTEGER REFERENCES campgrounds(id) ON DELETE CASCADE,
    author_id VARCHAR REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Key Differences from Node.js APIs

| Aspect | Go | Node.js |
|--------|-----|---------|
| Concurrency | Goroutines (built-in) | Event loop |
| Type safety | Compile-time | Runtime (TS helps) |
| Error handling | Explicit returns | try/catch |
| Dependency injection | Manual (structs) | Container or manual |
| HTTP router | Chi (stdlib-compatible) | Express/Hono |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3004 |
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET | Secret for signing JWTs | Required |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |

## Testing

```bash
# Run tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./internal/handlers/...
```

## Common Tasks

### Add New Handler
1. Create handler file in `internal/handlers/`
2. Create struct with `*pgxpool.Pool` field
3. Add constructor function `New<Name>Handler(db *pgxpool.Pool)`
4. Wire up in `cmd/server/main.go`

### Add New Middleware
1. Create in `internal/middleware/`
2. Follow `func(next http.Handler) http.Handler` signature
3. Apply with `r.Use(middleware.Name)` in router

### Add Validation
1. Add struct tags in `internal/models/models.go`
2. Use `validate:"required,min=3"` format
3. Call `validator.Validate(req)` in handler
