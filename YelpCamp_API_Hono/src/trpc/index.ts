import { campgroundRouter } from './routers/campground'
import { commentRouter } from './routers/comment'
import { router } from './trpc'

export const appRouter = router({
  campground: campgroundRouter,
  comment: commentRouter
})

export type AppRouter = typeof appRouter
