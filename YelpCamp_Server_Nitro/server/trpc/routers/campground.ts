import { TRPCError } from '@trpc/server'
import { eq, ilike, or, count } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../../db'
import { campgrounds } from '../../../db/schema'
import { router, publicProcedure, protectedProcedure } from '../trpc'

// Validation schemas
const createCampgroundSchema = z.object({
  name: z.string().min(1, 'Campground name is required').max(100, 'Name must be less than 100 characters'),
  price: z.string().min(1, 'Price is required'),
  image: z.string().url('Must be a valid URL'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  location: z.string().max(200, 'Location must be less than 200 characters').optional()
})

const updateCampgroundSchema = createCampgroundSchema.partial()

const listQuerySchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12)
})

export const campgroundRouter = router({
  // Get all campgrounds with search and pagination
  list: publicProcedure
    .input(listQuerySchema.optional())
    .query(async ({ input }) => {
      const { search, page, limit } = input ?? { page: 1, limit: 12 }
      const offset = (page - 1) * limit

      const whereClause = search
        ? or(
            ilike(campgrounds.name, `%${search}%`),
            ilike(campgrounds.description, `%${search}%`),
            ilike(campgrounds.location, `%${search}%`)
          )
        : undefined

      const countResult = await db
        .select({ total: count() })
        .from(campgrounds)
        .where(whereClause)
      const total = countResult[0]?.total ?? 0

      const results = await db.query.campgrounds.findMany({
        where: whereClause,
        with: {
          author: {
            columns: {
              id: true,
              username: true
            }
          }
        },
        orderBy: (campgrounds, { desc }) => [desc(campgrounds.createdAt)],
        limit,
        offset
      })

      return {
        campgrounds: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + results.length < total
        }
      }
    }),

  // Get single campground by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const campground = await db.query.campgrounds.findFirst({
        where: eq(campgrounds.id, input.id),
        with: {
          author: {
            columns: {
              id: true,
              username: true
            }
          },
          comments: {
            with: {
              author: {
                columns: {
                  id: true,
                  username: true
                }
              }
            },
            orderBy: (comments, { desc }) => [desc(comments.createdAt)]
          }
        }
      })

      if (!campground) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campground not found'
        })
      }

      return campground
    }),

  // Create campground
  create: protectedProcedure
    .input(createCampgroundSchema)
    .mutation(async ({ ctx, input }) => {
      const [newCampground] = await db.insert(campgrounds).values({
        name: input.name.trim(),
        price: input.price.trim(),
        image: input.image.trim(),
        description: input.description.trim(),
        location: input.location?.trim() || null,
        authorId: ctx.user.id
      }).returning()

      return newCampground
    }),

  // Update campground
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: updateCampgroundSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.campgrounds.findFirst({
        where: eq(campgrounds.id, input.id)
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campground not found'
        })
      }

      if (existing.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You don\'t have permission to do that'
        })
      }

      const updateData: Record<string, string | Date | null> = {
        updatedAt: new Date()
      }

      if (input.data.name) updateData.name = input.data.name.trim()
      if (input.data.price) updateData.price = input.data.price.trim()
      if (input.data.image) updateData.image = input.data.image.trim()
      if (input.data.description) updateData.description = input.data.description.trim()
      if (input.data.location !== undefined) updateData.location = input.data.location?.trim() || null

      const [updated] = await db.update(campgrounds)
        .set(updateData)
        .where(eq(campgrounds.id, input.id))
        .returning()

      return updated
    }),

  // Delete campground
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.campgrounds.findFirst({
        where: eq(campgrounds.id, input.id)
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campground not found'
        })
      }

      if (existing.authorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You don\'t have permission to do that'
        })
      }

      await db.delete(campgrounds).where(eq(campgrounds.id, input.id))

      return { success: true, message: 'Campground deleted' }
    })
})
