import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { appRouter } from '../../trpc'
import { createContext } from '../../trpc/context'

const handler = createHTTPHandler({
  router: appRouter,
  createContext: ({ req }) => {
    // Create a minimal H3-like event for context
    return createContext({
      headers: req.headers as unknown as Headers
    } as any)
  }
})

export default defineEventHandler(async (event) => {
  const { req, res } = event.node

  // Handle the request through tRPC
  return new Promise((resolve) => {
    handler(req, res)
    res.on('finish', () => resolve(undefined))
  })
})
