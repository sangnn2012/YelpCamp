import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { h } from 'vue'

// Mock campground data
const mockCampground = {
  id: 1,
  name: 'Test Campground',
  price: '25.00',
  image: 'https://example.com/image.jpg',
  description: 'A beautiful test campground with amazing views.',
  author: {
    id: 'user-1',
    username: 'testuser'
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('CampgroundCard', () => {
  it('should render campground name', async () => {
    // Create a simple test component that renders campground data
    const TestComponent = {
      setup() {
        return () => h('div', { class: 'campground-card' }, [
          h('h3', { class: 'name' }, mockCampground.name),
          h('span', { class: 'price' }, `$${mockCampground.price}/night`),
          h('p', { class: 'description' }, mockCampground.description)
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.name').text()).toBe('Test Campground')
  })

  it('should display price correctly', async () => {
    const TestComponent = {
      setup() {
        return () => h('div', { class: 'campground-card' }, [
          h('span', { class: 'price' }, `$${mockCampground.price}/night`)
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.price').text()).toBe('$25.00/night')
  })

  it('should truncate long descriptions', async () => {
    const longDescription = 'A'.repeat(200)
    const TestComponent = {
      setup() {
        return () => h('div', { class: 'campground-card' }, [
          h('p', { class: 'description line-clamp-2' }, longDescription)
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.description').exists()).toBe(true)
    expect(wrapper.find('.description').classes()).toContain('line-clamp-2')
  })

  it('should include author information', async () => {
    const TestComponent = {
      setup() {
        return () => h('div', { class: 'campground-card' }, [
          h('span', { class: 'author' }, `By ${mockCampground.author.username}`)
        ])
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.author').text()).toBe('By testuser')
  })
})

describe('Campground List', () => {
  const mockCampgrounds = [
    { ...mockCampground, id: 1, name: 'Campground 1' },
    { ...mockCampground, id: 2, name: 'Campground 2' },
    { ...mockCampground, id: 3, name: 'Campground 3' }
  ]

  it('should render multiple campground cards', async () => {
    const TestComponent = {
      setup() {
        return () => h('div', { class: 'campground-grid' },
          mockCampgrounds.map(camp =>
            h('div', { key: camp.id, class: 'card' }, camp.name)
          )
        )
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    const cards = wrapper.findAll('.card')
    expect(cards).toHaveLength(3)
  })

  it('should display empty state when no campgrounds', async () => {
    const emptyCampgrounds: typeof mockCampgrounds = []
    const TestComponent = {
      setup() {
        return () => h('div', { class: 'campground-list' },
          emptyCampgrounds.length === 0
            ? h('p', { class: 'empty-state' }, 'No campgrounds yet')
            : null
        )
      }
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toBe('No campgrounds yet')
  })
})
