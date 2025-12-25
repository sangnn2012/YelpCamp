<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const { $trpc } = useNuxtApp()
const { user, isAuthenticated } = useAuth()
const { setFlash } = useFlash()

const campgroundId = computed(() => Number(route.params.id))

const { data: campground, pending, error, refresh } = await useAsyncData(
  `campground-${campgroundId.value}`,
  () => $trpc.campground.getById.query({ id: campgroundId.value })
)

const isOwner = computed(() => {
  return isAuthenticated.value && user.value && campground.value?.author?.id === user.value.id
})

const isCommentOwner = (comment: any) => {
  return isAuthenticated.value && user.value && comment.author?.id === user.value.id
}

const deleting = ref(false)
const deletingCommentId = ref<number | null>(null)

const handleDeleteCampground = async () => {
  if (!confirm('Are you sure you want to delete this campground?')) {
    return
  }

  deleting.value = true
  try {
    await $trpc.campground.delete.mutate({ id: campgroundId.value })
    setFlash('success', 'Campground deleted')
    navigateTo('/campgrounds')
  } catch (error: any) {
    setFlash('error', error.message || 'Failed to delete campground')
  } finally {
    deleting.value = false
  }
}

const handleDeleteComment = async (commentId: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }

  deletingCommentId.value = commentId
  try {
    await $trpc.comment.delete.mutate({ id: commentId })
    setFlash('success', 'Comment deleted')
    await refresh()
  } catch (error: any) {
    setFlash('error', error.message || 'Failed to delete comment')
  } finally {
    deletingCommentId.value = null
  }
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
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

    <!-- Campground Detail -->
    <div
      v-else-if="campground"
      class="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Image -->
        <UCard class="overflow-hidden">
          <template #header>
            <div class="aspect-video overflow-hidden -mx-4 -mt-4">
              <img
                :src="campground.image"
                :alt="campground.name"
                class="w-full h-full object-cover"
              >
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ campground.name }}
              </h1>
              <span class="text-2xl font-semibold text-primary-600">
                ${{ campground.price }}/night
              </span>
            </div>

            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ campground.description }}
            </p>

            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Submitted by: </span>
              <strong class="ml-1">{{ campground.author?.username || 'Unknown' }}</strong>
            </div>

            <!-- Owner Actions -->
            <div
              v-if="isOwner"
              class="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <UButton
                :to="`/campgrounds/${campground.id}/edit`"
                color="warning"
              >
                Edit
              </UButton>
              <UButton
                color="error"
                :loading="deleting"
                @click="handleDeleteCampground"
              >
                Delete
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Comments Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">
                Comments ({{ campground.comments?.length || 0 }})
              </h2>
              <UButton
                v-if="isAuthenticated"
                :to="`/campgrounds/${campground.id}/comments/new`"
                color="primary"
                size="sm"
              >
                Add Comment
              </UButton>
            </div>
          </template>

          <div
            v-if="!campground.comments?.length"
            class="text-center py-6 text-gray-500 dark:text-gray-400"
          >
            No comments yet. Be the first to share your experience!
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="comment in campground.comments"
              :key="comment.id"
              class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
            >
              <div class="flex items-start justify-between">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <strong class="text-gray-900 dark:text-white">
                      {{ comment.author?.username || 'Anonymous' }}
                    </strong>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(comment.createdAt) }}
                    </span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ comment.text }}
                  </p>
                </div>

                <!-- Comment Owner Actions -->
                <div
                  v-if="isCommentOwner(comment)"
                  class="flex gap-1"
                >
                  <UButton
                    :to="`/campgrounds/${campground.id}/comments/${comment.id}/edit`"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-pencil"
                  />
                  <UButton
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-trash-2"
                    color="error"
                    :loading="deletingCommentId === comment.id"
                    @click="handleDeleteComment(comment.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              Campground Info
            </h3>
          </template>

          <ul class="space-y-2 text-sm">
            <li
              v-if="campground.location"
              class="flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="text-gray-400"
              />
              <span>{{ campground.location }}</span>
            </li>
            <li class="flex items-center gap-2">
              <UIcon
                name="i-lucide-dollar-sign"
                class="text-gray-400"
              />
              <span>${{ campground.price }} per night</span>
            </li>
            <li class="flex items-center gap-2">
              <UIcon
                name="i-lucide-message-square"
                class="text-gray-400"
              />
              <span>{{ campground.comments?.length || 0 }} comments</span>
            </li>
            <li class="flex items-center gap-2">
              <UIcon
                name="i-lucide-calendar"
                class="text-gray-400"
              />
              <span>Added {{ formatDate(campground.createdAt) }}</span>
            </li>
          </ul>
        </UCard>

        <UButton
          to="/campgrounds"
          variant="ghost"
          block
          icon="i-lucide-arrow-left"
        >
          Back to Campgrounds
        </UButton>
      </div>
    </div>
  </div>
</template>
