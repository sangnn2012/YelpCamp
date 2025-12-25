import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from './useApi'
import type { Campground, PaginatedResponse } from '@/types'

export function useCampgrounds(page = 1, search?: string) {
  return useQuery({
    queryKey: ['campgrounds', page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      return api.get<PaginatedResponse<Campground>>(`/campgrounds?${params}`)
    }
  })
}

export function useCampground(id: number) {
  return useQuery({
    queryKey: ['campground', id],
    queryFn: () => api.get<Campground>(`/campgrounds/${id}`),
    enabled: !!id
  })
}

export function useCreateCampground() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Campground, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<Campground>('/campgrounds', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campgrounds'] })
    }
  })
}

export function useUpdateCampground() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Campground> }) =>
      api.put<Campground>(`/campgrounds/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['campgrounds'] })
      queryClient.invalidateQueries({ queryKey: ['campground', id] })
    }
  })
}

export function useDeleteCampground() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.delete(`/campgrounds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campgrounds'] })
    }
  })
}
