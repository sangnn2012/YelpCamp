export interface User {
  id: string
  username: string
  email: string
}

export interface Campground {
  id: number
  name: string
  price: string
  image: string
  description: string
  location?: string
  authorId?: string
  author?: {
    id: string
    username: string
  }
  comments?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  text: string
  campgroundId: number
  authorId?: string
  author?: {
    id: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface ApiError {
  error: string
  message?: string
}
