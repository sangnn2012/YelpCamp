<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { signIn, isAuthenticated } = useAuth()
const { setFlash } = useFlash()

// Redirect if already logged in
watchEffect(() => {
  if (isAuthenticated.value) {
    navigateTo('/campgrounds')
  }
})

const loading = ref(false)
const form = ref({
  email: '',
  password: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await signIn({
      email: form.value.email,
      password: form.value.password
    })
    setFlash('success', 'Welcome back!')
    navigateTo('/campgrounds')
  } catch (error: any) {
    setFlash('error', error.message || 'Invalid email or password')
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
          Login
        </h1>
      </template>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <UFormField
          label="Email"
          name="email"
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
        >
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Your password"
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
          Login
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <NuxtLink
            to="/register"
            class="text-primary-600 hover:underline"
          >
            Sign up
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
