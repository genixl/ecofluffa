import { usePlatform } from "~/composables/usePlatform";
import type { ProviderOrderStatus } from "~/data/platform";

export function useAdminPlatform() {
  const platform = usePlatform();

  const updateOrderStatus = (id: string, status: ProviderOrderStatus) =>
    platform.updateOrderStatus(id, status, "admin", "Ecofluffa Admin");

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
  };
}
