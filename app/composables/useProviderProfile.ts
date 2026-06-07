import type { Provider, ProviderService } from '~/types/supabase'
import { PROVIDER_PLACEHOLDER_LOCATION } from '~/types/supabase'

export function isProviderBusinessComplete(provider: Provider | null) {
  if (!provider) return false
  return !!(
    provider.name.trim()
    && provider.location.trim()
    && provider.location !== PROVIDER_PLACEHOLDER_LOCATION
    && provider.phone.trim()
  )
}

export function useProviderProfile() {
  const supabase = useSupabaseClient()
  const { profile, fetchProfile } = useAuth()
  const { refreshCatalog } = useServices()

  const provider = useState<Provider | null>('my-provider', () => null)
  const myServices = useState<ProviderService[]>('my-provider-services', () => [])
  const loading = useState<boolean>('provider-profile-loading', () => false)

  const fetchMyProvider = async () => {
    if (!profile.value?.provider_id) return
    loading.value = true

    const [prvRes, svcRes] = await Promise.all([
      supabase
        .from('providers')
        .select('*')
        .eq('id', profile.value.provider_id)
        .single(),
      supabase
        .from('provider_services')
        .select('*, service:services(*)')
        .eq('provider_id', profile.value.provider_id),
    ])

    if (!prvRes.error && prvRes.data) provider.value = prvRes.data as Provider
    if (!svcRes.error && svcRes.data) myServices.value = svcRes.data as ProviderService[]
    loading.value = false
  }

  const needsOnboarding = computed(() => {
    if (!provider.value) return true
    return provider.value.is_listed !== true
  })

  const canPublish = computed(
    () => isProviderBusinessComplete(provider.value) && myServices.value.length > 0
  )

  const syncCatalog = async () => {
    await refreshCatalog()
  }

  const updatePersonalProfile = async (fullName: string, phone: string) => {
    if (!profile.value?.id) return { error: 'Not signed in.' }
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile.value.id)
    if (error) return { error: error.message }
    await fetchProfile(profile.value.id)
    return { error: null }
  }

  const addService = async (serviceId: string, price: string, unit: string, turnaround: string) => {
    if (!profile.value?.provider_id) return { error: 'Provider not linked.' }
    const { data, error } = await supabase
      .from('provider_services')
      .insert({
        provider_id: profile.value.provider_id,
        service_id: serviceId,
        price,
        unit,
        turnaround,
      })
      .select('*, service:services(*)')
      .single()
    if (error) return { error: error.message }
    if (data) {
      myServices.value.push(data as ProviderService)
      await syncCatalog()
    }
    return { error: null }
  }

  const updateService = async (id: string, price: string, unit: string, turnaround: string) => {
    const { error } = await supabase
      .from('provider_services')
      .update({ price, unit, turnaround })
      .eq('id', id)
    if (!error) {
      const s = myServices.value.find((x) => x.id === id)
      if (s) {
        s.price = price
        s.unit = unit
        s.turnaround = turnaround
      }
      await syncCatalog()
    }
    return { error: error?.message ?? null }
  }

  const removeService = async (id: string) => {
    const { error } = await supabase
      .from('provider_services')
      .delete()
      .eq('id', id)
    if (!error) {
      myServices.value = myServices.value.filter((s) => s.id !== id)
      await syncCatalog()
    }
    return { error: error?.message ?? null }
  }

  const updateProvider = async (payload: {
    name?: string
    location?: string
    phone?: string
    pickup_fee?: string
  }) => {
    if (!profile.value?.provider_id) return { error: 'Provider account not linked.' }
    const { data, error } = await supabase
      .from('providers')
      .update(payload)
      .eq('id', profile.value.provider_id)
      .select()
      .single()
    if (error) return { error: error.message }
    if (data) {
      provider.value = data as Provider
      await syncCatalog()
    }
    return { error: null }
  }

  /** Mark business as live on customer browse / compare pages. */
  const publishToCustomers = async () => {
    if (!profile.value?.provider_id) return { error: 'Provider account not linked.' }
    if (!canPublish.value) {
      return {
        error: 'Complete your business details and add at least one service before publishing.',
      }
    }
    const { data, error } = await supabase
      .from('providers')
      .update({ is_listed: true })
      .eq('id', profile.value.provider_id)
      .select()
      .single()

    if (error?.message?.includes('is_listed')) {
      return {
        error:
          'Database is missing the providers.is_listed column. Run fix-provider-setup.sql in Supabase, then try again.',
      }
    }
    if (error) return { error: error.message }
    if (data) {
      provider.value = data as Provider
      await syncCatalog()
    }
    return { error: null }
  }

  return {
    provider,
    myServices,
    loading,
    needsOnboarding,
    canPublish,
    fetchMyProvider,
    updatePersonalProfile,
    addService,
    updateService,
    removeService,
    updateProvider,
    publishToCustomers,
    isProviderBusinessComplete,
  }
}
