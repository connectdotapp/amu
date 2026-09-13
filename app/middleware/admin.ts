export default defineNuxtRouteMiddleware(async () => {
  const user = await getCurrentUser()
  if (!user) return navigateTo('/login')
  // Force refresh so newly-granted admin claims propagate without a full re-login.
  const token = await user.getIdTokenResult(true)
  if (!token.claims.admin) return navigateTo('/')
})
