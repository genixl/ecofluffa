import type { OrderStatus } from '~/types/supabase'

export function useCustomerOrders() {
  const supabase = useSupabaseClient()
  const { profile, userName } = useAuth()
  const platform = usePlatform()

  // Customer-scoped orders
  const orders = computed(() =>
    platform.orders.value.filter((o) => o.customer_id === profile.value?.id)
  )

  const stats = computed(() => ({
    active: orders.value.filter((o) =>
      ['pending', 'washing', 'ready'].includes(o.status)
    ).length,
    ready: orders.value.filter((o) => o.status === 'ready').length,
    completed: orders.value.filter((o) => o.status === 'delivered').length,
    pending: orders.value.filter((o) => o.status === 'pending').length,
  }))

  const getOrderById = (id: string) =>
    orders.value.find((o) => o.id.toLowerCase() === id.toLowerCase()) ?? null

  const updateOrderStatus = (id: string, status: OrderStatus) =>
    platform.updateOrderStatus(id, status, 'customer', userName.value)

  const cancelOrder = (id: string) =>
    platform.cancelOrder(id, userName.value, 'customer')

  const rescheduleOrder = (id: string, newTime: string) =>
    platform.rescheduleOrder(id, newTime, userName.value)

  const recentActivities = computed(() =>
    platform.recentActivities.value.filter((a) =>
      orders.value.some((o) => o.id === a.order_id)
    )
  )

  return {
    orders,
    stats,
    statusLabels: platform.statusLabels,
    getOrderById,
    updateOrderStatus,
    getFlowStepIndex: platform.getFlowStepIndex,
    cancelOrder,
    rescheduleOrder,
    confirmDelivery: platform.confirmDelivery,
    recentActivities,
    addMessage: platform.addMessage,
    getMessagesForOrder: platform.getMessagesForOrder,
    loadAll: platform.loadAll,
    getRatingForOrder: platform.getRatingForOrder,
    submitRating: platform.submitRating,
  }
}
