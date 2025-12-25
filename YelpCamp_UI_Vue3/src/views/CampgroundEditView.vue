<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCampground, useUpdateCampground } from '@/composables/useCampgrounds'
import { useFlashStore } from '@/stores/flash'

const route = useRoute()
const router = useRouter()
const flashStore = useFlashStore()

const id = computed(() => Number(route.params.id))
const { data: campground, isLoading } = useCampground(id.value)
const updateMutation = useUpdateCampground()

const form = ref({
  name: '',
  price: '',
  image: '',
  location: '',
  description: ''
})

watch(campground, (c) => {
  if (c) {
    form.value = {
      name: c.name,
      price: c.price,
      image: c.image,
      location: c.location || '',
      description: c.description
    }
  }
}, { immediate: true })

async function handleSubmit() {
  try {
    await updateMutation.mutateAsync({ id: id.value, data: form.value })
    flashStore.success('Campground updated!')
    router.push(`/campgrounds/${id.value}`)
  } catch {
    flashStore.error('Failed to update campground')
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Edit Campground</h1>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
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
          :disabled="updateMutation.isPending.value"
          class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {{ updateMutation.isPending.value ? 'Saving...' : 'Save Changes' }}
        </button>
        <RouterLink :to="`/campgrounds/${id}`" class="text-gray-600 hover:text-gray-900 py-2">
          Cancel
        </RouterLink>
      </div>
    </form>
  </div>
</template>
