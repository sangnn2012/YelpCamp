import { auth } from '../utils/auth'
import type { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'

export async function createContext(event: H3Event) {
  const session = await auth.api.getSession({
    headers: event.headers
  })

  return {
    session,
    user: session?.user || null
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
