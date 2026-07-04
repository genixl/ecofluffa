// Logged-in users land on their role dashboard instead of the marketing home page
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/') return

  const user = useSupabaseUser()
  let userId = user.value?.id
  if (!userId) {
    const result = await useSupabaseClient().auth.getUser()
    const authUser = result.data.user
    userId = authUser?.id
  }
  if (!userId) return

  const { fetchProfile, getRedirectPath, waitForAuthReady } = useAuth()
  await waitForAuthReady()
  await fetchProfile(userId)

  return navigateTo(getRedirectPath(), { replace: true })
})
