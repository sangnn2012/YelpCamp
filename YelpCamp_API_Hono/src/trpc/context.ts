import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { auth } from '../lib/auth'

export interface AuthUser {
  id: string
  email: string
  username: string
  name: string | null
}

export interface Context {
  user: AuthUser | null
}

/**
 * Creates the tRPC context from the incoming request headers
 */
export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<Context> {
  const session = await auth.api.getSession({
    headers: opts.req.headers
  })

  if (!session?.user) {
    return { user: null }
  }

  // Extract user with username from Better Auth session
  const user: AuthUser = {
    id: session.user.id,
    email: session.user.email,
    username: (session.user as { username?: string }).username ?? '',
    name: session.user.name ?? null
  }

  return { user }
}
