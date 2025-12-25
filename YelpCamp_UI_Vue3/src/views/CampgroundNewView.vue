<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useCreateCampground } from '@/composables/useCampgrounds'
import { useFlashStore } from '@/stores/flash'

const router = useRouter()
const flashStore = useFlashStore()
const createMutation = useCreateCampground()

const form = ref({
  name: '',
  price: '',
  image: '',
  location: '',
  description: ''
})

async function handleSubmit() {
  try {
    await createMutation.mutateAsync(form.value)
    flashStore.success('Campground created!')
    router.push('/campgrounds')
  } catch {
    flashStore.error('Failed to create campground')
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">New Campground</h1>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-gray-700 mb-2">Name</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 mb-2">Price ($/night)</label>
        <input
          v-model="form.price"
          type="text"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 mb-2">Image URL</label>
        <input
          v-model="form.image"
          type="url"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 mb-2">Location</label>
        <input
          v-model="form.location"
          type="text"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 mb-2">Description</label>
        <textarea
          v-model="form.description"
          required
          rows="4"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        ></textarea>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="createMutation.isPending.value"
          class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {{ createMutation.isPending.value ? 'Creating...' : 'Create' }}
        </button>
        <RouterLink to="/campgrounds" class="text-gray-600 hover:text-gray-900 py-2">
          Cancel
        </RouterLink>
      </div>
    </form>
  </div>
</template>
