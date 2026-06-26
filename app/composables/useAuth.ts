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
  // session user id; useSupabaseUser() can lag behind after login
  const authUserId = useState<string | null>('auth-user-id', () => null)

  const resolveUserId = (userId?: string) =>
    userId ?? user.value?.id ?? authUserId.value ?? null

  const fetchProfile = async (userId?: string): Promise<Profile | null> => {
    const id = resolveUserId(userId)
    if (!id) {
      profile.value = null
      return null
    }
    // clear cached profile if we're loading a different user
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
    if (!current) return

    // Already linked — nothing to do
    if (current.provider_id) return

    // Step 1: Ensure the profile role is 'provider' in the DB before inserting
    // the provider row. The RLS with_check on providers_insert_own reads
    // get_my_role() which queries profiles, so the role must be set first.
    if (current.role !== 'provider') {
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'provider' })
        .eq('id', userId)

      if (roleError) {
        console.error('Failed to set provider role:', roleError.message)
        return
      }

      // Refresh local profile so subsequent reads see the updated role
      await fetchProfile(userId)
    }

    // Step 2: Now insert the provider row — RLS with_check will pass
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .insert({
        name: `${fullName}'s Laundry`,
        location: 'Update your location',
        phone: '',
        is_listed: false,
      })
      .select('id')
      .single()

    if (providerError || !providerData) {
      console.error('Failed to create provider record:', providerError?.message)
      return
    }

    // Step 3: Link provider_id back to the profile
    const { error: linkError } = await supabase
      .from('profiles')
      .update({ provider_id: providerData.id })
      .eq('id', userId)

    if (linkError) {
      console.error('Failed to link provider_id to profile:', linkError.message)
      return
    }

    await fetchProfile(userId)
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
        return {
          error: 'Account created, but user data is missing. Please try logging in.',
          needsEmailConfirmation: false,
        }
      }

      // try to sign in immediately if no session was returned
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