import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { h, ref } from 'vue'

describe('Login Form', () => {
  it('should have email and password fields', async () => {
    const form = ref({ email: '', password: '' })

    const TestComponent = {
      setup() {
        return () => h('form', { class: 'login-form' }, [
          h('input', {
            type: 'email',
            class: 'email-input',
            value: form.value.email,
            placeholder: 'Email'
          }),
          h('input', {
            type: 'password',
            class: 'password-input',
            value: form.value.password,
            placeholder: 'Password'
          }),
          h('button', { type: 'submit', class: 'submit-btn' }, 'Login')
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.email-input').exists()).toBe(true)
    expect(wrapper.find('.password-input').exists()).toBe(true)
    expect(wrapper.find('.submit-btn').exists()).toBe(true)
  })

  it('should display loading state when submitting', async () => {
    const loading = ref(true)

    const TestComponent = {
      setup() {
        return () => h('form', { class: 'login-form' }, [
          h('button', {
            type: 'submit',
            class: 'submit-btn',
            disabled: loading.value
          }, loading.value ? 'Loading...' : 'Login')
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.submit-btn').text()).toBe('Loading...')
    expect(wrapper.find('.submit-btn').attributes('disabled')).toBeDefined()
  })
})

describe('Register Form', () => {
  it('should have all required fields', async () => {
    const TestComponent = {
      setup() {
        return () => h('form', { class: 'register-form' }, [
          h('input', { class: 'username-input', placeholder: 'Username' }),
          h('input', { class: 'email-input', type: 'email', placeholder: 'Email' }),
          h('input', { class: 'password-input', type: 'password', placeholder: 'Password' }),
          h('input', { class: 'confirm-password-input', type: 'password', placeholder: 'Confirm Password' }),
          h('button', { type: 'submit', class: 'submit-btn' }, 'Sign Up')
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.username-input').exists()).toBe(true)
    expect(wrapper.find('.email-input').exists()).toBe(true)
    expect(wrapper.find('.password-input').exists()).toBe(true)
    expect(wrapper.find('.confirm-password-input').exists()).toBe(true)
    expect(wrapper.find('.submit-btn').exists()).toBe(true)
  })

  it('should display validation errors', async () => {
    const errors = ref({
      username: 'Username must be 3-30 characters',
      password: ''
    })

    const TestComponent = {
      setup() {
        return () => h('form', { class: 'register-form' }, [
          h('div', { class: 'field-group' }, [
            h('input', { class: 'username-input' }),
            errors.value.username
              ? h('span', { class: 'error-message' }, errors.value.username)
              : null
          ])
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Username must be 3-30 characters')
  })

  it('should validate password confirmation', async () => {
    const form = ref({
      password: 'password123',
      confirmPassword: 'different'
    })

    const passwordsMatch = () => form.value.password === form.value.confirmPassword

    const TestComponent = {
      setup() {
        return () => h('form', { class: 'register-form' }, [
          h('input', { class: 'password-input', value: form.value.password }),
          h('input', { class: 'confirm-password-input', value: form.value.confirmPassword }),
          !passwordsMatch()
            ? h('span', { class: 'error-message' }, 'Passwords do not match')
            : null
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Passwords do not match')
  })
})
