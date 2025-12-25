# YelpCamp API - Hono

## Project Overview

This is a Hono + Bun backend implementation of the YelpCamp API. It provides a REST/tRPC API that any YelpCamp-compatible frontend can connect to.

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Bun |
| Framework | Hono |
| API Layer | tRPC v11 + REST endpoints |
| Authentication | better-auth |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod v4 |
| Password Hashing | Oslo |
| Language | TypeScript |

## Project Structure

```
YelpCamp_API_Hono/
├── src/
│   ├── db/                 # Database layer
│   │   ├── index.ts        # Drizzle client
│   │   ├── schema.ts       # Database schema
│   │   └── seed.ts         # Seed data
│   ├── lib/                # Shared utilities
│   │   ├── auth.ts         # Auth configuration
│   │   ├── errors.ts       # Error handling
│   │   └── validation.ts   # Zod schemas
│   ├── middleware/         # Hono middleware
│   │   └── auth.ts         # Auth middleware
│   ├── routes/             # REST route handlers
│   │   ├── campgrounds.ts  # Campground routes
│   │   └── comments.ts     # Comment routes
│   ├── trpc/               # tRPC layer
│   │   ├── context.ts      # tRPC context
│   │   ├── index.ts        # Router exports
│   │   ├── trpc.ts         # tRPC init
│   │   └── routers/        # tRPC routers
│   ├── types/              # TypeScript types
│   └── index.ts            # App entry point
├── drizzle.config.ts       # Drizzle configuration
└── package.json
```

## Commands

```bash
# Development
bun run dev              # Start dev server (watch mode)
bun run start            # Start production server

# Database
bun run db:generate      # Generate migrations
bun run db:push          # Push schema to DB
bun run db:studio        # Open Drizzle Studio
bun run db:seed          # Seed database
```

## Key Patterns

### Hono App Setup
```typescript
import { Hono } from 'hono'

const app = new Hono()
app.get('/campgrounds', (c) => c.json(campgrounds))
```

### tRPC Router
```typescript
export const campgroundRouter = router({
  list: publicProcedure.query(async () => {
    return await db.select().from(campgrounds)
  }),
  create: protectedProcedure
    .input(createCampgroundSchema)
    .mutation(async ({ input, ctx }) => {
      // Create campground with ctx.user
    })
})
```

### Authentication Middleware
```typescript
import { authMiddleware } from './middleware/auth'

app.use('/api/protected/*', authMiddleware)
```

### Drizzle Queries
```typescript
// Select
const camps = await db.select().from(campgrounds)

// Insert
await db.insert(campgrounds).values({ name, price, ... })

// Update
await db.update(campgrounds).set({ name }).where(eq(campgrounds.id, id))

// Delete
await db.delete(campgrounds).where(eq(campgrounds.id, id))
```

## API Endpoints

### REST Endpoints
```
GET    /campgrounds              # List all campgrounds
GET    /campgrounds/:id          # Get campground by ID
POST   /campgrounds              # Create campground (auth)
PUT    /campgrounds/:id          # Update campground (owner)
DELETE /campgrounds/:id          # Delete campground (owner)

POST   /campgrounds/:id/comments # Create comment (auth)
PUT    /comments/:id             # Update comment (owner)
DELETE /comments/:id             # Delete comment (owner)

POST   /auth/register            # Register user
POST   /auth/login               # Login
POST   /auth/logout              # Logout
GET    /auth/session             # Get current session
```

### tRPC Endpoints
```
trpc.campground.list
trpc.campground.getById
trpc.campground.create
trpc.campground.update
trpc.campground.delete

trpc.comment.create
trpc.comment.update
trpc.comment.delete
```

## Environment Variables

```env
DATABASE_URL=           # PostgreSQL connection string
PORT=3001               # Server port (default: 3001)
```

## CORS Configuration

By default, CORS is configured to allow connections from any YelpCamp frontend:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))
```

## Related Documentation

- See `../SPECS.md` for complete YelpCamp specification
- [Hono Docs](https://hono.dev/)
- [Bun Docs](https://bun.sh/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Drizzle Docs](https://orm.drizzle.team/)
- [better-auth Docs](https://www.better-auth.com/)
