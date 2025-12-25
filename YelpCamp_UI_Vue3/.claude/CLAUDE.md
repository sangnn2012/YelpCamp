# YelpCamp UI - Vue 3

## Project Overview

This is a Vue 3 frontend implementation of the YelpCamp application using Vite, TypeScript, and pnpm.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3 (Composition API) |
| Build Tool | Vite |
| Package Manager | pnpm |
| Styling | Tailwind CSS |
| Routing | Vue Router 4 |
| State Management | Pinia |
| Data Fetching | TanStack Query (Vue Query) |
| HTTP Client | Fetch API |
| Language | TypeScript |

## Project Structure

```
YelpCamp_UI_Vue3/
├── src/
│   ├── assets/           # Static assets, CSS
│   ├── components/       # Reusable Vue components
│   ├── composables/      # Vue composables (hooks)
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia stores
│   ├── types/            # TypeScript types
│   ├── views/            # Page components
│   ├── App.vue           # Root component
│   └── main.ts           # Entry point
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                 # Start dev server (port 3003)

# Build
pnpm build               # Production build
pnpm preview             # Preview production build

# Code Quality
pnpm lint                # ESLint check
pnpm lint:fix            # ESLint auto-fix
pnpm typecheck           # TypeScript check
```

## Key Patterns

### Composition API
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>
```

### Pinia Store
```typescript
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  return { user, isAuthenticated }
})
```

### Vue Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['campgrounds'],
  queryFn: () => api.get('/campgrounds')
})
```

### Route Guards
```typescript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

## Environment Variables

```env
VITE_API_URL=http://localhost:3004    # Go API URL
```

## Connecting to Backends

Configure the API URL in `.env`:

```env
# Connect to Go API
VITE_API_URL=http://localhost:3004

# Or connect to Hono API
VITE_API_URL=http://localhost:3001
```

## Related Documentation

- See `../SPECS.md` for complete YelpCamp specification
- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vite.dev/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Vue Query Docs](https://tanstack.com/query/latest/docs/vue/overview)
- [Tailwind CSS Docs](https://tailwindcss.com/)
