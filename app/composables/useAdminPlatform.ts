import type { OrderStatus, Profile, Provider, Service } from '~/types/supabase'

export interface AdminOrderStats {
  today: number
  last7Days: number
  last30Days: number
  total: number
  active: number
  pending: number
  delivered: number
  cancelled: number
}

export interface AdminPlatformStats {
  orders: AdminOrderStats
  totalProviders: number
  listedProviders: number
  totalCustomers: number
}

export interface ProviderPerformanceRow {
  id: string
  name: string
  avgRating: number
  completed: number
}

export interface ProviderWithDeletionInfo extends Provider {
  service_count?: number
  last_activity?: string | null
  eligible_for_deletion?: boolean
  deletion_reason?: string
}

export interface AdminReportsData {
  monthlyActiveUsers: number
  totalDelivered: number
  totalOrders: number
  topService: string
  topServiceCount: number
  providerPerformance: ProviderPerformanceRow[]
}

function startOfTodayIso() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function daysAgoIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function useAdminPlatform() {
  const supabase = useSupabaseClient()

  const stats = useState<AdminPlatformStats | null>('admin-platform-stats', () => null)
  const providers = useState<ProviderWithDeletionInfo[]>('admin-providers', () => [])
  const customers = useState<Profile[]>('admin-customers', () => [])
  const reports = useState<AdminReportsData | null>('admin-reports', () => null)
  const loaded = useState<boolean>('admin-platform-loaded', () => false)

  const countOrders = async (opts?: { since?: string; status?: OrderStatus }) => {
    let q = supabase.from('orders').select('*', { count: 'exact', head: true })
    if (opts?.since) q = q.gte('created_at', opts.since)
    if (opts?.status) q = q.eq('status', opts.status)
    const { count, error } = await q
    if (error) return 0
    return count ?? 0
  }

  const countActiveOrders = async (since?: string) => {
    let q = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'washing', 'ready'])
    if (since) q = q.gte('created_at', since)
    const { count, error } = await q
    if (error) return 0
    return count ?? 0
  }

  const loadStats = async (force = false) => {
    if (loaded.value && !force) return

    const today = startOfTodayIso()
    const last7 = daysAgoIso(7)
    const last30 = daysAgoIso(30)

    const [
      todayCount,
      last7Count,
      last30Count,
      totalCount,
      activeCount,
      pendingCount,
      deliveredCount,
      cancelledCount,
      totalProviders,
      listedProviders,
      totalCustomers,
    ] = await Promise.all([
      countOrders({ since: today }),
      countOrders({ since: last7 }),
      countOrders({ since: last30 }),
      countOrders(),
      countActiveOrders(),
      countOrders({ status: 'pending' }),
      countOrders({ status: 'delivered' }),
      countOrders({ status: 'cancelled' }),
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_listed', true),
      supabase.rpc('count_customers'),
    ])

    stats.value = {
      orders: {
        today: todayCount,
        last7Days: last7Count,
        last30Days: last30Count,
        total: totalCount,
        active: activeCount,
        pending: pendingCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
      },
      totalProviders: totalProviders.count ?? 0,
      listedProviders: listedProviders.count ?? 0,
      totalCustomers: totalCustomers?.data ?? 0,
    }
    loaded.value = true
  }

  const loadProviders = async () => {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Failed to load providers', error)
      providers.value = []
      return
    }
    
    // Enrich providers with deletion eligibility info
    const providersWithInfo = await Promise.all(
      (data as Provider[]).map(async (p) => {
        // Count services for this provider
        const { count: serviceCount } = await supabase
          .from('provider_services')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', p.id)
        
        // Get last activity (last order date)
        const { data: lastOrder } = await supabase
          .from('orders')
          .select('created_at')
          .eq('provider_id', p.id)
          .order('created_at', { ascending: false })
          .limit(1)
        
        const lastActivity = (lastOrder && lastOrder.length > 0) ? (lastOrder as any)[0]?.created_at || null : null
        const hasNoServices = (serviceCount ?? 0) === 0
        
        // Check if inactive for more than 90 days
        const ninetyDaysAgo = daysAgoIso(90)
        const isInactive = lastActivity ? new Date(lastActivity) < new Date(ninetyDaysAgo) : false
        
        const eligibleForDeletion = hasNoServices || isInactive
        const deletionReason = hasNoServices 
          ? 'No services offered' 
          : isInactive 
            ? 'Inactive for 90+ days' 
            : ''
        
        return {
          ...p,
          service_count: serviceCount ?? 0,
          last_activity: lastActivity,
          eligible_for_deletion: eligibleForDeletion,
          deletion_reason: deletionReason,
        } as ProviderWithDeletionInfo
      })
    )
    
    providers.value = providersWithInfo
  }

  const approveProvider = async (providerId: string) => {
    const { error } = await supabase
      .from('providers')
      .update({ approval_status: 'approved', is_listed: true })
      .eq('id', providerId)
    if (error) return { error: error.message }
    await loadProviders()
    return { error: null }
  }

  const disableProvider = async (providerId: string) => {
    const { error } = await supabase
      .from('providers')
      .update({ approval_status: 'disabled', is_listed: false })
      .eq('id', providerId)
    if (error) return { error: error.message }
    await loadProviders()
    return { error: null }
  }

  const restoreProvider = async (providerId: string) => {
    const { error } = await supabase
      .from('providers')
      .update({ approval_status: 'approved', is_listed: true })
      .eq('id', providerId)
    if (error) return { error: error.message }
    await loadProviders()
    return { error: null }
  }

  const deleteProvider = async (providerId: string) => {
    // Delete provider services first
    const { error: servicesError } = await supabase
      .from('provider_services')
      .delete()
      .eq('provider_id', providerId)
    
    if (servicesError) return { error: servicesError.message }
    
    // Delete the provider
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', providerId)
    
    if (error) return { error: error.message }
    await loadProviders()
    return { error: null }
  }

  const pendingCustomServices = useState<Service[]>('admin-pending-services', () => [])

  const loadPendingCustomServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*, provider:providers(id, name)')
      .not('provider_id', 'is', null)
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load pending custom services', error)
      pendingCustomServices.value = []
      return
    }
    pendingCustomServices.value = data as Service[]
  }

  const approveCustomService = async (serviceId: string) => {
    const { error } = await supabase
      .from('services')
      .update({ approval_status: 'approved' })
      .eq('id', serviceId)
    if (error) return { error: error.message }
    await loadPendingCustomServices()
    return { error: null }
  }

  const rejectCustomService = async (serviceId: string) => {
    const { error } = await supabase
      .from('services')
      .update({ approval_status: 'rejected' })
      .eq('id', serviceId)
    if (error) return { error: error.message }
    await loadPendingCustomServices()
    return { error: null }
  }

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .rpc('get_customers')

    if (error) {
      console.error('Failed to load customers', error)
      customers.value = []
      return
    }

    customers.value = data as Profile[]
  }

  const loadReports = async () => {
    const last30 = daysAgoIso(30)

    const [
      { data: providerRows, error: providerError },
      { data: deliveredOrders, error: deliveredError },
      { data: recentOrders, error: recentError },
      { data: serviceRows, error: serviceError },
      totalOrders,
    ] = await Promise.all([
      supabase.from('providers').select('id, name, rating, review_count').order('rating', { ascending: false }),
      supabase.from('orders').select('provider_id').eq('status', 'delivered'),
      supabase.from('orders').select('customer_id').gte('created_at', last30),
      supabase.from('order_services').select('title'),
      countOrders(),
    ])

    if (providerError) console.error('Failed to load providers for reports:', providerError)
    if (deliveredError) console.error('Failed to load delivered orders:', deliveredError)
    if (recentError) console.error('Failed to load recent orders:', recentError)
    if (serviceError) console.error('Failed to load service rows:', serviceError)

    const completedByProvider = new Map<string, number>()
    for (const o of deliveredOrders ?? []) {
      const id = (o as { provider_id: string }).provider_id
      completedByProvider.set(id, (completedByProvider.get(id) ?? 0) + 1)
    }

    const providerPerformance: ProviderPerformanceRow[] = (providerRows ?? []).map((p) => {
      const row = p as { id: string; name: string; rating: number; review_count: number }
      return {
        id: row.id,
        name: row.name,
        avgRating: row.rating,
        completed: completedByProvider.get(row.id) ?? 0,
      }
    })

    providerPerformance.sort((a, b) => b.completed - a.completed)

    const serviceCounts = new Map<string, number>()
    for (const s of serviceRows ?? []) {
      const title = (s as { title: string }).title
      serviceCounts.set(title, (serviceCounts.get(title) ?? 0) + 1)
    }
    let topService = 'N/A'
    let topServiceCount = 0
    for (const [title, count] of serviceCounts) {
      if (count > topServiceCount) {
        topService = title
        topServiceCount = count
      }
    }

    const mau = new Set((recentOrders ?? []).map((o) => (o as { customer_id: string }).customer_id)).size

    reports.value = {
      monthlyActiveUsers: mau,
      totalDelivered: deliveredOrders?.length ?? 0,
      totalOrders: totalOrders as number,
      topService,
      topServiceCount,
      providerPerformance,
    }
  }

  return {
    stats,
    providers,
    customers,
    reports,
    loaded,
    pendingCustomServices,
    loadStats,
    loadProviders,
    loadCustomers,
    loadReports,
    approveProvider,
    disableProvider,
    restoreProvider,
    deleteProvider,
    loadPendingCustomServices,
    approveCustomService,
    rejectCustomService,
  }
}
