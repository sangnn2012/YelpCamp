import type { AppRouter } from '../../server/trpc'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export const useTrpc = () => {
  const { $trpc } = useNuxtApp()
  return $trpc as ReturnType<typeof import('trpc-nuxt/client').createTRPCNuxtClient<AppRouter>>
}
