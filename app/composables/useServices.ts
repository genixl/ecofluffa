import type { Service, Provider, ProviderService } from '~/types/supabase'
import { SERVICE_CATEGORIES, PROVIDER_PLACEHOLDER_LOCATION } from '~/types/supabase'

export function isProviderVisibleOnPortal(
  provider: Provider,
  offersForProvider: ProviderService[]
) {
  if (provider.is_listed !== true) return false
  if (!offersForProvider.length) return false
  return !!(
    provider.name?.trim()
    && provider.location?.trim()
    && provider.location !== PROVIDER_PLACEHOLDER_LOCATION
    && provider.phone?.trim()
  )
}

export function useServices() {
  const supabase = useSupabaseClient()

  const services = useState<Service[]>('services-list', () => [])
  const providers = useState<Provider[]>('providers-list', () => [])
  const providerServices = useState<ProviderService[]>('provider-services-list', () => [])
  const loading = useState<boolean>('services-loading', () => false)

  const fetchAll = async (force = false) => {
    if (
      !force
      && services.value.length
      && providers.value.length
      && providerServices.value.length
    ) {
      return
    }

    loading.value = true

    const [svcRes, prvRes, psRes] = await Promise.all([
      supabase.from('services').select('*').order('title'),
      supabase.from('providers').select('*').order('name'),
      supabase
        .from('provider_services')
        .select('*, provider:providers(*), service:services(*)'),
    ])

    if (!svcRes.error && svcRes.data) services.value = svcRes.data as Service[]

    const allProviders = (prvRes.data ?? []) as Provider[]
    const allOffers = (psRes.data ?? []) as ProviderService[]

    const visibleOffers = allOffers.filter((ps) => {
      const p = allProviders.find((x) => x.id === ps.provider_id)
      if (!p) return false
      const siblingOffers = allOffers.filter((o) => o.provider_id === p.id)
      return isProviderVisibleOnPortal(p, siblingOffers)
    })

    const visibleProviderIds = new Set(visibleOffers.map((o) => o.provider_id))

    providers.value = allProviders.filter((p) => visibleProviderIds.has(p.id))
    providerServices.value = visibleOffers

    loading.value = false
  }

  const refreshCatalog = async () => {
    await fetchAll(true)
  }

  const getProvidersForService = (serviceId: string) => {
    return providerServices.value
      .filter((ps) => ps.service_id === serviceId)
      .map((ps) => ({
        provider: ps.provider!,
        offer: ps,
      }))
  }

  const getServiceById = (id: string) =>
    services.value.find((s) => s.id === id) ?? null

  const getProviderById = (id: string) =>
    providers.value.find((p) => p.id === id) ?? null

  const categories = SERVICE_CATEGORIES

  const createService = async (serviceData: {
    title: string
    category: string
    price_label: string
    description: string
    turnaround: string
    popular?: boolean
    provider_id?: string | null
  }) => {
    const insertData = {
      title: serviceData.title,
      category: serviceData.category,
      price_label: serviceData.price_label,
      description: serviceData.description,
      turnaround: serviceData.turnaround,
      popular: serviceData.popular ?? false,
      provider_id: serviceData.provider_id ?? null,
    } as any
    const { data, error } = await supabase.from('services').insert(insertData).select('id').single() as any
    
    if (!error && data) {
      await refreshCatalog()
      return data.id as string
    }
    return null
  }

  return {
    services,
    providers,
    providerServices,
    loading,
    fetchAll,
    refreshCatalog,
    getProvidersForService,
    getServiceById,
    getProviderById,
    categories,
    isProviderVisibleOnPortal,
    createService,
  }
}
