// Providers must finish setup before using the main dashboard
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/provider')) return
  if (to.path.startsWith('/provider/setup')) return

  const { role, fetchProfile, authUserId, user } = useAuth()
  if (role.value !== 'provider') return

  const userId = user.value?.id ?? authUserId.value
  if (userId) await fetchProfile(userId)

  const { fetchMyProvider, needsOnboarding } = useProviderProfile()
  await fetchMyProvider()

  if (needsOnboarding.value) {
    return navigateTo('/provider/setup', { replace: true })
  }
})
