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

  const result = await supabase.auth.getUser()
  const authUser = result.data.user
  if (authUser?.id) {
    await syncForUser(authUser.id)
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    const validatedResult = await supabase.auth.getUser()
    const validatedUser = validatedResult.data.user
    await syncForUser(validatedUser?.id)
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
