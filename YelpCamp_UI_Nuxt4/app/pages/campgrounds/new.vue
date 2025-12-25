<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { $trpc } = useNuxtApp()
const { setFlash } = useFlash()

const loading = ref(false)
const form = ref({
  name: '',
  price: '',
  image: '',
  description: '',
  location: ''
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
    const campground = await $trpc.campground.create.mutate({
      name: form.value.name,
      price: form.value.price,
      image: form.value.image,
      description: form.value.description,
      location: form.value.location || undefined
    })
    setFlash('success', 'Campground created successfully!')
    if (campground) {
      navigateTo(`/campgrounds/${campground.id}`)
    } else {
      navigateTo('/campgrounds')
    }
  } catch (error: any) {
    setFlash('error', error.message || 'Failed to create campground')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          Create a New Campground
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
          Create Campground
        </UButton>
      </form>
    </UCard>

    <div class="mt-4 text-center">
      <NuxtLink
        to="/campgrounds"
        class="text-sm text-gray-600 dark:text-gray-400 hover:underline"
      >
        Go Back
      </NuxtLink>
    </div>
  </div>
</template>
