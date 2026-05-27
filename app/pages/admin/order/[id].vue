<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
      <div>
        <div class="text-brand-blue font-bold text-3xl">Order {{ order.id }}</div>
        <div class="text-brand-charcoal mt-2">
          {{ order.customerName }} → {{ order.provider }}
        </div>
        <div class="text-sm text-gray-500 mt-1">
          Pickup {{ order.pickupDate }} at {{ order.pickupTime }} · {{ order.pickupAddress }}
        </div>
      </div>
      <OrderStatusBadge :status="order.status" />
    </div>

    <div class="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
      <div class="text-sm font-semibold text-amber-900 mb-3">Admin override status</div>
      <div class="flex flex-wrap gap-2">
        <AppButton
          v-for="s in statusOptions"
          :key="s"
          :label="statusLabels[s]"
          variant="outline"
          type="button"
          @click="overrideStatus(s)"
        />
      </div>
    </div>

    <div class="mt-8">
      <OrderFlowTimeline :status="order.status" :current-index="flowIndex" />
    </div>

    <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OrderMessagesPanel
        :order-id="order.id"
        current-role="admin"
        sender-name="Ecofluffa Admin"
        other-party-label="customer & provider"
      />
      <div>
        <SectionHeader title="Order activity" subtitle="Full audit trail" />
        <ActivityFeed
          :items="orderActivities"
          order-link-prefix="/admin/order"
        />
      </div>
    </div>

    <div class="mt-8">
      <NuxtLink to="/admin/orders" class="text-brand-blue font-semibold text-sm hover:underline">
        ← Back to all orders
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminPlatform } from "~/composables/useAdminPlatform";
import { usePlatform } from "~/composables/usePlatform";
import type { ProviderOrderStatus } from "~/data/platform";

const route = useRoute();
const { getOrderById, updateOrderStatus, statusLabels, getFlowStepIndex } =
  useAdminPlatform();
const { recentActivities } = usePlatform();

const routeId = computed(() => String(route.params.id ?? ""));

const statusOptions: ProviderOrderStatus[] = [
  "pending",
  "washing",
  "ready",
  "delivered",
  "cancelled",
];

const order = computed(() => {
  const existing = getOrderById(routeId.value);
  return (
    existing ?? {
      id: routeId.value,
      provider: "—",
      customerName: "—",
      customerPhone: "",
      providerPhone: "",
      status: "pending" as ProviderOrderStatus,
      pickupDate: "—",
      pickupTime: "—",
      pickupAddress: "—",
      totalEstimate: "—",
      services: [],
    }
  );
});

const flowIndex = computed(() => getFlowStepIndex(order.value.status));

const orderActivities = computed(() =>
  recentActivities.value.filter((a) => a.orderId === order.value.id),
);

const overrideStatus = (status: ProviderOrderStatus) => {
  updateOrderStatus(order.value.id, status);
};

definePageMeta({ layout: "dashboard" });
</script>
