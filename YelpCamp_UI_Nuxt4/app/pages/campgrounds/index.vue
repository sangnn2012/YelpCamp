<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { $trpc } = useNuxtApp()
const { isAuthenticated } = useAuth()
const route = useRoute()
const router = useRouter()

// Search and pagination state
const searchQuery = ref((route.query.search as string) || '')
const currentPage = ref(Number(route.query.page) || 1)
const limit = 12

// Debounced search
const debouncedSearch = ref(searchQuery.value)
let searchTimeout: ReturnType<typeof setTimeout>

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
    currentPage.value = 1
  }, 300)
})

// Fetch campgrounds with search and pagination
const { data, pending, error } = await useAsyncData(
  'campgrounds',
  () => $trpc.campground.list.query({
    search: debouncedSearch.value || undefined,
    page: currentPage.value,
    limit
  }),
  {
    watch: [debouncedSearch, currentPage]
  }
)

// Update URL when search/page changes
watch([debouncedSearch, currentPage], () => {
  const query: Record<string, string> = {}
  if (debouncedSearch.value) {
    query.search = debouncedSearch.value
  }
  if (currentPage.value > 1) {
    query.page = String(currentPage.value)
  }
  router.replace({ query })
})

const goToPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearSearch = () => {
  searchQuery.value = ''
  debouncedSearch.value = ''
  currentPage.value = 1
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to YelpCamp!
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">
        View our hand-picked campgrounds from all over the world
      </p>
      <UButton
        v-if="isAuthenticated"
        to="/campgrounds/new"
        color="primary"
        size="lg"
      >
        Add New Campground
      </UButton>
    </div>

    <!-- Search Bar -->
    <div class="max-w-xl mx-auto mb-8">
      <div class="relative">
        <UInput
          v-model="searchQuery"
          placeholder="Search campgrounds by name, description, or location..."
          icon="i-lucide-search"
          size="lg"
        />
        <UButton
          v-if="searchQuery"
          variant="ghost"
          size="xs"
          icon="i-lucide-x"
          class="absolute right-2 top-1/2 -translate-y-1/2"
          @click="clearSearch"
        />
      </div>
      <p
        v-if="debouncedSearch && data?.pagination"
        class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center"
      >
        Found {{ data.pagination.total }} campground{{ data.pagination.total === 1 ? '' : 's' }}
        matching "{{ debouncedSearch }}"
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex justify-center py-12"
    >
      <UButton
        loading
        variant="ghost"
        size="xl"
      />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      title="Error loading campgrounds"
      :description="error.message"
    />

    <!-- Empty State -->
    <div
      v-else-if="!data?.campgrounds?.length"
      class="text-center py-12"
    >
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        <template v-if="debouncedSearch">
          No campgrounds found matching "{{ debouncedSearch }}".
        </template>
        <template v-else>
          No campgrounds yet. Be the first to add one!
        </template>
      </p>
      <div class="flex gap-2 justify-center">
        <UButton
          v-if="debouncedSearch"
          variant="outline"
          @click="clearSearch"
        >
          Clear Search
        </UButton>
        <UButton
          v-if="isAuthenticated"
          to="/campgrounds/new"
          color="primary"
        >
          Add Campground
        </UButton>
      </div>
    </div>

    <!-- Campground Grid -->
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <UCard
          v-for="campground in data.campgrounds"
          :key="campground.id"
          class="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <template #header>
            <div class="aspect-video overflow-hidden -mx-4 -mt-4">
              <img
                :src="campground.image"
                :alt="campground.name"
                class="w-full h-full object-cover"
                loading="lazy"
              >
            </div>
          </template>

          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ campground.name }}
            </h3>
            <p
              v-if="campground.location"
              class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="w-3 h-3"
              />
              {{ campground.location }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ campground.description }}
            </p>
          </div>

          <template #footer>
            <div class="flex items-center justify-between">
              <span class="text-primary-600 font-semibold">
                ${{ campground.price }}/night
              </span>
              <UButton
                :to="`/campgrounds/${campground.id}`"
                variant="ghost"
                trailing-icon="i-lucide-arrow-right"
              >
                More Info
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Pagination -->
      <div
        v-if="data.pagination.totalPages > 1"
        class="flex justify-center items-center gap-2 mt-8"
      >
        <UButton
          variant="outline"
          icon="i-lucide-chevron-left"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        />

        <template
          v-for="page in data.pagination.totalPages"
          :key="page"
        >
          <UButton
            v-if="page === 1 || page === data.pagination.totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
            :variant="page === currentPage ? 'solid' : 'outline'"
            :color="page === currentPage ? 'primary' : 'neutral'"
            @click="goToPage(page)"
          >
            {{ page }}
          </UButton>
          <span
            v-else-if="page === currentPage - 2 || page === currentPage + 2"
            class="px-2 text-gray-400"
          >
            ...
          </span>
        </template>

        <UButton
          variant="outline"
          icon="i-lucide-chevron-right"
          :disabled="currentPage === data.pagination.totalPages"
          @click="goToPage(currentPage + 1)"
        />
      </div>

      <!-- Results info -->
      <p
        v-if="data.pagination.total > 0"
        class="text-center text-sm text-gray-500 dark:text-gray-400 mt-4"
      >
        Showing {{ (currentPage - 1) * limit + 1 }}-{{ Math.min(currentPage * limit, data.pagination.total) }}
        of {{ data.pagination.total }} campgrounds
      </p>
    </template>
  </div>
</template>
