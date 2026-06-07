import type { OrderStatus } from '~/types/supabase'

export function useAdminPlatform() {
  const platform = usePlatform()

  const updateOrderStatus = (id: string, status: OrderStatus) =>
    platform.updateOrderStatus(id, status, 'admin', 'Ecofluffa Admin')

  return {
    orders: platform.orders,
    adminStats: platform.adminStats,
    recentActivities: platform.recentActivities,
    getOrderById: platform.getOrderById,
    updateOrderStatus,
    getMessagesForOrder: platform.getMessagesForOrder,
    addMessage: platform.addMessage,
    statusLabels: platform.statusLabels,
    getFlowStepIndex: platform.getFlowStepIndex,
    loadAll: platform.loadAll,
  }
}
