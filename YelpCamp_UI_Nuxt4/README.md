# YelpCamp 2025

A modern full-stack campground discovery and review application built with Nuxt 4, tRPC, Drizzle ORM, and Better-Auth.

## Tech Stack

- **Frontend**: Nuxt 4 (Vue 3 + SSR), Nuxt UI, TailwindCSS
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-Auth (session-based)
- **Validation**: Zod

## Features

- Browse campgrounds with images, prices, and descriptions
- User registration and login with secure password hashing
- Create, edit, and delete campgrounds (authenticated users)
- Add, edit, and delete comments on campgrounds
- Authorization - only owners can modify their content
- Flash messages for user feedback
- Responsive design with dark mode support

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

## Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Secret key for session encryption (min 32 chars)
   - `BETTER_AUTH_URL` - Your app URL (e.g., http://localhost:3000)

3. **Set up the database**

   Push the schema to your database:
   ```bash
   npm run db:push
   ```

   Or generate and run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with sample data |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
YelpCamp_2025/
├── app/
│   ├── pages/                    # Vue pages
│   │   ├── index.vue             # Landing page
│   │   ├── login.vue             # Login form
│   │   ├── register.vue          # Registration form
│   │   └── campgrounds/          # Campground pages
│   ├── components/               # Reusable components
│   ├── composables/              # Vue composables
│   │   ├── useAuth.ts            # Authentication helper
│   │   ├── useFlash.ts           # Flash messages
│   │   └── useTrpc.ts            # tRPC client
│   ├── layouts/                  # Page layouts
│   ├── middleware/               # Route middleware
│   └── plugins/                  # Nuxt plugins
├── server/
│   ├── api/                      # API routes
│   │   ├── auth/                 # Better-Auth handler
│   │   └── trpc/                 # tRPC handler
│   ├── db/                       # Database
│   │   ├── schema.ts             # Drizzle schema
│   │   ├── index.ts              # DB client
│   │   └── seed.ts               # Seed script
│   ├── trpc/                     # tRPC routers
│   │   ├── routers/
│   │   │   ├── campground.ts     # Campground procedures
│   │   │   └── comment.ts        # Comment procedures
│   │   ├── trpc.ts               # Base router setup
│   │   ├── context.ts            # tRPC context
│   │   └── index.ts              # Main router
│   └── utils/
│       └── auth.ts               # Better-Auth config
├── drizzle/                      # Database migrations
├── nuxt.config.ts                # Nuxt configuration
├── drizzle.config.ts             # Drizzle configuration
└── package.json
```

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | - | Landing page |
| GET | `/login` | - | Login form |
| POST | `/api/auth/*` | - | Authentication endpoints |
| GET | `/campgrounds` | - | List all campgrounds |
| GET | `/campgrounds/new` | Required | New campground form |
| GET | `/campgrounds/:id` | - | View campground |
| GET | `/campgrounds/:id/edit` | Owner | Edit campground form |
| GET | `/campgrounds/:id/comments/new` | Required | New comment form |
| GET | `/campgrounds/:id/comments/:cid/edit` | Owner | Edit comment form |

## License

MIT
