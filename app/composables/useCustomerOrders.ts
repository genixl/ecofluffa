import { usePlatform } from "~/composables/usePlatform";
import type { ProviderOrderStatus } from "~/data/platform";

/** Customer-facing orders — backed by shared platform store */
export function useCustomerOrders() {
  const platform = usePlatform();

  const orders = computed(() => platform.orders.value);

  const stats = platform.customerStats;

  const getOrderById = platform.getOrderById;

  const updateOrderStatus = (id: string, status: ProviderOrderStatus) =>
    platform.updateOrderStatus(id, status, "customer", "Lara Cheruiyot");

  const getFlowStepIndex = platform.getFlowStepIndex;

  const cancelOrder = (id: string) =>
    platform.cancelOrder(id, "Lara Cheruiyot", "customer");

  const rescheduleOrder = (id: string, newTime: string) =>
    platform.rescheduleOrder(id, newTime, "Lara Cheruiyot");

  return {
    orders,
    stats,
    statusLabels: platform.statusLabels,
    getOrderById,
    updateOrderStatus,
    getFlowStepIndex,
    cancelOrder,
    rescheduleOrder,
    recentActivities: platform.recentActivities,
    addMessage: platform.addMessage,
    getMessagesForOrder: platform.getMessagesForOrder,
  };
}
