// Guard routes by role
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  let userId = user.value?.id
  if (!userId) {
    const result = await supabase.auth.getUser()
    const authUser = result.data.user
    userId = authUser?.id
  }
  if (!userId) return navigateTo('/auth/login')

  const { profile, fetchProfile } = useAuth()
  if (profile.value?.id && profile.value.id !== userId) {
    profile.value = null
  }

  const loaded = profile.value?.id === userId
    ? profile.value
    : await fetchProfile(userId)

  const role = loaded?.role
  if (!role) {
    return navigateTo({
      path: '/auth/login',
      query: { message: 'Could not load your profile. Please try again.' },
    })
  }

  if (to.path.startsWith('/admin') && role !== 'admin') {
    return navigateTo(role === 'provider' ? '/provider' : '/customer', { replace: true })
  }
  if (to.path.startsWith('/provider') && role !== 'provider' && role !== 'admin') {
    return navigateTo('/customer', { replace: true })
  }
  if (to.path.startsWith('/customer') && role !== 'customer' && role !== 'admin') {
    return navigateTo('/provider', { replace: true })
  }
})
