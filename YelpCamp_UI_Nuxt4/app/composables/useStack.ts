interface BackendStack {
  framework: string
  color: string
  runtime: string
  database: string
  orm: string
  auth: string
}

interface StackInfo {
  frontend: string
  backend: string | null
  backendColor: string | null
  full: string
}

export const useStack = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || ''

  const backendStack = ref<BackendStack | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const frontend = 'Nuxt 4'

  const stackInfo = computed<StackInfo>(() => {
    const backend = backendStack.value?.framework || null
    const backendColor = backendStack.value?.color || null
    return {
      frontend,
      backend,
      backendColor,
      full: backend ? `${frontend} + ${backend}` : frontend
    }
  })

  const fetchBackendStack = async () => {
    // Only fetch if using external API
    if (!apiUrl) {
      backendStack.value = { framework: 'Nitro', color: '#18181B', runtime: 'Node', database: 'PostgreSQL', orm: 'Drizzle', auth: 'Better Auth' }
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(apiUrl, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch backend info')
      }

      const data = await response.json()
      backendStack.value = data.stack
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      // Fallback
      backendStack.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    frontend,
    backendStack,
    stackInfo,
    isLoading,
    error,
    fetchBackendStack
  }
}
