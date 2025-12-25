import { Hono } from 'hono'
import { eq, ilike, or, count, desc } from 'drizzle-orm'
import { db } from '../db'
import { campgrounds } from '../db/schema'
import { requireAuth, getCurrentUser, getAuthUser } from '../middleware/auth'
import {
  createCampgroundSchema,
  updateCampgroundSchema,
  listQuerySchema,
  validate
} from '../lib/validation'
import {
  badRequest,
  notFound,
  forbidden,
  validationError,
  HttpStatus
} from '../lib/errors'
import { parseId } from '../types'
import type {
  CampgroundListResponse,
  CampgroundWithDetails,
  ApiSuccess
} from '../types'

const campgroundsRouter = new Hono()

// ============================================================================
// GET /campgrounds - List all campgrounds with search and pagination
// ============================================================================
campgroundsRouter.get('/', getCurrentUser, async (c) => {
  const queryResult = validate(listQuerySchema, {
    search: c.req.query('search'),
    page: c.req.query('page'),
    limit: c.req.query('limit')
  })

  if (!queryResult.success) {
    return validationError(c, queryResult.error)
  }

  const { search, page, limit } = queryResult.data
  const offset = (page - 1) * limit

  // Build where clause for search
  const whereClause = search
    ? or(
        ilike(campgrounds.name, `%${search}%`),
        ilike(campgrounds.description, `%${search}%`),
        ilike(campgrounds.location, `%${search}%`)
      )
    : undefined

  // Get total count for pagination
  const [countResult] = await db
    .select({ total: count() })
    .from(campgrounds)
    .where(whereClause)

  const total = countResult?.total ?? 0

  // Get paginated results
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
    orderBy: [desc(campgrounds.createdAt)],
    limit,
    offset
  })

  const response: CampgroundListResponse = {
    campgrounds: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + results.length < total
    }
  }

  return c.json(response)
})

// ============================================================================
// GET /campgrounds/:id - Get single campground by ID
// ============================================================================
campgroundsRouter.get('/:id', getCurrentUser, async (c) => {
  const id = parseId(c.req.param('id'))

  if (id === null) {
    return badRequest(c, 'Campground ID must be a valid number')
  }

  const campground = await db.query.campgrounds.findFirst({
    where: eq(campgrounds.id, id),
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
    return notFound(c, 'Campground')
  }

  return c.json<CampgroundWithDetails>(campground)
})

// ============================================================================
// POST /campgrounds - Create new campground (protected)
// ============================================================================
campgroundsRouter.post('/', requireAuth, async (c) => {
  const user = getAuthUser(c)

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return badRequest(c, 'Invalid JSON body')
  }

  const result = validate(createCampgroundSchema, body)
  if (!result.success) {
    return validationError(c, result.error)
  }

  const input = result.data

  const [newCampground] = await db
    .insert(campgrounds)
    .values({
      name: input.name,
      price: input.price,
      image: input.image,
      description: input.description,
      location: input.location ?? null,
      authorId: user.id
    })
    .returning()

  return c.json(newCampground, HttpStatus.CREATED)
})

// ============================================================================
// PUT /campgrounds/:id - Update campground (protected, owner only)
// ============================================================================
campgroundsRouter.put('/:id', requireAuth, async (c) => {
  const user = getAuthUser(c)
  const id = parseId(c.req.param('id'))

  if (id === null) {
    return badRequest(c, 'Campground ID must be a valid number')
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return badRequest(c, 'Invalid JSON body')
  }

  const result = validate(updateCampgroundSchema, body)
  if (!result.success) {
    return validationError(c, result.error)
  }

  // Check if campground exists
  const existing = await db.query.campgrounds.findFirst({
    where: eq(campgrounds.id, id)
  })

  if (!existing) {
    return notFound(c, 'Campground')
  }

  // Check ownership
  if (existing.authorId !== user.id) {
    return forbidden(c)
  }

  const input = result.data

  const [updated] = await db
    .update(campgrounds)
    .set({
      ...(input.name && { name: input.name }),
      ...(input.price && { price: input.price }),
      ...(input.image && { image: input.image }),
      ...(input.description && { description: input.description }),
      ...(input.location !== undefined && { location: input.location ?? null }),
      updatedAt: new Date()
    })
    .where(eq(campgrounds.id, id))
    .returning()

  return c.json(updated)
})

// ============================================================================
// DELETE /campgrounds/:id - Delete campground (protected, owner only)
// ============================================================================
campgroundsRouter.delete('/:id', requireAuth, async (c) => {
  const user = getAuthUser(c)
  const id = parseId(c.req.param('id'))

  if (id === null) {
    return badRequest(c, 'Campground ID must be a valid number')
  }

  // Check if campground exists
  const existing = await db.query.campgrounds.findFirst({
    where: eq(campgrounds.id, id)
  })

  if (!existing) {
    return notFound(c, 'Campground')
  }

  // Check ownership
  if (existing.authorId !== user.id) {
    return forbidden(c)
  }

  // Delete campground (comments will cascade delete)
  await db.delete(campgrounds).where(eq(campgrounds.id, id))

  return c.json<ApiSuccess>({ success: true, message: 'Campground deleted' })
})

export default campgroundsRouter
