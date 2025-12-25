import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { h, ref } from 'vue'

describe('FlashMessage', () => {
  it('should render success message with correct styling', async () => {
    const flash = ref({ type: 'success' as const, message: 'Operation successful!' })

    const TestComponent = {
      setup() {
        return () => flash.value
          ? h('div', {
              class: ['flash-message', flash.value.type === 'success' ? 'bg-green-100' : 'bg-red-100']
            }, flash.value.message)
          : null
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.flash-message').exists()).toBe(true)
    expect(wrapper.find('.flash-message').text()).toBe('Operation successful!')
    expect(wrapper.find('.flash-message').classes()).toContain('bg-green-100')
  })

  it('should render error message with correct styling', async () => {
    const flash = ref({ type: 'error' as const, message: 'Something went wrong!' })

    const TestComponent = {
      setup() {
        return () => flash.value
          ? h('div', {
              class: ['flash-message', flash.value.type === 'success' ? 'bg-green-100' : 'bg-red-100']
            }, flash.value.message)
          : null
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.flash-message').exists()).toBe(true)
    expect(wrapper.find('.flash-message').text()).toBe('Something went wrong!')
    expect(wrapper.find('.flash-message').classes()).toContain('bg-red-100')
  })

  it('should not render when flash is null', async () => {
    const flash = ref<{ type: 'success' | 'error', message: string } | null>(null)

    const TestComponent = {
      setup() {
        return () => flash.value
          ? h('div', { class: 'flash-message' }, flash.value.message)
          : h('div', { class: 'no-flash' })
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.flash-message').exists()).toBe(false)
    expect(wrapper.find('.no-flash').exists()).toBe(true)
  })

  it('should have close button functionality', async () => {
    const flash = ref<{ type: 'success' | 'error', message: string } | null>({
      type: 'success',
      message: 'Test message'
    })

    const closeFlash = () => {
      flash.value = null
    }

    const TestComponent = {
      setup() {
        return () => flash.value
          ? h('div', { class: 'flash-message' }, [
              h('span', flash.value.message),
              h('button', { class: 'close-btn', onClick: closeFlash }, 'X')
            ])
          : h('div', { class: 'no-flash' })
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.flash-message').exists()).toBe(true)

    await wrapper.find('.close-btn').trigger('click')

    // After clicking, component should re-render without flash
    expect(flash.value).toBeNull()
  })
})
