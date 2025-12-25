export default defineNuxtRouteMiddleware((_to, _from) => {
  const { isAuthenticated, isPending } = useAuth()
  const { setFlash } = useFlash()

  // Wait for auth to load
  if (isPending.value) {
    return
  }

  if (!isAuthenticated.value) {
    setFlash('error', 'You need to be logged in to do that')
    return navigateTo('/login')
  }
})
