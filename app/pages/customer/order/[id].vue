<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
      <div>
        <div class="text-brand-blue font-bold text-3xl">
          Order {{ order.id }}
        </div>
        <div class="text-brand-charcoal mt-2">
          Provider: <span class="font-semibold">{{ order.provider }}</span>
        </div>
        <div class="text-brand-charcoal text-sm mt-1">
          Pickup: {{ order.pickupDate }} at {{ order.pickupTime }}
        </div>
        <div class="text-brand-orange font-semibold text-sm mt-2">
          Estimated total: {{ order.totalEstimate }}
        </div>
      </div>
      <OrderStatusBadge :status="order.status" />
    </div>

    <div class="mt-8">
      <OrderFlowTimeline
        :status="order.status"
        :current-index="flowIndex"
      />
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div class="text-xs font-semibold text-gray-500 mb-1">Pickup Address</div>
        <div class="text-brand-charcoal">{{ order.pickupAddress }}</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div class="text-xs font-semibold text-gray-500 mb-1">Contact Provider</div>
        <div class="text-brand-charcoal text-sm">{{ order.providerPhone }}</div>
        <div class="mt-3 flex gap-2">
          <AppButton label="Call" variant="outline" type="button" />
          <AppButton label="Message" variant="outline" type="button" />
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div class="text-xs font-semibold text-gray-500 mb-1">Manage Order</div>
        <div class="flex flex-col gap-2">
          <AppButton
            label="Cancel Order"
            variant="outline"
            type="button"
            :disabled="order.status !== 'pending'"
            @click="onCancel"
          />
          <AppButton
            label="Reschedule Pickup"
            variant="outline"
            type="button"
            :disabled="order.status === 'delivered' || order.status === 'cancelled'"
            @click="onReschedule"
          />
        </div>
        <div v-if="rescheduleNote" class="text-xs text-brand-blue mt-2">
          {{ rescheduleNote }}
        </div>
        <div class="text-xs text-gray-500 mt-2">
          Cancellation is available while the order is still pending.
        </div>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OrderMessagesPanel
        :order-id="order.id"
        current-role="customer"
        sender-name="Lara Cheruiyot"
        :other-party-label="order.provider"
      />
      <div>
        <SectionHeader title="Live activity" subtitle=" Track your Activity" />
        <ActivityFeed
          :items="orderActivities"
          order-link-prefix="/customer/order"
        />
      </div>
    </div>

    <div class="mt-8">
      <SectionHeader title="Status Updates" subtitle="What has happened so far" />
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div
          v-for="(event, idx) in statusEvents"
          :key="idx"
          class="p-4 flex gap-4"
        >
          <div
            class="w-2 h-2 rounded-full mt-2 shrink-0"
            :class="event.done ? 'bg-brand-blue' : 'bg-gray-300'"
          />
          <div>
            <div class="text-sm font-semibold text-brand-charcoal">
              {{ event.title }}
            </div>
            <div class="text-xs text-gray-500 mt-0.5">
              {{ event.time }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <SectionHeader title="Services" subtitle="What you requested" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceCard
          v-for="s in order.services"
          :key="s.title"
          :title="s.title"
          :price="s.price"
          :description="s.description"
        />
      </div>
    </div>

    <div class="mt-8">
      <NuxtLink
        to="/customer/orders"
        class="text-brand-blue font-semibold text-sm hover:underline"
      >
        ← Back to all orders
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCustomerOrders } from "~/composables/useCustomerOrders";
import { usePlatform } from "~/composables/usePlatform";
import type { ProviderOrderStatus } from "~/data/platform";

const route = useRoute();
const {
  getOrderById,
  getFlowStepIndex,
  cancelOrder,
  rescheduleOrder,
} = useCustomerOrders();
const { recentActivities } = usePlatform();

const rescheduleNote = ref("");

const routeId = computed(() => String(route.params.id ?? ""));

const order = computed(() => {
  const existing = getOrderById(routeId.value);
  return (
    existing ?? {
      id: routeId.value || "EF-0000",
      provider: "Selected Laundry Provider",
      status: "pending" as ProviderOrderStatus,
      pickupDate: "2026-05-29",
      pickupTime: "09:15",
      pickupAddress: "Nairobi",
      providerPhone: "+254 700 000 000",
      totalEstimate: "KSh 0",
      services: [],
    }
  );
});

const flowIndex = computed(() => getFlowStepIndex(order.value.status));

const orderActivities = computed(() =>
  recentActivities.value.filter((a) => a.orderId === order.value.id),
);

const statusEvents = computed(() => {
  const idx = flowIndex.value;
  const base = [
    { title: "Order placed", time: `${order.value.pickupDate} · Booking confirmed`, done: true },
    { title: "Provider accepted", time: "Pickup scheduled", done: idx >= 1 },
    { title: "Laundry in progress", time: "Your items are being washed", done: idx >= 1 },
    { title: "Ready for delivery", time: "Clean clothes packed and ready", done: idx >= 2 },
    { title: "Delivered", time: "Handed back to you", done: idx >= 3 },
  ];
  if (order.value.status === "cancelled") {
    return [
      { title: "Order placed", time: order.value.pickupDate, done: true },
      { title: "Order cancelled", time: "This order will not be processed", done: true },
    ];
  }
  return base;
});

const onCancel = () => {
  cancelOrder(order.value.id);
  rescheduleNote.value = "";
};

const onReschedule = () => {
  rescheduleOrder(order.value.id, "16:00");
  rescheduleNote.value = "Pickup rescheduled to 16:00 (demo).";
};

definePageMeta({ layout: "dashboard" });
</script>
