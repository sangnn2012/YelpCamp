<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCampground, useDeleteCampground } from '@/composables/useCampgrounds'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const flashStore = useFlashStore()

const id = computed(() => Number(route.params.id))
const { data: campground, isLoading, error } = useCampground(id.value)
const deleteMutation = useDeleteCampground()

const isOwner = computed(() => {
  return authStore.user?.id === campground.value?.authorId
})

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this campground?')) return

  try {
    await deleteMutation.mutateAsync(id.value)
    flashStore.success('Campground deleted')
    router.push('/campgrounds')
  } catch {
    flashStore.error('Failed to delete campground')
  }
}
</script>

<template>
  <div>
    <RouterLink to="/campgrounds" class="text-blue-600 hover:text-blue-800 mb-4 inline-block">
      &larr; Back to campgrounds
    </RouterLink>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">Campground not found</p>
    </div>

    <div v-else-if="campground" class="grid md:grid-cols-2 gap-8">
      <div>
        <img
          :src="campground.image"
          :alt="campground.name"
          class="w-full rounded-lg shadow-lg"
        />
      </div>

      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ campground.name }}</h1>
        <p class="text-2xl text-green-600 font-bold mb-4">${{ campground.price }}/night</p>
        <p class="text-gray-600 mb-2">{{ campground.location }}</p>
        <p class="text-gray-700 mb-6">{{ campground.description }}</p>

        <p class="text-sm text-gray-500 mb-4">
          Submitted by: {{ campground.author?.username || 'Unknown' }}
        </p>

        <div v-if="isOwner" class="flex gap-4">
          <RouterLink
            :to="`/campgrounds/${campground.id}/edit`"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit
          </RouterLink>
          <button
            @click="handleDelete"
            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>

        <div class="mt-8">
          <h2 class="text-xl font-semibold mb-4">Comments</h2>
          <div v-if="campground.comments?.length" class="space-y-4">
            <div
              v-for="comment in campground.comments"
              :key="comment.id"
              class="bg-gray-50 p-4 rounded"
            >
              <p class="text-gray-700">{{ comment.text }}</p>
              <p class="text-sm text-gray-500 mt-2">
                - {{ comment.author?.username || 'Unknown' }}
              </p>
            </div>
          </div>
          <p v-else class="text-gray-500">No comments yet</p>
        </div>
      </div>
    </div>
  </div>
</template>
