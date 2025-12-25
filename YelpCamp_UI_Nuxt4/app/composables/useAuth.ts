import { usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

// Lazy-initialized auth client singleton
let authClientInstance: ReturnType<typeof createAuthClient> | null = null

function getAuthClient() {
  if (authClientInstance) {
    return authClientInstance
  }

  // Get the API URL from runtime config (set in nuxt.config.ts)
  // This allows pointing auth to external Hono API in development
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || ''
  const baseURL = apiUrl ? `${apiUrl}/api/auth` : '/api/auth'

  authClientInstance = createAuthClient({
    baseURL,
    plugins: [usernameClient()],
    fetchOptions: {
      credentials: 'include' // Important for cross-origin auth cookies
    }
  })

  return authClientInstance
}

export const useAuth = () => {
  const authClient = getAuthClient()
  const session = authClient.useSession()

  const signUp = async (data: {
    username: string
    email: string
    password: string
    name: string
  }) => {
    const result = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      username: data.username
    })

    if (result.error) {
      throw new Error(result.error.message || 'Registration failed')
    }

    return result.data
  }

  const signIn = async (data: {
    email: string
    password: string
  }) => {
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password
    })

    if (result.error) {
      throw new Error(result.error.message || 'Login failed')
    }

    return result.data
  }

  const signOut = async () => {
    await authClient.signOut()
  }

  const isAuthenticated = computed(() => !!session.value?.data?.user)
  const user = computed(() => session.value?.data?.user)
  const isPending = computed(() => session.value?.isPending)

  return {
    session,
    user,
    isAuthenticated,
    isPending,
    signUp,
    signIn,
    signOut
  }
}
