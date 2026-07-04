// Redirect unauthenticated users to login
export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/', '/customer/browse', '/about', '/contact', '/auth/login', '/auth/register']
  if (publicRoutes.some((r) => to.path === r || to.path.startsWith('/customer/providers'))) return

  const user = useSupabaseUser()
  if (user.value) return

  // Cookie/session can lag behind signInWithPassword; check session directly
  const supabase = useSupabaseClient()
  const result = await supabase.auth.getUser()
  const authUser = result.data.user
  if (authUser) return

  return navigateTo('/auth/login')
})
