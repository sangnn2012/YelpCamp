interface FlashMessage {
  type: 'success' | 'error'
  message: string
}

const flashMessage = ref<FlashMessage | null>(null)

export const useFlash = () => {
  const setFlash = (type: 'success' | 'error', message: string) => {
    flashMessage.value = { type, message }
  }

  const clearFlash = () => {
    flashMessage.value = null
  }

  const flash = computed(() => flashMessage.value)

  return {
    flash,
    setFlash,
    clearFlash
  }
}
