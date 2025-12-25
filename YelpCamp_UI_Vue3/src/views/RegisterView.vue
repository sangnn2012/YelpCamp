<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'

const router = useRouter()
const authStore = useAuthStore()
const flashStore = useFlashStore()

const form = ref({
  username: '',
  email: '',
  password: ''
})

async function handleSubmit() {
  const result = await authStore.register(
    form.value.username,
    form.value.email,
    form.value.password
  )

  if (result.success) {
    flashStore.success('Welcome to YelpCamp!')
    router.push('/campgrounds')
  } else {
    flashStore.error(result.error || 'Registration failed')
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">Sign Up</h1>

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
        <label class="block text-gray-700 mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
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
          minlength="6"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {{ authStore.loading ? 'Creating account...' : 'Sign Up' }}
      </button>
    </form>

    <p class="text-center mt-4 text-gray-600">
      Already have an account?
      <RouterLink to="/login" class="text-green-600 hover:text-green-800">
        Login
      </RouterLink>
    </p>
  </div>
</template>
