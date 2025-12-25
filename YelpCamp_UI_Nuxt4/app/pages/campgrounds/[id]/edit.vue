<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { $trpc } = useNuxtApp()
const { user } = useAuth()
const { setFlash } = useFlash()

const campgroundId = computed(() => Number(route.params.id))

const { data: campground, pending, error } = await useAsyncData(
  `campground-edit-${campgroundId.value}`,
  () => $trpc.campground.getById.query({ id: campgroundId.value })
)

// Check ownership
watchEffect(() => {
  if (campground.value && user.value) {
    if (campground.value.author?.id !== user.value.id) {
      setFlash('error', 'You don\'t have permission to do that')
      navigateTo(`/campgrounds/${campgroundId.value}`)
    }
  }
})

const loading = ref(false)
const form = ref({
  name: '',
  price: '',
  image: '',
  description: '',
  location: ''
})

// Initialize form with campground data
watchEffect(() => {
  if (campground.value) {
    form.value = {
      name: campground.value.name,
      price: campground.value.price,
      image: campground.value.image,
      description: campground.value.description,
      location: campground.value.location || ''
    }
  }
})

const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Campground name is required'
  } else if (form.value.name.length > 100) {
    errors.value.name = 'Name must be less than 100 characters'
  }

  if (!form.value.price.trim()) {
    errors.value.price = 'Price is required'
  }

  if (!form.value.image.trim()) {
    errors.value.image = 'Image URL is required'
  } else {
    try {
      new URL(form.value.image)
    } catch {
      errors.value.image = 'Must be a valid URL'
    }
  }

  if (!form.value.description.trim()) {
    errors.value.description = 'Description is required'
  } else if (form.value.description.length > 5000) {
    errors.value.description = 'Description must be less than 5000 characters'
  }

  if (form.value.location && form.value.location.length > 200) {
    errors.value.location = 'Location must be less than 200 characters'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    await $trpc.campground.update.mutate({
      id: campgroundId.value,
      data: {
        name: form.value.name,
        price: form.value.price,
        image: form.value.image,
        description: form.value.description,
        location: form.value.location || undefined
      }
    })
    setFlash('success', 'Campground updated successfully!')
    navigateTo(`/campgrounds/${campgroundId.value}`)
  } catch (error: any) {
    setFlash('error', error.message || 'Failed to update campground')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
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
      title="Error"
      :description="error.message"
    />

    <!-- Edit Form -->
    <template v-else-if="campground">
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold text-center">
            Edit {{ campground.name }}
          </h1>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <UFormField
            label="Campground Name"
            name="name"
            :error="errors.name"
          >
            <UInput
              v-model="form.name"
              placeholder="e.g., Mountain View Camp"
              required
              :disabled="loading"
            />
          </UFormField>

          <UFormField
            label="Price ($/night)"
            name="price"
            :error="errors.price"
          >
            <UInput
              v-model="form.price"
              placeholder="e.g., 25.00"
              required
              :disabled="loading"
            />
          </UFormField>

          <UFormField
            label="Image URL"
            name="image"
            :error="errors.image"
          >
            <UInput
              v-model="form.image"
              type="url"
              placeholder="https://example.com/image.jpg"
              required
              :disabled="loading"
            />
          </UFormField>

          <UFormField
            label="Location"
            name="location"
            :error="errors.location"
            hint="Optional"
          >
            <UInput
              v-model="form.location"
              placeholder="e.g., Yosemite National Park, California"
              :disabled="loading"
              icon="i-lucide-map-pin"
            />
          </UFormField>

          <UFormField
            label="Description"
            name="description"
            :error="errors.description"
          >
            <UTextarea
              v-model="form.description"
              placeholder="Describe the campground..."
              :rows="6"
              required
              :disabled="loading"
            />
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            block
            :loading="loading"
          >
            Update Campground
          </UButton>
        </form>
      </UCard>

      <div class="mt-4 text-center">
        <NuxtLink
          :to="`/campgrounds/${campground.id}`"
          class="text-sm text-gray-600 dark:text-gray-400 hover:underline"
        >
          Go Back
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
