<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div class="relative min-h-[calc(100vh-8rem)] flex items-center justify-center">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920&q=80');"
    >
      <div class="absolute inset-0 bg-black/50" />
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center px-4">
      <h1 class="text-5xl md:text-7xl font-bold text-white mb-6">
        Welcome to YelpCamp!
      </h1>
      <p class="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
        Discover and share the best campgrounds from all over the world.
        Join our community of outdoor enthusiasts today.
      </p>
      <UButton
        to="/campgrounds"
        size="xl"
        color="primary"
        class="text-lg"
      >
        View All Campgrounds
      </UButton>
    </div>
  </div>
</template>
