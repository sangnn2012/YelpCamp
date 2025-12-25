import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { comments, campgrounds } from '../db/schema'
import { requireAuth, getAuthUser } from '../middleware/auth'
import {
  createCommentSchema,
  updateCommentSchema,
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
import type { CommentResponse, ApiSuccess } from '../types'

const commentsRouter = new Hono()

// ============================================================================
// POST /comments - Create new comment (protected)
// ============================================================================
commentsRouter.post('/', requireAuth, async (c) => {
  const user = getAuthUser(c)

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return badRequest(c, 'Invalid JSON body')
  }

  const result = validate(createCommentSchema, body)
  if (!result.success) {
    return validationError(c, result.error)
  }

  const input = result.data

  // Check if campground exists
  const campground = await db.query.campgrounds.findFirst({
    where: eq(campgrounds.id, input.campgroundId)
  })

  if (!campground) {
    return notFound(c, 'Campground')
  }

  const [newComment] = await db
    .insert(comments)
    .values({
      text: input.text,
      campgroundId: input.campgroundId,
      authorId: user.id
    })
    .returning()

  return c.json(newComment, HttpStatus.CREATED)
})

// ============================================================================
// GET /comments/:id - Get comment by ID (protected)
// ============================================================================
commentsRouter.get('/:id', requireAuth, async (c) => {
  const id = parseId(c.req.param('id'))

  if (id === null) {
    return badRequest(c, 'Comment ID must be a valid number')
  }

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, id),
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
    return notFound(c, 'Comment')
  }

  return c.json<CommentResponse>(comment)
})

// ============================================================================
// PUT /comments/:id - Update comment (protected, owner only)
// ============================================================================
commentsRouter.put('/:id', requireAuth, async (c) => {
  const user = getAuthUser(c)
  const id = parseId(c.req.param('id'))

  if (id === null) {
    return badRequest(c, 'Comment ID must be a valid number')
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return badRequest(c, 'Invalid JSON body')
  }

  const result = validate(updateCommentSchema, body)
  if (!result.success) {
    return validationError(c, result.error)
  }

  // Check if comment exists
  const existing = await db.query.comments.findFirst({
    where: eq(comments.id, id)
  })

  if (!existing) {
    return notFound(c, 'Comment')
  }

  // Check ownership
  if (existing.authorId !== user.id) {
    return forbidden(c, 'You do not have permission to edit this comment')
  }

  const [updated] = await db
    .update(comments)
    .set({
      text: result.data.text,
      updatedAt: new Date()
    })
    .where(eq(comments.id, id))
    .returning()

  return c.json(updated)
})

// ============================================================================
// DELETE /comments/:id - Delete comment (protected, owner only)
// ============================================================================
commentsRouter.delete('/:id', requireAuth, async (c) => {
  const user = getAuthUser(c)
  const id = parseId(c.req.param('id'))

  if (id === null) {
    return badRequest(c, 'Comment ID must be a valid number')
  }

  // Check if comment exists
  const existing = await db.query.comments.findFirst({
    where: eq(comments.id, id)
  })

  if (!existing) {
    return notFound(c, 'Comment')
  }

  // Check ownership
  if (existing.authorId !== user.id) {
    return forbidden(c, 'You do not have permission to delete this comment')
  }

  await db.delete(comments).where(eq(comments.id, id))

  return c.json<ApiSuccess>({ success: true, message: 'Comment deleted' })
})

export default commentsRouter
