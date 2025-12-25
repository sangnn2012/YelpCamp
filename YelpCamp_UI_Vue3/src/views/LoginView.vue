<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const flashStore = useFlashStore()

const form = ref({
  username: '',
  password: ''
})

async function handleSubmit() {
  const result = await authStore.login(form.value.username, form.value.password)

  if (result.success) {
    const redirect = route.query.redirect as string || '/campgrounds'
    router.push(redirect)
  } else {
    flashStore.error(result.error || 'Login failed')
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">Login</h1>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-gray-700 mb-2">Username</label>
        <input
          v-model="form.username"
          type="text"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 mb-2">Password</label>
        <input
          v-model="form.password"
          type="password"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {{ authStore.loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <p class="text-center mt-4 text-gray-600">
      Don't have an account?
      <RouterLink to="/register" class="text-green-600 hover:text-green-800">
        Sign up
      </RouterLink>
    </p>
  </div>
</template>
