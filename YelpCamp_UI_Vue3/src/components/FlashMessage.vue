<script setup lang="ts">
import { useFlashStore } from '@/stores/flash'

const flashStore = useFlashStore()

const bgColors = {
  success: 'bg-green-100 border-green-500 text-green-700',
  error: 'bg-red-100 border-red-500 text-red-700',
  info: 'bg-blue-100 border-blue-500 text-blue-700'
}
</script>

<template>
  <div class="fixed top-20 right-4 z-50 space-y-2">
    <TransitionGroup name="flash">
      <div
        v-for="msg in flashStore.messages"
        :key="msg.id"
        :class="['border-l-4 p-4 rounded shadow-lg max-w-sm', bgColors[msg.type]]"
      >
        <div class="flex justify-between items-start">
          <p>{{ msg.message }}</p>
          <button
            @click="flashStore.remove(msg.id)"
            class="ml-4 text-lg leading-none"
          >
            &times;
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.flash-enter-active,
.flash-leave-active {
  transition: all 0.3s ease;
}
.flash-enter-from,
.flash-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
