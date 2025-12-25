import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import type { ApiError } from '../types'

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// ============================================================================
// Error Response Helpers
// ============================================================================

export function badRequest(c: Context, message: string) {
  return c.json<ApiError>(
    { error: 'Bad Request', message },
    HttpStatus.BAD_REQUEST
  )
}

export function unauthorized(c: Context, message = 'You must be logged in') {
  return c.json<ApiError>(
    { error: 'Unauthorized', message },
    HttpStatus.UNAUTHORIZED
  )
}

export function forbidden(c: Context, message = "You don't have permission to do that") {
  return c.json<ApiError>(
    { error: 'Forbidden', message },
    HttpStatus.FORBIDDEN
  )
}

export function notFound(c: Context, resource: string) {
  return c.json<ApiError>(
    { error: 'Not Found', message: `${resource} not found` },
    HttpStatus.NOT_FOUND
  )
}

export function validationError(c: Context, message: string) {
  return c.json<ApiError>(
    { error: 'Validation Error', message },
    HttpStatus.BAD_REQUEST
  )
}

export function serverError(c: Context, message = 'An unexpected error occurred') {
  return c.json<ApiError>(
    { error: 'Internal Server Error', message },
    HttpStatus.INTERNAL_SERVER_ERROR
  )
}
