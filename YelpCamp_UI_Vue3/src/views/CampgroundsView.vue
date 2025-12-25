<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCampgrounds } from '@/composables/useCampgrounds'
import { useAuthStore } from '@/stores/auth'
import CampgroundCard from '@/components/CampgroundCard.vue'

const authStore = useAuthStore()
const page = ref(1)
const search = ref('')

const { data, isLoading, error } = useCampgrounds(page.value, search.value)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Campgrounds</h1>
      <RouterLink
        v-if="authStore.isAuthenticated"
        to="/campgrounds/new"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Campground
      </RouterLink>
    </div>

    <div class="mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Search campgrounds..."
        class="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading campgrounds...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">Error loading campgrounds</p>
    </div>

    <div v-else-if="data?.data.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CampgroundCard
        v-for="campground in data.data"
        :key="campground.id"
        :campground="campground"
      />
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-600">No campgrounds found</p>
    </div>
  </div>
</template>
