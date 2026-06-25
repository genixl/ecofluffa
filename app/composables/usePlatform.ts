import type {
  Order,
  OrderActivity,
  OrderMessage,
  OrderStatus,
  Rating,
  UserRole,
} from '~/types/supabase'
import { ORDER_FLOW, STATUS_LABELS } from '~/types/supabase'

// Status-change messages shown to the provider when the customer/admin moves an order
const PROVIDER_STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  cancelled: 'was cancelled by the customer',
  delivered: 'has been marked as delivered',
  washing: 'is now being washed',
  ready: 'is ready for pickup',
  pending: 'is waiting for your acceptance',
}


let _realtimeChannel: any = null

export function usePlatform() {
  const supabase = useSupabaseClient()
  const { profile } = useAuth()


  const orders = useState<Order[]>('platform-orders', () => [])
  const activities = useState<OrderActivity[]>('platform-activities', () => [])
  const messages = useState<OrderMessage[]>('platform-messages', () => [])
  const ratings = useState<Rating[]>('platform-ratings', () => [])
  const loaded = useState<boolean>('platform-loaded', () => false)


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
    if (error) console.warn('[fetchOrders]', error.message)
    if (!error && data) orders.value = data as Order[]
  }

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('order_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) console.warn('[fetchActivities]', error.message)
    if (!error && data) activities.value = data as OrderActivity[]
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) console.warn('[fetchMessages]', error.message)
    if (!error && data) messages.value = data as OrderMessage[]
  }

  const fetchRatings = async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
    if (error) console.warn('[fetchRatings]', error.message)
    if (!error && data) ratings.value = data as Rating[]
  }

  const loadAll = async (force = false) => {
    if (loaded.value && !force) return
    if (force) loaded.value = false
    await Promise.all([fetchOrders(), fetchActivities(), fetchMessages(), fetchRatings()])
    loaded.value = true
    subscribeToRealtime()
  }


  const subscribeToRealtime = () => {
    if (_realtimeChannel) return

    const currentRole = profile.value?.role ?? null
    const currentProviderId = profile.value?.provider_id ?? null

    _realtimeChannel = supabase
      .channel('platform-orders-realtime')

      // ── New order placed (INSERT) ──────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const newOrder = payload.new as {
            id: string
            provider_id: string
            customer_id: string
            status: string
          }

          // Add the new order into local state (full re-fetch to get relations)
          const existing = orders.value.some((o) => o.id === newOrder.id)
          if (!existing) {
            await fetchOrders()
          }

          const { show } = useToast()
          const { notify } = useWebNotifications()
          const { addNotification } = useInAppNotifications()
          const orderId = newOrder.id

          // Notify the provider whose order this belongs to
          if (currentRole === 'provider' && currentProviderId === newOrder.provider_id) {
            const msg = `New order ${orderId} has been placed and is awaiting your acceptance`
            show(msg, 'info', 6000)
            notify('EcoFluffa – New Order Received', { body: msg, tag: `new-order-${orderId}` })
            addNotification({
              type: 'order_update',
              title: '🛒 New Order Received',
              body: msg,
              orderId,
              role: 'provider',
              createdAt: new Date().toISOString(),
            })
          }

          // Notify admin of every new order
          if (currentRole === 'admin') {
            const msg = `New order ${orderId} has been placed`
            show(msg, 'info', 4000)
            notify('EcoFluffa – New Order', { body: msg, tag: `new-order-${orderId}` })
            addNotification({
              type: 'order_update',
              title: '🛒 New Order Placed',
              body: msg,
              orderId,
              role: 'admin',
              createdAt: new Date().toISOString(),
            })
          }
        }
      )

      // ── Order status updated (UPDATE) ──────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as {
            id: string
            status: string
            provider_id: string
            pickup_time: string
            pickup_address: string
          }
          const old = payload.old as { status?: string }

          const idx = orders.value.findIndex((o) => o.id === updated.id)
          if (idx !== -1) {
            orders.value[idx] = { ...orders.value[idx], ...updated }
          }

          const newStatus = updated.status as OrderStatus
          const oldStatus = old?.status as OrderStatus | undefined
          if (!oldStatus || newStatus === oldStatus) return

          const { show } = useToast()
          const { notify } = useWebNotifications()
          const { addNotification } = useInAppNotifications()
          const label = STATUS_LABELS[newStatus] ?? newStatus
          const orderId = updated.id

          // ── Customer: notify on any status change ──────────────────────────
          if (currentRole === 'customer') {
            const toastType =
              newStatus === 'cancelled' ? 'warning'
              : newStatus === 'delivered' ? 'success'
              : 'info'
            const statusEmoji =
              newStatus === 'cancelled' ? '❌'
              : newStatus === 'delivered' ? '✅'
              : newStatus === 'ready' ? '📦'
              : newStatus === 'washing' ? '🧺'
              : '🔔'
            const msg = `Order ${orderId} is now ${label}`
            show(msg, toastType, 5000)
            notify('EcoFluffa – Order Update', { body: msg, tag: `order-status-${orderId}` })
            addNotification({
              type: 'order_update',
              title: `${statusEmoji} Order Status: ${label}`,
              body: msg,
              orderId,
              role: 'customer',
              createdAt: new Date().toISOString(),
            })
          }

          // ── Provider: notify on every relevant status change ───────────────
          else if (currentRole === 'provider' && currentProviderId === updated.provider_id) {
            const statusDetail = PROVIDER_STATUS_MESSAGES[newStatus]
            if (statusDetail) {
              const toastType = newStatus === 'cancelled' ? 'warning' : newStatus === 'delivered' ? 'success' : 'info'
              const statusEmoji =
                newStatus === 'cancelled' ? '❌'
                : newStatus === 'delivered' ? '✅'
                : newStatus === 'ready' ? '📦'
                : newStatus === 'washing' ? '🧺'
                : newStatus === 'pending' ? '🛒'
                : '🔔'
              const msg = `Order ${orderId} ${statusDetail}`
              show(msg, toastType, 5000)
              notify(`EcoFluffa – Order ${label}`, { body: msg, tag: `order-status-${orderId}` })
              addNotification({
                type: 'order_update',
                title: `${statusEmoji} Order ${label}`,
                body: msg,
                orderId,
                role: 'provider',
                createdAt: new Date().toISOString(),
              })
            }
          }

          // ── Admin: notify on every status change ───────────────────────────
          else if (currentRole === 'admin') {
            const msg = `Order ${orderId}: ${STATUS_LABELS[oldStatus] ?? oldStatus} → ${label}`
            show(msg, 'info', 4000)
            notify('EcoFluffa – Status Change', { body: msg, tag: `order-status-${orderId}` })
            addNotification({
              type: 'order_update',
              title: '🔄 Order Status Changed',
              body: msg,
              orderId,
              role: 'admin',
              createdAt: new Date().toISOString(),
            })
          }
        }
      )

      // ── New message received (INSERT) ──────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_messages' },
        (payload) => {
          const msg = payload.new as OrderMessage

          // skip if realtime already pushed this message
          const exists = messages.value.some((m) => m.id === msg.id)
          if (!exists) {
            messages.value.push(msg)
          }

          // ignore messages sent by the current user
          if (!currentRole || msg.from_role === currentRole) return

          const { show } = useToast()
          const { notify } = useWebNotifications()
          const { addNotification } = useInAppNotifications()
          const preview = msg.body.length > 60 ? msg.body.slice(0, 60) + '...' : msg.body
          const senderLabel = msg.from_role.charAt(0).toUpperCase() + msg.from_role.slice(1)
          const toastMsg = `New message from ${senderLabel} (Order ${msg.order_id}): "${preview}"`
          show(toastMsg, 'info', 6000)
          notify(`EcoFluffa – New message from ${senderLabel}`, {
            body: `Order ${msg.order_id}: "${preview}"`,
            tag: `message-${msg.order_id}`,
          })
          addNotification({
            type: 'new_message',
            title: `💬 New message from ${senderLabel}`,
            body: `Order ${msg.order_id}: "${preview}"`,
            orderId: msg.order_id,
            role: currentRole as 'customer' | 'provider' | 'admin',
            createdAt: new Date().toISOString(),
          })
        }
      )
      .subscribe()
  }

  const unsubscribeRealtime = () => {
    if (_realtimeChannel) {
      supabase.removeChannel(_realtimeChannel)
      _realtimeChannel = null
    }
  }

  const resetPlatformData = () => {
    unsubscribeRealtime()
    orders.value = []
    activities.value = []
    messages.value = []
    ratings.value = []
    loaded.value = false
  }


  const getRatingForOrder = (orderId: string): Rating | null =>
    ratings.value.find((r) => r.order_id === orderId) ?? null

  const submitRating = async (
    orderId: string,
    providerId: string,
    score: number,
    comment: string
  ): Promise<boolean> => {
    if (!profile.value) return false
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        order_id: orderId,
        provider_id: providerId,
        customer_id: profile.value.id,
        score,
        comment,
      })
      .select()
      .single()
    if (error) return false
    if (data) ratings.value.push(data as Rating)
    // update the cached provider rating so the UI reflects the new score
    await supabase
      .from('providers')
      .select('id, rating, review_count')
      .eq('id', providerId)
      .single()
      .then(({ data: p }) => {
        if (p) {
          const po = orders.value.find((o) => o.provider_id === providerId)
          if (po?.provider) {
            po.provider.rating = (p as { rating: number }).rating
            po.provider.review_count = (p as { review_count: number }).review_count
          }
        }
      })
    return true
  }


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


    order.status = status


    await supabase.from('orders').update({ status }).eq('id', id)


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

    // push a temporary message so the UI updates immediately
    const tempId = `temp-${Date.now()}`
    const optimistic: OrderMessage = {
      id: tempId,
      order_id: orderId,
      from_role: fromRole,
      sender_name: senderName,
      body: trimmed,
      created_at: new Date().toISOString(),
    }
    messages.value.push(optimistic)


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

    if (msgData) {
      const real = msgData as OrderMessage
      const tempIdx = messages.value.findIndex((m) => m.id === tempId)
      const realAlreadyPushed = messages.value.some((m) => m.id === real.id)

      if (realAlreadyPushed && tempIdx !== -1) {
        // realtime already added the real record, drop the temp
        messages.value.splice(tempIdx, 1)
      } else if (tempIdx !== -1) {
        // swap the temp out for the real DB record
        messages.value[tempIdx] = real
      } else {

        messages.value.push(real)
      }
    }


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


    if (payload.services.length > 0) {
      await supabase.from('order_services').insert(
        payload.services.map((s) => ({ order_id: id, ...s }))
      )
    }


    const { data: providerData } = await supabase
      .from('providers')
      .select('name')
      .eq('id', payload.provider_id)
      .single()

    const providerName = (providerData as { name: string } | null)?.name ?? 'Provider'


    const activity = {
      order_id: id,
      type: 'booking',
      title: 'New order placed',
      detail: `${profile.value.full_name} booked ${payload.services.map((s) => s.title).join(', ')} with ${providerName}.`,
      actor_role: 'customer' as UserRole,
      actor_name: profile.value.full_name,
    } as Omit<OrderActivity, 'id' | 'created_at'>

    await supabase.from('order_activities').insert(activity)

    await fetchOrders()
    await fetchActivities()

    // ── Customer confirmation notification ────────────────────────────────────
    const { addNotification } = useInAppNotifications()
    const { show } = useToast()
    const { notify } = useWebNotifications()
    const confirmMsg = `Your order ${id} with ${providerName} has been placed successfully! We'll notify you when it's accepted.`
    show(`Order ${id} placed! Awaiting provider acceptance.`, 'success', 6000)
    notify('EcoFluffa – Order Placed', { body: confirmMsg, tag: `order-placed-${id}` })
    addNotification({
      type: 'order_update',
      title: '🎉 Order Placed Successfully',
      body: confirmMsg,
      orderId: id,
      role: 'customer',
      createdAt: new Date().toISOString(),
    })

    return id
  }


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
    ratings,
    loaded,
    statusLabels: STATUS_LABELS,
    orderFlow: ORDER_FLOW,
    loadAll,
    resetPlatformData,
    fetchOrders,
    fetchActivities,
    fetchMessages,
    fetchRatings,
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
    getRatingForOrder,
    submitRating,
  }
}
