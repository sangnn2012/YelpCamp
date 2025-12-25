import { defineStore } from 'pinia'
import { ref } from 'vue'

interface FlashMessage {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

export const useFlashStore = defineStore('flash', () => {
  const messages = ref<FlashMessage[]>([])
  let nextId = 0

  function show(type: FlashMessage['type'], message: string, duration = 5000) {
    const id = nextId++
    messages.value.push({ id, type, message })

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  function success(message: string) {
    show('success', message)
  }

  function error(message: string) {
    show('error', message)
  }

  function info(message: string) {
    show('info', message)
  }

  function remove(id: number) {
    messages.value = messages.value.filter(m => m.id !== id)
  }

  return { messages, show, success, error, info, remove }
})
