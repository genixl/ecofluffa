import {
  PLATFORM_ACTIVITIES,
  PLATFORM_MESSAGES,
  PLATFORM_ORDERS,
  PROVIDER_ORDER_FLOW,
  PROVIDER_STATUS_LABELS,
  type PlatformActivity,
  type PlatformMessage,
  type PlatformOrder,
  type PlatformRole,
  type ProviderOrderStatus,
} from "~/data/platform";

let activityIdCounter = PLATFORM_ACTIVITIES.length + 1;
let messageIdCounter = PLATFORM_MESSAGES.length + 1;

const nowIso = () => new Date().toISOString();

export function usePlatform() {
  const orders = useState<PlatformOrder[]>("platform-orders", () =>
    structuredClone(PLATFORM_ORDERS),
  );
  const activities = useState<PlatformActivity[]>("platform-activities", () =>
    structuredClone(PLATFORM_ACTIVITIES),
  );
  const messages = useState<PlatformMessage[]>("platform-messages", () =>
    structuredClone(PLATFORM_MESSAGES),
  );

  const logActivity = (
    payload: Omit<PlatformActivity, "id" | "at"> & { at?: string },
  ) => {
    activities.value.unshift({
      ...payload,
      id: `a${activityIdCounter++}`,
      at: payload.at ?? nowIso(),
    });
  };

  const getOrderById = (id: string) =>
    orders.value.find((o) => o.id.toLowerCase() === id.toLowerCase());

  const updateOrderStatus = (
    id: string,
    status: ProviderOrderStatus,
    actor: PlatformRole,
    actorName: string,
  ) => {
    const order = orders.value.find((o) => o.id === id);
    if (!order) return;
    const prev = order.status;
    if (prev === status) return;
    order.status = status;
    logActivity({
      orderId: id,
      type: status === "cancelled" ? "admin" : "status",
      title: `Status: ${PROVIDER_STATUS_LABELS[status]}`,
      detail: `${actorName} updated ${id} from ${PROVIDER_STATUS_LABELS[prev]} to ${PROVIDER_STATUS_LABELS[status]}.`,
      actor,
      actorName,
    });
  };

  const addMessage = (
    orderId: string,
    from: PlatformRole,
    senderName: string,
    body: string,
  ) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    messages.value.push({
      id: `m${messageIdCounter++}`,
      orderId,
      from,
      senderName,
      body: trimmed,
      at: nowIso(),
    });
    logActivity({
      orderId,
      type: "message",
      title: "New message",
      detail: `${senderName}: ${trimmed.slice(0, 80)}${trimmed.length > 80 ? "…" : ""}`,
      actor: from,
      actorName: senderName,
    });
  };

  const getMessagesForOrder = (orderId: string) =>
    messages.value
      .filter((m) => m.orderId === orderId)
      .sort((a, b) => a.at.localeCompare(b.at));

  const rescheduleOrder = (id: string, newTime: string, actorName: string) => {
    const order = orders.value.find((o) => o.id === id);
    if (!order) return;
    order.pickupTime = newTime;
    logActivity({
      orderId: id,
      type: "status",
      title: "Pickup rescheduled",
      detail: `${actorName} moved pickup for ${id} to ${newTime}.`,
      actor: "customer",
      actorName,
    });
  };

  const cancelOrder = (id: string, actorName: string, actor: PlatformRole = "customer") => {
    updateOrderStatus(id, "cancelled", actor, actorName);
  };

  const getFlowStepIndex = (status: ProviderOrderStatus) => {
    if (status === "cancelled") return -1;
    return PROVIDER_ORDER_FLOW.indexOf(status);
  };

  const getNextStatus = (status: ProviderOrderStatus): ProviderOrderStatus | null => {
    const index = PROVIDER_ORDER_FLOW.indexOf(status);
    if (index === -1 || index === PROVIDER_ORDER_FLOW.length - 1) return null;
    return PROVIDER_ORDER_FLOW[index + 1] ?? null;
  };

  const recentActivities = computed(() =>
    [...activities.value].sort((a, b) => b.at.localeCompare(a.at)),
  );

  const adminStats = computed(() => {
    const uniqueProviders = new Set(orders.value.map((o) => o.provider)).size;
    const uniqueCustomers = new Set(orders.value.map((o) => o.customerName)).size;

    return {
      totalOrders: orders.value.length,
      activeOrders: orders.value.filter((o) =>
        ["pending", "washing", "ready"].includes(o.status),
      ).length,
      pending: orders.value.filter((o) => o.status === "pending").length,
      delivered: orders.value.filter((o) => o.status === "delivered").length,
      cancelled: orders.value.filter((o) => o.status === "cancelled").length,
      messageCount: messages.value.length,
      totalProviders: uniqueProviders,
      totalCustomers: uniqueCustomers,
    };
  });

  const customerStats = computed(() => ({
    active: orders.value.filter((o) =>
      ["pending", "washing", "ready"].includes(o.status),
    ).length,
    ready: orders.value.filter((o) => o.status === "ready").length,
    completed: orders.value.filter((o) => o.status === "delivered").length,
    pending: orders.value.filter((o) => o.status === "pending").length,
  }));

  const providerStats = computed(() => ({
    incoming: orders.value.filter((o) => o.status === "pending").length,
    washing: orders.value.filter((o) => o.status === "washing").length,
    ready: orders.value.filter((o) => o.status === "ready").length,
    delivered: orders.value.filter((o) => o.status === "delivered").length,
  }));

  const providerIncomingOrders = computed(() =>
    orders.value.filter((o) => ["pending", "washing", "ready"].includes(o.status)),
  );

  const createOrder = (
    payload: Omit<PlatformOrder, "id" | "status"> & { id?: string },
  ) => {
    const id = payload.id ?? `EF-${Date.now().toString().slice(-4)}`;
    const order: PlatformOrder = {
      ...payload,
      id,
      status: "pending",
    };
    orders.value.unshift(order);
    logActivity({
      orderId: id,
      type: "booking",
      title: "New order placed",
      detail: `${order.customerName} booked ${order.services.map((s) => s.title).join(", ")} with ${order.provider}.`,
      actor: "customer",
      actorName: order.customerName,
    });
    addMessage(
      id,
      "provider",
      order.provider,
      `New order ${id} received. Pickup scheduled for ${order.pickupDate} at ${order.pickupTime}.`,
    );
    return id;
  };

  return {
    orders,
    activities,
    messages,
    statusLabels: PROVIDER_STATUS_LABELS,
    orderFlow: PROVIDER_ORDER_FLOW,
    getOrderById,
    updateOrderStatus,
    addMessage,
    getMessagesForOrder,
    rescheduleOrder,
    cancelOrder,
    getFlowStepIndex,
    getNextStatus,
    recentActivities,
    adminStats,
    customerStats,
    providerStats,
    providerIncomingOrders,
    createOrder,
  };
}
