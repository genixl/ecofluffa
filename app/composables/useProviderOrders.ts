import { usePlatform } from "~/composables/usePlatform";
import type { ProviderOrderStatus } from "~/data/platform";

/** Provider-facing orders — same shared platform store as customer & admin */
export function useProviderOrders() {
  const platform = usePlatform();

  const orders = computed(() => platform.orders.value);

  const stats = platform.providerStats;

  const incomingOrders = platform.providerIncomingOrders;

  const getOrderById = platform.getOrderById;

  const updateOrderStatus = (id: string, status: ProviderOrderStatus) =>
    platform.updateOrderStatus(id, status, "provider", "Ocean Breeze Laundry");

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
    recentActivities: platform.recentActivities,
    addMessage: platform.addMessage,
    getMessagesForOrder: platform.getMessagesForOrder,
  };
}
