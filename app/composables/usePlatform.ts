import type {
  Order,
  OrderActivity,
  OrderMessage,
  OrderStatus,
  UserRole,
} from '~/types/supabase'
import { ORDER_FLOW, STATUS_LABELS } from '~/types/supabase'

export function usePlatform() {
  const supabase = useSupabaseClient()
  const { profile } = useAuth()

  // ── State ─────────────────────────────────────────────────
  const orders = useState<Order[]>('platform-orders', () => [])
  const activities = useState<OrderActivity[]>('platform-activities', () => [])
  const messages = useState<OrderMessage[]>('platform-messages', () => [])
  const loaded = useState<boolean>('platform-loaded', () => false)

  // ── Fetch helpers ─────────────────────────────────────────
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:profiles!orders_customer_id_fkey(id, full_name, phone),
        provider:providers(*),
        order_services(*)
      `)
      .order('created_at', { ascending: false })
    if (!error && data) orders.value = data as Order[]
  }

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('order_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error && data) activities.value = data as OrderActivity[]
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) messages.value = data as OrderMessage[]
  }

  const loadAll = async (force = false) => {
    if (loaded.value && !force) return
    if (force) loaded.value = false
    await Promise.all([fetchOrders(), fetchActivities(), fetchMessages()])
    loaded.value = true
  }

  const resetPlatformData = () => {
    orders.value = []
    activities.value = []
    messages.value = []
    loaded.value = false
  }

  // ── Order helpers ─────────────────────────────────────────
  const getOrderById = (id: string) =>
    orders.value.find((o) => o.id.toLowerCase() === id.toLowerCase()) ?? null

  const updateOrderStatus = async (
    id: string,
    status: OrderStatus,
    actor: UserRole,
    actorName: string
  ) => {
    const order = orders.value.find((o) => o.id === id)
    if (!order || order.status === status) return

    const prev = order.status

    // Optimistic update
    order.status = status

    // Persist to DB
    await supabase.from('orders').update({ status }).eq('id', id)

    // Log activity
    const activity = {
      order_id: id,
      type: status === 'cancelled' ? 'admin' : 'status',
      title: `Status: ${STATUS_LABELS[status]}`,
      detail: `${actorName} updated ${id} from ${STATUS_LABELS[prev]} to ${STATUS_LABELS[status]}.`,
      actor_role: actor,
      actor_name: actorName,
    } as Omit<OrderActivity, 'id' | 'created_at'>

    const { data: actData } = await supabase
      .from('order_activities')
      .insert(activity)
      .select()
      .single()
    if (actData) activities.value.unshift(actData as OrderActivity)
  }

  const addMessage = async (
    orderId: string,
    fromRole: UserRole,
    senderName: string,
    body: string
  ) => {
    const trimmed = body.trim()
    if (!trimmed) return

    const msg = {
      order_id: orderId,
      from_role: fromRole,
      sender_name: senderName,
      body: trimmed,
    }

    const { data: msgData } = await supabase
      .from('order_messages')
      .insert(msg)
      .select()
      .single()
    if (msgData) messages.value.push(msgData as OrderMessage)

    // Log activity
    const activity = {
      order_id: orderId,
      type: 'message',
      title: 'New message',
      detail: `${senderName}: ${trimmed.slice(0, 80)}${trimmed.length > 80 ? '…' : ''}`,
      actor_role: fromRole,
      actor_name: senderName,
    } as Omit<OrderActivity, 'id' | 'created_at'>

    const { data: actData } = await supabase
      .from('order_activities')
      .insert(activity)
      .select()
      .single()
    if (actData) activities.value.unshift(actData as OrderActivity)
  }

  const getMessagesForOrder = (orderId: string) =>
    messages.value
      .filter((m) => m.order_id === orderId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))

  const rescheduleOrder = async (id: string, newTime: string, actorName: string) => {
    const order = orders.value.find((o) => o.id === id)
    if (!order) return
    order.pickup_time = newTime
    await supabase.from('orders').update({ pickup_time: newTime }).eq('id', id)

    const activity = {
      order_id: id,
      type: 'status',
      title: 'Pickup rescheduled',
      detail: `${actorName} moved pickup for ${id} to ${newTime}.`,
      actor_role: 'customer' as UserRole,
      actor_name: actorName,
    } as Omit<OrderActivity, 'id' | 'created_at'>

    const { data: actData } = await supabase
      .from('order_activities')
      .insert(activity)
      .select()
      .single()
    if (actData) activities.value.unshift(actData as OrderActivity)
  }

  const cancelOrder = (id: string, actorName: string, actor: UserRole = 'customer') =>
    updateOrderStatus(id, 'cancelled', actor, actorName)

  const getFlowStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1
    return ORDER_FLOW.indexOf(status)
  }

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    const index = ORDER_FLOW.indexOf(status)
    if (index === -1 || index === ORDER_FLOW.length - 1) return null
    return ORDER_FLOW[index + 1] ?? null
  }

  const createOrder = async (payload: {
    provider_id: string
    pickup_date: string
    pickup_time: string
    pickup_address: string
    notes?: string
    total_estimate: string
    services: Array<{ title: string; price: string; description: string }>
  }) => {
    if (!profile.value) return null

    const id = `EF-${Date.now().toString().slice(-4)}`

    const orderRow = {
      id,
      customer_id: profile.value.id,
      provider_id: payload.provider_id,
      status: 'pending' as OrderStatus,
      pickup_date: payload.pickup_date,
      pickup_time: payload.pickup_time,
      pickup_address: payload.pickup_address,
      notes: payload.notes ?? '',
      total_estimate: payload.total_estimate,
    }

    const { error: orderError } = await supabase.from('orders').insert(orderRow)
    if (orderError) return null

    // Insert line items
    if (payload.services.length > 0) {
      await supabase.from('order_services').insert(
        payload.services.map((s) => ({ order_id: id, ...s }))
      )
    }

    // Fetch provider name for activity
    const { data: providerData } = await supabase
      .from('providers')
      .select('name')
      .eq('id', payload.provider_id)
      .single()

    const providerName = (providerData as { name: string } | null)?.name ?? 'Provider'

    // Log activity
    const activity = {
      order_id: id,
      type: 'booking',
      title: 'New order placed',
      detail: `${profile.value.full_name} booked ${payload.services.map((s) => s.title).join(', ')} with ${providerName}.`,
      actor_role: 'customer' as UserRole,
      actor_name: profile.value.full_name,
    } as Omit<OrderActivity, 'id' | 'created_at'>

    await supabase.from('order_activities').insert(activity)

    // Refresh orders
    await fetchOrders()
    await fetchActivities()

    return id
  }

  // ── Computed stats ────────────────────────────────────────
  const recentActivities = computed(() =>
    [...activities.value].sort((a, b) => b.created_at.localeCompare(a.created_at))
  )

  const adminStats = computed(() => {
    const uniqueProviders = new Set(orders.value.map((o) => o.provider_id)).size
    const uniqueCustomers = new Set(orders.value.map((o) => o.customer_id)).size
    return {
      totalOrders: orders.value.length,
      activeOrders: orders.value.filter((o) =>
        ['pending', 'washing', 'ready'].includes(o.status)
      ).length,
      pending: orders.value.filter((o) => o.status === 'pending').length,
      delivered: orders.value.filter((o) => o.status === 'delivered').length,
      cancelled: orders.value.filter((o) => o.status === 'cancelled').length,
      messageCount: messages.value.length,
      totalProviders: uniqueProviders,
      totalCustomers: uniqueCustomers,
    }
  })

  const customerStats = computed(() => ({
    active: orders.value.filter((o) =>
      ['pending', 'washing', 'ready'].includes(o.status)
    ).length,
    ready: orders.value.filter((o) => o.status === 'ready').length,
    completed: orders.value.filter((o) => o.status === 'delivered').length,
    pending: orders.value.filter((o) => o.status === 'pending').length,
  }))

  const providerStats = computed(() => ({
    incoming: orders.value.filter((o) => o.status === 'pending').length,
    washing: orders.value.filter((o) => o.status === 'washing').length,
    ready: orders.value.filter((o) => o.status === 'ready').length,
    delivered: orders.value.filter((o) => o.status === 'delivered').length,
  }))

  const providerIncomingOrders = computed(() =>
    orders.value.filter((o) => ['pending', 'washing', 'ready'].includes(o.status))
  )

  return {
    orders,
    activities,
    messages,
    loaded,
    statusLabels: STATUS_LABELS,
    orderFlow: ORDER_FLOW,
    loadAll,
    resetPlatformData,
    fetchOrders,
    fetchActivities,
    fetchMessages,
    getOrderById,
    updateOrderStatus,
    addMessage,
    getMessagesForOrder,
    rescheduleOrder,
    cancelOrder,
    getFlowStepIndex,
    getNextStatus,
    createOrder,
    recentActivities,
    adminStats,
    customerStats,
    providerStats,
    providerIncomingOrders,
  }
}
