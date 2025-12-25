<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { signUp, isAuthenticated } = useAuth()
const { setFlash } = useFlash()

// Redirect if already logged in
watchEffect(() => {
  if (isAuthenticated.value) {
    navigateTo('/campgrounds')
  }
})

const loading = ref(false)
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}

  if (!form.value.username) {
    errors.value.username = 'Username is required'
  } else if (form.value.username.length < 3 || form.value.username.length > 30) {
    errors.value.username = 'Username must be 3-30 characters'
  } else if (!/^[a-zA-Z0-9]+$/.test(form.value.username)) {
    errors.value.username = 'Username must contain only letters and numbers'
  }

  if (!form.value.email) {
    errors.value.email = 'Email is required'
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    await signUp({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      name: form.value.username
    })
    setFlash('success', `Welcome to YelpCamp, ${form.value.username}!`)
    navigateTo('/campgrounds')
  } catch (error: any) {
    setFlash('error', error.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-16">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          Sign Up
        </h1>
      </template>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <UFormField
          label="Username"
          name="username"
          :error="errors.username"
        >
          <UInput
            v-model="form.username"
            placeholder="Choose a username"
            required
            :disabled="loading"
          />
        </UFormField>

        <UFormField
          label="Email"
          name="email"
          :error="errors.email"
        >
          <UInput
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            required
            :disabled="loading"
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
          :error="errors.password"
        >
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Choose a password (min 6 chars)"
            required
            :disabled="loading"
          />
        </UFormField>

        <UFormField
          label="Confirm Password"
          name="confirmPassword"
          :error="errors.confirmPassword"
        >
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            :disabled="loading"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="loading"
        >
          Sign Up
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <NuxtLink
            to="/login"
            class="text-primary-600 hover:underline"
          >
            Login
          </NuxtLink>
        </p>
      </template>
    </UCard>

    <div class="mt-4 text-center">
      <NuxtLink
        to="/campgrounds"
        class="text-sm text-gray-600 dark:text-gray-400 hover:underline"
      >
        Go Back
      </NuxtLink>
    </div>
  </div>
</template>
