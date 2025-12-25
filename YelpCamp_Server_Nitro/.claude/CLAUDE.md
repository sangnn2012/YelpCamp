# YelpCamp Server - Nitro

## Project Overview

This is a standalone Nitro server implementation of the YelpCamp API. Nitro is the server engine that powers Nuxt, but can run independently as a high-performance server.

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js / Edge |
| Framework | Nitro (standalone) |
| API Layer | tRPC v10 |
| Authentication | better-auth |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod |
| Language | TypeScript |

## Project Structure

```
YelpCamp_Server_Nitro/
├── db/                     # Database layer
│   ├── index.ts            # Drizzle client
│   ├── schema.ts           # Database schema
│   └── seed.ts             # Seed data
├── server/                 # Nitro server
│   ├── api/                # API routes
│   │   ├── auth/[...].ts   # Auth endpoints
│   │   ├── trpc/[trpc].ts  # tRPC handler
│   │   └── health.ts       # Health check
│   ├── trpc/               # tRPC layer
│   │   ├── context.ts      # tRPC context
│   │   ├── index.ts        # Router exports
│   │   ├── trpc.ts         # tRPC init
│   │   └── routers/        # tRPC routers
│   └── utils/              # Server utilities
│       └── auth.ts         # Auth configuration
├── nitro.config.ts         # Nitro configuration
├── drizzle.config.ts       # Drizzle configuration
└── package.json
```

## Commands

```bash
# Development
npm run dev              # Start Nitro dev server (port 3002)

# Build & Production
npm run build            # Build for production
npm run preview          # Run production build

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Push schema to DB
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Seed database
```

## API Endpoints

```
GET  /api/health              # Health check
POST /api/auth/*              # Authentication (better-auth)
*    /api/trpc/*              # tRPC endpoints
```

### tRPC Procedures

```
campground.list              # List campgrounds (paginated, searchable)
campground.getById           # Get single campground with comments
campground.create            # Create campground (auth required)
campground.update            # Update campground (owner only)
campground.delete            # Delete campground (owner only)

comment.create               # Create comment (auth required)
comment.getById              # Get single comment
comment.update               # Update comment (owner only)
comment.delete               # Delete comment (owner only)
```

## Environment Variables

```env
DATABASE_URL=               # PostgreSQL connection string
BETTER_AUTH_URL=            # Server URL (default: http://localhost:3002)
BETTER_AUTH_SECRET=         # Auth secret key
```

## Why Standalone Nitro?

- **Separation of Concerns**: Decouples backend from frontend
- **Edge Deployment**: Can deploy to edge runtimes (Cloudflare Workers, Vercel Edge)
- **Performance**: Optimized for server workloads
- **Familiarity**: Same patterns as Nuxt server, easier transition
- **Universal**: Works with any frontend, not just Nuxt

## Connecting Frontends

Configure the frontend to point to this server:

```typescript
// In frontend config
const API_BASE = 'http://localhost:3002'
```

## Related Documentation

- See `../SPECS.md` for complete YelpCamp specification
- [Nitro Docs](https://nitro.unjs.io/)
- [tRPC Docs](https://trpc.io/docs)
- [Drizzle Docs](https://orm.drizzle.team/)
- [better-auth Docs](https://www.better-auth.com/)
