import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson
})

export const router = t.router
export const publicProcedure = t.procedure

// Middleware to check if user is authenticated
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You need to be logged in to do that'
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  })
})

export const protectedProcedure = t.procedure.use(isAuthenticated)
