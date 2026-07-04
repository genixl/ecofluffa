import type { Provider, ProviderService, Service, Rating } from '~/types/supabase'
import { PROVIDER_PLACEHOLDER_LOCATION, isCatalogService } from '~/types/supabase'

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
  const catalogServices = useState<Service[]>('my-catalog-services', () => [])
  const ratings = useState<Rating[]>('my-provider-ratings', () => [])
  const loading = useState<boolean>('provider-profile-loading', () => false)

  const fetchMyProvider = async () => {
    if (!profile.value?.provider_id) {
      console.log('fetchMyProvider: No provider_id in profile')
      return
    }
    loading.value = true

    const providerId = profile.value.provider_id

    const [prvRes, svcRes, catalogRes, ratingsRes] = await Promise.all([
      supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single(),
      supabase
        .from('provider_services')
        .select('*, service:services(*)')
        .eq('provider_id', providerId),
      supabase
        .from('services')
        .select('*')
        .is('provider_id', null)
        .order('title'),
      supabase
        .from('ratings')
        .select('*, orders!inner(customer_id)')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false }),
    ])

    if (prvRes.error) console.error('Provider fetch error:', prvRes.error)
    if (!prvRes.error && prvRes.data) provider.value = prvRes.data as Provider
    
    if (svcRes.error) console.error('Provider services fetch error:', svcRes.error)
    if (!svcRes.error && svcRes.data) myServices.value = svcRes.data as ProviderService[]
    
    if (catalogRes.error) console.error('Catalog services fetch error:', catalogRes.error)
    if (!catalogRes.error && catalogRes.data) {
      catalogServices.value = catalogRes.data as Service[]
      console.log('Catalog services loaded:', catalogServices.value.length)
    } else {
      console.log('Catalog services empty or error:', catalogRes.error?.message || 'No data')
    }

    if (ratingsRes.error) console.error('Ratings fetch error:', ratingsRes.error)
    if (!ratingsRes.error && ratingsRes.data) {
      ratings.value = ratingsRes.data as Rating[]
    } else {
      ratings.value = []
    }

    loading.value = false
  }

  const needsOnboarding = computed(() => {
    if (!provider.value) return true
    return !isProviderBusinessComplete(provider.value) || myServices.value.length === 0
  })

  const isPendingApproval = computed(
    () => provider.value?.approval_status === 'pending' && !needsOnboarding.value
  )

  const isDisabled = computed(() => provider.value?.approval_status === 'disabled')

  const isApproved = computed(() => provider.value?.approval_status === 'approved')

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
    photo_url?: string | null
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

  /** Submit completed profile for admin review (does not self-publish). */
  const submitForApproval = async () => {
    if (!profile.value?.provider_id) return { error: 'Provider account not linked.' }
    if (!canPublish.value) {
      return {
        error: 'Complete your business details and add at least one service before submitting.',
      }
    }
    const { data, error } = await supabase
      .from('providers')
      .update({ approval_status: 'pending', is_listed: false })
      .eq('id', profile.value.provider_id)
      .select()
      .single()

    if (error?.message?.includes('approval_status')) {
      return {
        error:
          'Database is missing providers.approval_status. Run NewSQL.sql in Supabase, then try again.',
      }
    }
    if (error) return { error: error.message }
    if (data) {
      provider.value = data as Provider
    }
    return { error: null }
  }

  const getCatalogServicesAvailableToAdd = () => {
    const ownedIds = new Set(myServices.value.map((ps) => ps.service_id))
    return catalogServices.value.filter(
      (s) => isCatalogService(s) && !ownedIds.has(s.id)
    )
  }

  return {
    provider,
    myServices,
    catalogServices,
    ratings,
    loading,
    needsOnboarding,
    isPendingApproval,
    isDisabled,
    isApproved,
    canPublish,
    fetchMyProvider,
    updatePersonalProfile,
    addService,
    updateService,
    removeService,
    updateProvider,
    submitForApproval,
    getCatalogServicesAvailableToAdd,
    isProviderBusinessComplete,
  }
}
