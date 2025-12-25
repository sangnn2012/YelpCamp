<script setup lang="ts">
const { user, isAuthenticated, signOut, isPending } = useAuth()
const { flash, clearFlash } = useFlash()
const { stackInfo, fetchBackendStack } = useStack()
const router = useRouter()

const handleLogout = async () => {
  await signOut()
  clearFlash()
  navigateTo('/campgrounds')
}

// Clear flash on route change
watch(() => router.currentRoute.value.path, () => {
  clearFlash()
})

// Fetch backend stack info on mount
onMounted(() => {
  fetchBackendStack()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/"
              class="text-xl font-bold text-primary-600 dark:text-primary-400"
            >
              YelpCamp
            </NuxtLink>
            <span
              v-if="stackInfo.backend"
              class="text-xl font-bold"
            >
              <span class="text-[#00DC82]">{{ stackInfo.frontend }}</span>
              <span class="text-gray-400 mx-1">+</span>
              <span :style="{ color: stackInfo.backendColor }">{{ stackInfo.backend }}</span>
            </span>
          </div>

          <div class="flex items-center gap-4">
            <template v-if="isPending">
              <UButton
                loading
                variant="ghost"
              />
            </template>
            <template v-else-if="isAuthenticated && user">
              <span class="text-sm text-gray-600 dark:text-gray-300">
                Signed in as <strong>{{ user.name || user.email }}</strong>
              </span>
              <UButton
                variant="ghost"
                @click="handleLogout"
              >
                Logout
              </UButton>
            </template>
            <template v-else>
              <UButton
                to="/login"
                variant="ghost"
              >
                Login
              </UButton>
              <UButton
                to="/register"
                color="primary"
              >
                Sign Up
              </UButton>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Flash Messages -->
    <div
      v-if="flash"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4"
    >
      <UAlert
        :color="flash.type === 'success' ? 'success' : 'error'"
        :title="flash.message"
        :close-button="{ icon: 'i-lucide-x', color: 'neutral', variant: 'link' }"
        @close="clearFlash"
      />
    </div>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          YelpCamp &copy; {{ new Date().getFullYear() }}
        </p>
      </div>
    </footer>
  </div>
</template>
