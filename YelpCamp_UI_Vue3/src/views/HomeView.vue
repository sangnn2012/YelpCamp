<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 class="text-5xl font-bold text-gray-900 mb-4">Welcome to YelpCamp!</h1>
    <p class="text-xl text-gray-600 mb-8">
      Discover amazing campgrounds shared by our community
    </p>
    <RouterLink
      to="/campgrounds"
      class="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition-colors"
    >
      View All Campgrounds
    </RouterLink>
  </div>
</template>
