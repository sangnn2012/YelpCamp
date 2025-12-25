<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Campground } from '@/types'

defineProps<{
  campground: Campground
}>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <img
      :src="campground.image"
      :alt="campground.name"
      class="w-full h-48 object-cover"
    />
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ campground.name }}</h3>
      <p class="text-gray-600 text-sm mt-1">{{ campground.location }}</p>
      <div class="flex justify-between items-center mt-4">
        <span class="text-green-600 font-bold">${{ campground.price }}/night</span>
        <RouterLink
          :to="`/campgrounds/${campground.id}`"
          class="text-blue-600 hover:text-blue-800"
        >
          View Details
        </RouterLink>
      </div>
    </div>
  </div>
</template>
