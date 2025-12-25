<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <header class="bg-white shadow">
    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
      <RouterLink to="/" class="text-xl font-bold text-green-600">
        YelpCamp
      </RouterLink>

      <div class="flex items-center gap-4">
        <RouterLink to="/campgrounds" class="text-gray-600 hover:text-gray-900">
          Campgrounds
        </RouterLink>

        <template v-if="authStore.isAuthenticated">
          <span class="text-gray-600">{{ authStore.user?.username }}</span>
          <button
            @click="authStore.logout"
            class="text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </template>

        <template v-else>
          <RouterLink to="/login" class="text-gray-600 hover:text-gray-900">
            Login
          </RouterLink>
          <RouterLink
            to="/register"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Sign Up
          </RouterLink>
        </template>
      </div>
    </nav>
  </header>
</template>
