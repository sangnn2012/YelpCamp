import type { Context } from 'hono'
import type { Campground, Comment, User } from '../db/schema'

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
  id: string
  email: string
  username: string
  name: string | null
}

// Extend Hono's context variable map
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser | null
  }
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  error: string
  message: string
}

export interface ApiSuccess {
  success: true
  message: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

// ============================================================================
// Campground Types
// ============================================================================

export interface CampgroundAuthor {
  id: string
  username: string
}

export interface CommentWithAuthor extends Comment {
  author: CampgroundAuthor | null
}

export interface CampgroundWithAuthor extends Campground {
  author: CampgroundAuthor | null
}

export interface CampgroundWithDetails extends CampgroundWithAuthor {
  comments: CommentWithAuthor[]
}

export interface CampgroundListResponse {
  campgrounds: CampgroundWithAuthor[]
  pagination: PaginationMeta
}

// ============================================================================
// Comment Types
// ============================================================================

export interface CommentResponse extends Comment {
  author: CampgroundAuthor | null
}

// ============================================================================
// Request Types
// ============================================================================

export interface ListQueryParams {
  search?: string
  page: number
  limit: number
}

// ============================================================================
// Type Guards
// ============================================================================

export function isValidId(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value > 0
}

export function parseId(value: string): number | null {
  const parsed = parseInt(value, 10)
  return isValidId(parsed) ? parsed : null
}
