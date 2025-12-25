# YelpCamp UI - Nuxt 4

## Project Overview

This is a Nuxt 4 frontend implementation of the YelpCamp application. It can connect to any YelpCamp-compatible backend API.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Nuxt 4 (Vue 3) |
| UI Components | Nuxt UI 4 |
| Styling | Tailwind CSS (via Nuxt UI) |
| API Client | tRPC Client |
| Authentication | better-auth |
| Validation | Zod |
| State Management | Vue Composables |
| Testing | Vitest (unit), Playwright (e2e) |
| Language | TypeScript |

## Project Structure

```
YelpCamp_UI_Nuxt4/
├── app/                    # Nuxt 4 app directory
│   ├── components/         # Vue components
│   ├── composables/        # Reusable composables
│   ├── layouts/            # Page layouts
│   ├── pages/              # File-based routing
│   └── plugins/            # Nuxt plugins
├── server/                 # Nitro server (API routes)
│   ├── api/                # API endpoints
│   ├── db/                 # Database (Drizzle)
│   ├── trpc/               # tRPC routers
│   └── utils/              # Server utilities
├── tests/                  # Test files
├── e2e/                    # Playwright E2E tests
├── nuxt.config.ts          # Nuxt configuration
└── package.json
```

## Commands

```bash
# Development
npm run dev              # Start dev server

# Build & Preview
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests (watch mode)
npm run test:run         # Run unit tests once
npm run test:coverage    # Run tests with coverage
npm run e2e              # Run Playwright E2E tests
npm run e2e:ui           # Playwright UI mode

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run typecheck        # TypeScript check
npm run check            # Run all checks

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Push schema to DB
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Seed database
```

## Key Patterns

### File-Based Routing
Pages in `app/pages/` automatically become routes:
- `pages/index.vue` -> `/`
- `pages/campgrounds/index.vue` -> `/campgrounds`
- `pages/campgrounds/[id].vue` -> `/campgrounds/:id`

### tRPC Integration
```typescript
// Using tRPC in components
const { $client } = useNuxtApp()
const { data } = await $client.campground.list.useQuery()
```

### Authentication
```typescript
// Using better-auth
const { signIn, signUp, signOut, user } = useAuth()
```

### Components (Nuxt UI 4)
```vue
<UButton>Click me</UButton>
<UInput v-model="value" />
<UCard>Content</UCard>
```

## Environment Variables

```env
DATABASE_URL=           # PostgreSQL connection string
NUXT_SESSION_SECRET=    # Session encryption secret
```

## Connecting to Different Backends

This UI can connect to any YelpCamp-compatible backend by configuring the API endpoint:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001'
    }
  }
})
```

## Related Documentation

- See `../SPECS.md` for complete YelpCamp specification
- [Nuxt 4 Docs](https://nuxt.com/docs)
- [Nuxt UI 4 Docs](https://ui.nuxt.com)
- [tRPC Docs](https://trpc.io/docs)
- [better-auth Docs](https://www.better-auth.com/)
