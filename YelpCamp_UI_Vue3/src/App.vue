<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import FlashMessage from '@/components/FlashMessage.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <FlashMessage />
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
