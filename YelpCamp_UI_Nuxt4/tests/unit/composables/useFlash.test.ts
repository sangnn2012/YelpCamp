import { describe, it, expect, beforeEach } from 'vitest'
import { ref, computed } from 'vue'

// Mock the useFlash composable logic for testing
interface FlashMessage {
  type: 'success' | 'error'
  message: string
}

function createUseFlash() {
  const flashMessage = ref<FlashMessage | null>(null)

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

describe('useFlash', () => {
  let flashUtils: ReturnType<typeof createUseFlash>

  beforeEach(() => {
    flashUtils = createUseFlash()
  })

  it('should initially have no flash message', () => {
    expect(flashUtils.flash.value).toBeNull()
  })

  it('should set a success flash message', () => {
    flashUtils.setFlash('success', 'Operation successful!')

    expect(flashUtils.flash.value).toEqual({
      type: 'success',
      message: 'Operation successful!'
    })
  })

  it('should set an error flash message', () => {
    flashUtils.setFlash('error', 'Something went wrong!')

    expect(flashUtils.flash.value).toEqual({
      type: 'error',
      message: 'Something went wrong!'
    })
  })

  it('should clear the flash message', () => {
    flashUtils.setFlash('success', 'Test message')
    expect(flashUtils.flash.value).not.toBeNull()

    flashUtils.clearFlash()
    expect(flashUtils.flash.value).toBeNull()
  })

  it('should overwrite previous flash message when setting a new one', () => {
    flashUtils.setFlash('success', 'First message')
    flashUtils.setFlash('error', 'Second message')

    expect(flashUtils.flash.value).toEqual({
      type: 'error',
      message: 'Second message'
    })
  })

  it('should handle empty message strings', () => {
    flashUtils.setFlash('success', '')

    expect(flashUtils.flash.value).toEqual({
      type: 'success',
      message: ''
    })
  })
})
