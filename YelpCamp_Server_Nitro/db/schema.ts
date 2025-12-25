import { relations } from 'drizzle-orm'
import { pgTable, serial, text, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

// Users table - for Better Auth compatibility
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: varchar('username', { length: 30 }).unique().notNull(),
  displayUsername: varchar('display_username', { length: 30 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 100 }),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Sessions table - for Better Auth
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Accounts table - for Better Auth credentials
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Verifications table - for Better Auth email verification
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Campgrounds table
export const campgrounds = pgTable('campgrounds', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  price: varchar('price', { length: 20 }).notNull(),
  image: text('image').notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 200 }),
  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  text: varchar('text', { length: 500 }).notNull(),
  campgroundId: integer('campground_id').notNull().references(() => campgrounds.id, { onDelete: 'cascade' }),
  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  campgrounds: many(campgrounds),
  comments: many(comments),
  sessions: many(sessions),
  accounts: many(accounts)
}))

export const campgroundsRelations = relations(campgrounds, ({ one, many }) => ({
  author: one(users, {
    fields: [campgrounds.authorId],
    references: [users.id]
  }),
  comments: many(comments)
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  campground: one(campgrounds, {
    fields: [comments.campgroundId],
    references: [campgrounds.id]
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id]
  })
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}))

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Campground = typeof campgrounds.$inferSelect
export type NewCampground = typeof campgrounds.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
