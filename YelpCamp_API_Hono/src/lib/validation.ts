import { z } from 'zod'

// ============================================================================
// Campground Schemas
// ============================================================================

export const createCampgroundSchema = z.object({
  name: z
    .string()
    .min(1, 'Campground name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform((v) => v.trim()),
  price: z
    .string()
    .min(1, 'Price is required')
    .transform((v) => v.trim()),
  image: z
    .string()
    .url('Must be a valid URL')
    .transform((v) => v.trim()),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters')
    .transform((v) => v.trim()),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .transform((v) => v.trim())
    .nullable()
    .optional()
})

export const updateCampgroundSchema = createCampgroundSchema.partial()

export type CreateCampgroundInput = z.infer<typeof createCampgroundSchema>
export type UpdateCampgroundInput = z.infer<typeof updateCampgroundSchema>

// ============================================================================
// Comment Schemas
// ============================================================================

export const createCommentSchema = z.object({
  campgroundId: z.number().int().positive('Invalid campground ID'),
  text: z
    .string()
    .min(1, 'Comment text is required')
    .max(500, 'Comment must be less than 500 characters')
    .transform((v) => v.trim())
})

export const updateCommentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment text is required')
    .max(500, 'Comment must be less than 500 characters')
    .transform((v) => v.trim())
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>

// ============================================================================
// Query Schemas
// ============================================================================

export const listQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
})

export type ListQueryInput = z.infer<typeof listQuerySchema>

// ============================================================================
// Validation Helper
// ============================================================================

export interface ValidationResult<T> {
  success: true
  data: T
}

export interface ValidationError {
  success: false
  error: string
}

export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> | ValidationError {
  const result = schema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.errors[0]
    return {
      success: false,
      error: firstError?.message ?? 'Validation failed'
    }
  }

  return {
    success: true,
    data: result.data
  }
}
