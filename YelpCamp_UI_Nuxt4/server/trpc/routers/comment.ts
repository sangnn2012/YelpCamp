import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db'
import { comments, campgrounds } from '../../db/schema'
import { router, protectedProcedure } from '../trpc'

// Validation schemas
const createCommentSchema = z.object({
  campgroundId: z.number(),
  text: z.string().min(1, 'Comment text is required').max(500, 'Comment must be less than 500 characters')
})

const updateCommentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(500, 'Comment must be less than 500 characters')
})

export const commentRouter = router({
  // Create comment
  create: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if campground exists
      const campground = await db.query.campgrounds.findFirst({
        where: eq(campgrounds.id, input.campgroundId)
      })

      if (!campground) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campground not found'
        })
      }

      const [newComment] = await db.insert(comments).values({
        text: input.text.trim(),
        campgroundId: input.campgroundId,
        authorId: ctx.user.id
      }).returning()

      return newComment
    }),

  // Get comment by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const comment = await db.query.comments.findFirst({
        where: eq(comments.id, input.id),
        with: {
          author: {
            columns: {
              id: true,
              username: true
            }
          }
        }
      })

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found'
        })
      }

      return comment
    }),

  // Update comment
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: updateCommentSchema
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if comment exists
      const existing = await db.query.comments.findFirst({
        where: eq(comments.id, input.id)
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found'
        })
      }

      // Check ownership
      if (existing.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to do that'
        })
      }

      const [updated] = await db.update(comments)
        .set({
          text: input.data.text.trim(),
          updatedAt: new Date()
        })
        .where(eq(comments.id, input.id))
        .returning()

      return updated
    }),

  // Delete comment
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if comment exists
      const existing = await db.query.comments.findFirst({
        where: eq(comments.id, input.id)
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found'
        })
      }

      // Check ownership
      if (existing.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to do that'
        })
      }

      await db.delete(comments).where(eq(comments.id, input.id))

      return { success: true, message: 'Comment deleted' }
    })
})
