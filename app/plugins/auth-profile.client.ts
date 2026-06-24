export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { fetchProfile, profile, authUserId } = useAuth()

  const syncForUser = async (userId: string | undefined) => {
    if (!userId) {
      authUserId.value = null
      profile.value = null
      return
    }
    authUserId.value = userId
    await fetchProfile(userId)
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.id) {
    await syncForUser(session.user.id)
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    await syncForUser(session?.user?.id)
  })

  watch(
    user,
    async (next, prev) => {
      if (!next?.id) {
        if (!authUserId.value) {
          profile.value = null
        }
        return
      }
      if (prev?.id && prev.id !== next.id) {
        profile.value = null
      }
      authUserId.value = next.id
      await fetchProfile(next.id)
    },
    { immediate: true }
  )
})
