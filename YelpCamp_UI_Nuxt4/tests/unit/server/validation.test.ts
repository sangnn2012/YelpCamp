import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Validation schemas (matching those in routers)
const createCampgroundSchema = z.object({
  name: z.string().min(1, 'Campground name is required').max(100, 'Name must be less than 100 characters'),
  price: z.string().min(1, 'Price is required'),
  image: z.string().url('Must be a valid URL'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters')
})

const createCommentSchema = z.object({
  campgroundId: z.number(),
  text: z.string().min(1, 'Comment text is required').max(500, 'Comment must be less than 500 characters')
})

const userValidation = {
  username: z.string()
    .min(3, 'Username must be 3-30 characters')
    .max(30, 'Username must be 3-30 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username must contain only letters and numbers'),
  password: z.string().min(6, 'Password must be at least 6 characters')
}

describe('Campground Validation', () => {
  describe('createCampgroundSchema', () => {
    it('should validate a valid campground', () => {
      const validCampground = {
        name: 'Mountain View Camp',
        price: '25.00',
        image: 'https://example.com/image.jpg',
        description: 'A beautiful campground with mountain views.'
      }

      const result = createCampgroundSchema.safeParse(validCampground)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidCampground = {
        name: '',
        price: '25.00',
        image: 'https://example.com/image.jpg',
        description: 'A description'
      }

      const result = createCampgroundSchema.safeParse(invalidCampground)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Campground name is required')
      }
    })

    it('should reject name over 100 characters', () => {
      const invalidCampground = {
        name: 'a'.repeat(101),
        price: '25.00',
        image: 'https://example.com/image.jpg',
        description: 'A description'
      }

      const result = createCampgroundSchema.safeParse(invalidCampground)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Name must be less than 100 characters')
      }
    })

    it('should reject empty price', () => {
      const invalidCampground = {
        name: 'Valid Name',
        price: '',
        image: 'https://example.com/image.jpg',
        description: 'A description'
      }

      const result = createCampgroundSchema.safeParse(invalidCampground)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Price is required')
      }
    })

    it('should reject invalid URL', () => {
      const invalidCampground = {
        name: 'Valid Name',
        price: '25.00',
        image: 'not-a-url',
        description: 'A description'
      }

      const result = createCampgroundSchema.safeParse(invalidCampground)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Must be a valid URL')
      }
    })

    it('should reject description over 5000 characters', () => {
      const invalidCampground = {
        name: 'Valid Name',
        price: '25.00',
        image: 'https://example.com/image.jpg',
        description: 'a'.repeat(5001)
      }

      const result = createCampgroundSchema.safeParse(invalidCampground)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Description must be less than 5000 characters')
      }
    })
  })
})

describe('Comment Validation', () => {
  describe('createCommentSchema', () => {
    it('should validate a valid comment', () => {
      const validComment = {
        campgroundId: 1,
        text: 'Great campground!'
      }

      const result = createCommentSchema.safeParse(validComment)
      expect(result.success).toBe(true)
    })

    it('should reject empty text', () => {
      const invalidComment = {
        campgroundId: 1,
        text: ''
      }

      const result = createCommentSchema.safeParse(invalidComment)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Comment text is required')
      }
    })

    it('should reject text over 500 characters', () => {
      const invalidComment = {
        campgroundId: 1,
        text: 'a'.repeat(501)
      }

      const result = createCommentSchema.safeParse(invalidComment)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Comment must be less than 500 characters')
      }
    })

    it('should reject non-numeric campgroundId', () => {
      const invalidComment = {
        campgroundId: 'not-a-number',
        text: 'Valid text'
      }

      const result = createCommentSchema.safeParse(invalidComment)
      expect(result.success).toBe(false)
    })
  })
})

describe('User Validation', () => {
  describe('username', () => {
    it('should validate a valid username', () => {
      const result = userValidation.username.safeParse('validUser123')
      expect(result.success).toBe(true)
    })

    it('should reject username less than 3 characters', () => {
      const result = userValidation.username.safeParse('ab')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Username must be 3-30 characters')
      }
    })

    it('should reject username more than 30 characters', () => {
      const result = userValidation.username.safeParse('a'.repeat(31))
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Username must be 3-30 characters')
      }
    })

    it('should reject username with special characters', () => {
      const result = userValidation.username.safeParse('user@name')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Username must contain only letters and numbers')
      }
    })

    it('should reject username with spaces', () => {
      const result = userValidation.username.safeParse('user name')
      expect(result.success).toBe(false)
    })
  })

  describe('password', () => {
    it('should validate a valid password', () => {
      const result = userValidation.password.safeParse('validPassword123')
      expect(result.success).toBe(true)
    })

    it('should reject password less than 6 characters', () => {
      const result = userValidation.password.safeParse('12345')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Password must be at least 6 characters')
      }
    })

    it('should accept password exactly 6 characters', () => {
      const result = userValidation.password.safeParse('123456')
      expect(result.success).toBe(true)
    })
  })
})
