import superjson from 'superjson'
import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import type { AppRouter } from '../../server/trpc'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Use external API URL in development, or local tRPC in production
  const apiUrl = config.public.apiUrl || ''
  const trpcUrl = apiUrl ? `${apiUrl}/api/trpc` : '/api/trpc'

  const trpc = createTRPCNuxtClient<AppRouter>({
    links: [
      httpBatchLink({
        url: trpcUrl,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include' // Important for cross-origin auth cookies
          })
        }
      })
    ],
    transformer: superjson
  })

  return {
    provide: {
      trpc
    }
  }
})
