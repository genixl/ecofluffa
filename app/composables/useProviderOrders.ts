import type { OrderStatus } from '~/types/supabase'

export function useProviderOrders() {
  const { profile, userName } = useAuth()
  const platform = usePlatform()

  // Provider-scoped orders
  const orders = computed(() =>
    platform.orders.value.filter((o) => o.provider_id === profile.value?.provider_id)
  )

  const stats = computed(() => ({
    incoming: orders.value.filter((o) => o.status === 'pending').length,
    washing: orders.value.filter((o) => o.status === 'washing').length,
    ready: orders.value.filter((o) => o.status === 'ready').length,
    delivered: orders.value.filter((o) => o.status === 'delivered').length,
  }))

  const incomingOrders = computed(() =>
    orders.value.filter((o) => ['pending', 'washing', 'ready'].includes(o.status))
  )

  const getOrderById = (id: string) =>
    orders.value.find((o) => o.id.toLowerCase() === id.toLowerCase()) ?? null

  const updateOrderStatus = (id: string, status: OrderStatus) =>
    platform.updateOrderStatus(id, status, 'provider', userName.value)

  const recentActivities = computed(() =>
    platform.recentActivities.value.filter((a) =>
      orders.value.some((o) => o.id === a.order_id)
    )
  )

  return {
    orders,
    stats,
    incomingOrders,
    statusLabels: platform.statusLabels,
    orderFlow: platform.orderFlow,
    getOrderById,
    updateOrderStatus,
    getNextStatus: platform.getNextStatus,
    getFlowStepIndex: platform.getFlowStepIndex,
    recentActivities,
    addMessage: platform.addMessage,
    getMessagesForOrder: platform.getMessagesForOrder,
    loadAll: platform.loadAll,
  }
}
