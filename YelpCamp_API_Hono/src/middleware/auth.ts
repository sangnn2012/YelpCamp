import type { Context, Next } from 'hono'
import { auth } from '../lib/auth'
import { unauthorized } from '../lib/errors'
import type { AuthUser } from '../types'

// Re-export AuthUser type for convenience
export type { AuthUser }

/**
 * Extracts user data from Better Auth session
 */
function extractUserFromSession(session: Awaited<ReturnType<typeof auth.api.getSession>>): AuthUser | null {
  if (!session?.user) {
    return null
  }

  const { user } = session

  return {
    id: user.id,
    email: user.email,
    username: (user as { username?: string }).username ?? '',
    name: user.name ?? null
  }
}

/**
 * Middleware to get current user (optional - doesn't block requests)
 * Sets `user` in context to AuthUser or null
 */
export async function getCurrentUser(c: Context, next: Next): Promise<void | Response> {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    })

    c.set('user', extractUserFromSession(session))
  } catch {
    c.set('user', null)
  }

  await next()
}

/**
 * Middleware to require authentication (blocks if not authenticated)
 * Returns 401 if user is not logged in
 */
export async function requireAuth(c: Context, next: Next): Promise<void | Response> {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    })

    const user = extractUserFromSession(session)

    if (!user) {
      return unauthorized(c)
    }

    c.set('user', user)
    await next()
  } catch {
    return unauthorized(c, 'Invalid session')
  }
}

/**
 * Helper to get the authenticated user from context
 * Only use after requireAuth middleware
 */
export function getAuthUser(c: Context): AuthUser {
  const user = c.get('user')
  if (!user) {
    throw new Error('User not found in context. Did you forget to use requireAuth middleware?')
  }
  return user
}
