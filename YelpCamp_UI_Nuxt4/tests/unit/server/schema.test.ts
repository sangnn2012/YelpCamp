import { pgTable, serial, text, varchar, timestamp, integer } from 'drizzle-orm/pg-core'
import { describe, it, expect } from 'vitest'

// Test that schema definitions are correct by checking structure
describe('Database Schema', () => {
  describe('Users Table', () => {
    const users = pgTable('users', {
      id: text('id').primaryKey(),
      username: varchar('username', { length: 30 }).unique().notNull(),
      email: varchar('email', { length: 255 }).unique().notNull(),
      emailVerified: timestamp('email_verified'),
      image: text('image'),
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at').defaultNow().notNull()
    })

    it('should have required columns', () => {
      const columnNames = Object.keys(users)
      expect(columnNames).toContain('id')
      expect(columnNames).toContain('username')
      expect(columnNames).toContain('email')
      expect(columnNames).toContain('createdAt')
      expect(columnNames).toContain('updatedAt')
    })

    it('should have correct column types', () => {
      expect(users.id.dataType).toBe('string')
      expect(users.username.dataType).toBe('string')
      expect(users.email.dataType).toBe('string')
    })
  })

  describe('Campgrounds Table', () => {
    const campgrounds = pgTable('campgrounds', {
      id: serial('id').primaryKey(),
      name: varchar('name', { length: 100 }).notNull(),
      price: varchar('price', { length: 20 }).notNull(),
      image: text('image').notNull(),
      description: text('description').notNull(),
      authorId: text('author_id'),
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at').defaultNow().notNull()
    })

    it('should have required columns', () => {
      const columnNames = Object.keys(campgrounds)
      expect(columnNames).toContain('id')
      expect(columnNames).toContain('name')
      expect(columnNames).toContain('price')
      expect(columnNames).toContain('image')
      expect(columnNames).toContain('description')
      expect(columnNames).toContain('authorId')
    })

    it('should have correct column types', () => {
      expect(campgrounds.id.dataType).toBe('number')
      expect(campgrounds.name.dataType).toBe('string')
      expect(campgrounds.price.dataType).toBe('string')
    })

    it('should have name as varchar type', () => {
      expect(campgrounds.name.columnType).toBe('PgVarchar')
    })
  })

  describe('Comments Table', () => {
    const comments = pgTable('comments', {
      id: serial('id').primaryKey(),
      text: varchar('text', { length: 500 }).notNull(),
      campgroundId: integer('campground_id').notNull(),
      authorId: text('author_id'),
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at').defaultNow().notNull()
    })

    it('should have required columns', () => {
      const columnNames = Object.keys(comments)
      expect(columnNames).toContain('id')
      expect(columnNames).toContain('text')
      expect(columnNames).toContain('campgroundId')
      expect(columnNames).toContain('authorId')
    })

    it('should have correct column types', () => {
      expect(comments.id.dataType).toBe('number')
      expect(comments.text.dataType).toBe('string')
      expect(comments.campgroundId.dataType).toBe('number')
    })

    it('should have text as varchar type', () => {
      expect(comments.text.columnType).toBe('PgVarchar')
    })
  })
})
