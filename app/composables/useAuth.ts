import type { UserRole, Profile } from '~/types/supabase'

const PROFILE_RETRY_MS = [150, 300, 500, 800, 1200]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const profile = useState<Profile | null>('auth-profile', () => null)
  const loading = useState<boolean>('auth-loading', () => false)
  /** Session user id — set from getSession(); useSupabaseUser() can lag behind this. */
  const authUserId = useState<string | null>('auth-user-id', () => null)

  const resolveUserId = (userId?: string) =>
    userId ?? user.value?.id ?? authUserId.value ?? null

  const fetchProfile = async (userId?: string): Promise<Profile | null> => {
    const id = resolveUserId(userId)
    if (!id) {
      profile.value = null
      return null
    }
    // Drop cached profile from a different user (e.g. after logout/login)
    if (profile.value?.id && profile.value.id !== id) {
      profile.value = null
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) {
        console.warn('Failed to fetch profile:', error.message)
        if (profile.value?.id !== id) profile.value = null
        return null
      }
      profile.value = (data as Profile | null) ?? null
      return profile.value
    } catch (err) {
      console.warn('Error fetching profile:', err)
      if (profile.value?.id !== id) profile.value = null
      return null
    }
  }

  /** Create or refresh profile row (handles trigger delay / missing trigger). */
  const ensureProfile = async (
    userId: string,
    fullName: string,
    role: UserRole
  ): Promise<Profile | null> => {
    for (let i = 0; i < PROFILE_RETRY_MS.length; i++) {
      const existing = await fetchProfile(userId)
      if (existing) return existing

      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          { id: userId, full_name: fullName, role },
          { onConflict: 'id' }
        )
        .select()
        .single()

      if (!error && data) {
        profile.value = data as Profile
        return profile.value
      }

      if (error && !error.message.includes('duplicate') && i === PROFILE_RETRY_MS.length - 1) {
        console.warn('Could not ensure profile:', error.message)
      }

      await delay(PROFILE_RETRY_MS[i]!)
    }

    return await fetchProfile(userId)
  }

  const ensureProviderLink = async (userId: string, fullName: string) => {
    const current = profile.value ?? (await fetchProfile(userId))
    if (!current || current.role !== 'provider' || current.provider_id) return

    const basePayload = {
      name: `${fullName}'s Laundry`,
      location: 'Update your location',
      phone: '',
    }

    let providerData: { id: string } | null = null
    let providerError: { message: string } | null = null

    const withListed = await supabase
      .from('providers')
      .insert({ ...basePayload, is_listed: false })
      .select('id')
      .single()

    if (!withListed.error && withListed.data) {
      providerData = withListed.data
    } else if (withListed.error?.message?.includes('is_listed')) {
      const fallback = await supabase
        .from('providers')
        .insert(basePayload)
        .select('id')
        .single()
      providerData = fallback.data
      providerError = fallback.error
    } else {
      providerError = withListed.error
    }

    if (providerError || !providerData) {
      console.error('Failed to create provider record:', providerError?.message)
      return
    }

    const { error: linkError } = await supabase
      .from('profiles')
      .update({ provider_id: providerData.id })
      .eq('id', userId)

    if (!linkError) await fetchProfile(userId)
  }

  const getRedirectPath = (userRole?: UserRole | null) => {
    const r = userRole ?? role.value
    if (r === 'admin') return '/admin'
    if (r === 'provider') return '/provider'
    return '/customer'
  }

  const waitForSessionUserId = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user?.id) return data.session.user.id

    for (const ms of PROFILE_RETRY_MS) {
      await delay(ms)
      if (user.value?.id) return user.value.id
      const retry = await supabase.auth.getSession()
      if (retry.data.session?.user?.id) return retry.data.session.user.id
    }
    return null
  }

  /** Wait until Nuxt user ref or session is ready (avoids auth middleware bounce after login). */
  const waitForAuthReady = async (): Promise<boolean> => {
    if (user.value?.id) return true
    const id = await waitForSessionUserId()
    return !!id
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message, needsEmailConfirmation: false }

      const authUser = data.user
      const userId = authUser?.id ?? (await waitForSessionUserId())
      if (!userId) {
        return {
          error: 'Signed in, but session was not ready. Please try again.',
          needsEmailConfirmation: false,
        }
      }

      const meta = authUser?.user_metadata ?? {}
      const fullName = (meta.full_name as string) || email.split('@')[0] || 'User'
      const metaRole = (meta.role as UserRole) || 'customer'

      const ensured = await ensureProfile(userId, fullName, metaRole)
      if (!ensured) {
        return {
          error: 'Login succeeded, but your profile could not be loaded. Please try again or contact support.',
          needsEmailConfirmation: false,
        }
      }

      if (ensured.role === 'provider') {
        await ensureProviderLink(userId, ensured.full_name || fullName)
      }

      await waitForAuthReady()

      return {
        error: null,
        needsEmailConfirmation: false,
        redirectPath: getRedirectPath(ensured.role),
      }
    } finally {
      loading.value = false
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'customer' | 'provider'
  ) => {
    loading.value = true
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })

      if (signUpError) return { error: signUpError.message, needsEmailConfirmation: false }

      const newUser = signUpData.user
      if (!newUser?.id) {
        return { error: 'Account created, but user data is missing. Please try logging in.', needsEmailConfirmation: false }
      }

      // Session may be returned when email confirmation is disabled
      let userId = signUpData.session?.user?.id ?? newUser.id
      if (!signUpData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          const needsConfirm =
            signInError.message.toLowerCase().includes('confirm') ||
            signInError.message.toLowerCase().includes('verified')
          if (needsConfirm) {
            return {
              error: null,
              needsEmailConfirmation: true,
            }
          }
          return { error: signInError.message, needsEmailConfirmation: false }
        }

        userId = signInData.user?.id ?? (await waitForSessionUserId()) ?? newUser.id
      }

      const ensured = await ensureProfile(userId, fullName, role)
      if (!ensured) {
        return {
          error: 'Account created, but profile setup failed. Please log in to finish setup.',
          needsEmailConfirmation: false,
        }
      }

      if (role === 'provider') {
        await ensureProviderLink(userId, fullName)
      }

      await waitForAuthReady()

      return {
        error: null,
        needsEmailConfirmation: false,
        redirectPath: getRedirectPath(role),
      }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    profile.value = null
    authUserId.value = null
    usePlatform().resetPlatformData()
  }

  const role = computed<UserRole | null>(() => {
    if (!profile.value) return null
    const uid = resolveUserId()
    if (uid && profile.value.id !== uid) return null
    return profile.value.role
  })

  const userName = computed(() => {
    const uid = resolveUserId()
    if (profile.value?.id === uid && profile.value.full_name) {
      return profile.value.full_name
    }
    return user.value?.email ?? ''
  })

  const isLoggedIn = computed(() => !!resolveUserId())
  const isCustomer = computed(() => role.value === 'customer')
  const isProvider = computed(() => role.value === 'provider')
  const isAdmin = computed(() => role.value === 'admin')

  return {
    user,
    profile,
    role,
    userName,
    loading,
    isLoggedIn,
    isCustomer,
    isProvider,
    isAdmin,
    signIn,
    signUp,
    signOut,
    fetchProfile,
    ensureProfile,
    ensureProviderLink,
    getRedirectPath,
    waitForAuthReady,
    authUserId,
  }
}
