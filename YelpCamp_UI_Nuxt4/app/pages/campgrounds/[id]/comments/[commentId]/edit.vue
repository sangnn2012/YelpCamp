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
const commentId = computed(() => Number(route.params.commentId))

const { data: comment, pending, error } = await useAsyncData(
  `comment-edit-${commentId.value}`,
  () => $trpc.comment.getById.query({ id: commentId.value })
)

// Check ownership
watchEffect(() => {
  if (comment.value && user.value) {
    if (comment.value.author?.id !== user.value.id) {
      setFlash('error', 'You do not have permission to do that')
      navigateTo(`/campgrounds/${campgroundId.value}`)
    }
  }
})

const loading = ref(false)
const form = ref({
  text: ''
})

// Initialize form with comment data
watchEffect(() => {
  if (comment.value) {
    form.value.text = comment.value.text
  }
})

const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}

  if (!form.value.text.trim()) {
    errors.value.text = 'Comment text is required'
  } else if (form.value.text.length > 500) {
    errors.value.text = 'Comment must be less than 500 characters'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    await $trpc.comment.update.mutate({
      id: commentId.value,
      data: {
        text: form.value.text
      }
    })
    setFlash('success', 'Comment updated successfully!')
    navigateTo(`/campgrounds/${campgroundId.value}`)
  } catch (error: any) {
    setFlash('error', error.message || 'Failed to update comment')
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
    <template v-else-if="comment">
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold text-center">
            Edit Comment
          </h1>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <UFormField
            label="Your Comment"
            name="text"
            :error="errors.text"
          >
            <UTextarea
              v-model="form.text"
              placeholder="Share your experience..."
              :rows="4"
              required
              :disabled="loading"
            />
            <template #hint>
              <span class="text-xs text-gray-500">
                {{ form.text.length }}/500 characters
              </span>
            </template>
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            block
            :loading="loading"
          >
            Update Comment
          </UButton>
        </form>
      </UCard>

      <div class="mt-4 text-center">
        <NuxtLink
          :to="`/campgrounds/${campgroundId}`"
          class="text-sm text-gray-600 dark:text-gray-400 hover:underline"
        >
          Go Back
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
