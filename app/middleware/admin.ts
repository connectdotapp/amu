export default defineNuxtRouteMiddleware(async () => {
  const user = await getCurrentUser()
  if (!user) return navigateTo('/login')
  const token = await user.getIdTokenResult()
  if (!token.claims.admin) return navigateTo('/')
})
