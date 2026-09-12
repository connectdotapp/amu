export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()
  if (!user) return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})
