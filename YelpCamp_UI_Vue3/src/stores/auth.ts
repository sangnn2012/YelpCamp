import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { api } from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchUser() {
    try {
      const data = await api.get<User>('/auth/me')
      user.value = data
    } catch {
      user.value = null
    }
  }

  async function login(username: string, password: string) {
    loading.value = true
    try {
      const data = await api.post<User>('/auth/login', { username, password })
      user.value = data
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  async function register(username: string, email: string, password: string) {
    loading.value = true
    try {
      const data = await api.post<User>('/auth/register', { username, email, password })
      user.value = data
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await api.post('/auth/logout', {})
    user.value = null
  }

  return {
    user,
    loading,
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout
  }
})
