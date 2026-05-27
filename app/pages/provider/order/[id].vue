<template>
  <div>
    <div class="flex items-start justify-between gap-6">
      <div>
        <div class="text-brand-blue font-bold text-3xl">
          Order {{ order.id }}
        </div>
        <div class="text-brand-charcoal mt-2">
          Customer Pickup: {{ order.pickupDate }} at {{ order.pickupTime }}
        </div>
        <div class="text-brand-charcoal text-sm mt-1">
          Customer: {{ order.customerName }}
        </div>
      </div>
      <OrderStatusBadge :status="order.status" />
    </div>

    <div class="mt-8">
      <SectionHeader title="Customer Details" subtitle="Where to pick up and drop off" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-500 mb-1">Pickup Address</div>
          <div class="text-brand-charcoal">{{ order.pickupAddress }}</div>
          <a
            :href="mapsUrl"
            target="_blank"
            rel="noopener"
            class="mt-3 inline-block text-sm text-brand-blue font-semibold hover:underline"
          >
            View on Maps
          </a>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-500 mb-1">Customer Contact</div>
          <div class="text-brand-charcoal">{{ order.customerPhone }}</div>
          <div class="text-gray-500 text-xs mt-1">
            Call or text to confirm pickup time.
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-500 mb-1">Notes</div>
          <div class="text-brand-charcoal text-sm">
            {{ order.notes || "No special instructions provided." }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <SectionHeader title="Manage Order" subtitle="Update the status as you process the laundry" />
      <div class="flex flex-wrap gap-3">
        <AppButton
          label="Accept Order"
          variant="primary"
          type="button"
          @click="setStatus('washing')"
        />
        <AppButton
          label="Mark Ready"
          variant="outline"
          type="button"
          @click="setStatus('ready')"
        />
        <AppButton
          label="Mark Delivered"
          variant="outline"
          type="button"
          @click="setStatus('delivered')"
        />
        <AppButton
          label="Cancel Order"
          variant="outline"
          type="button"
          @click="setStatus('cancelled')"
        />
      </div>
      <div class="mt-4 text-xs text-gray-500">
        These actions only update the status in this demo UI.
      </div>
    </div>

    <div class="mt-8">
      <OrderFlowTimeline
        :status="order.status"
        :current-index="currentFlowIndex"
      />
    </div>

    <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OrderMessagesPanel
        :order-id="order.id"
        current-role="provider"
        sender-name="Ocean Breeze Laundry"
        other-party-label="customer"
      />
      <div>
        <SectionHeader title="Platform activity" subtitle="Visible to customer & admin" />
        <ActivityFeed
          :items="orderActivities"
          order-link-prefix="/provider/order"
        />
      </div>
    </div>

    <div class="mt-8">
      <SectionHeader title="Services" subtitle="What needs processing" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceCard
          v-for="srv in order.services"
          :key="srv.title"
          :title="srv.title"
          :price="srv.price"
          :description="srv.description"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useProviderOrders } from "~/composables/useProviderOrders";
import { usePlatform } from "~/composables/usePlatform";
import type { ProviderOrderStatus } from "~/data/platform";

const route = useRoute();
const { getOrderById, updateOrderStatus, getFlowStepIndex } = useProviderOrders();
const { recentActivities } = usePlatform();

const routeId = computed(() => String(route.params.id ?? ""));

const order = computed(() => {
  const existing = getOrderById(routeId.value);
  return (
    existing ?? {
      id: routeId.value || "EF-0000",
      provider: "Ocean Breeze Laundry",
      customerName: "Selected Customer",
      status: "pending" as ProviderOrderStatus,
      pickupDate: "2026-05-29",
      pickupTime: "09:15",
      pickupAddress: "Nairobi",
      customerPhone: "+254 700 000 000",
      totalEstimate: "KSh 0",
      services: [],
    }
  );
});

const orderActivities = computed(() =>
  recentActivities.value.filter((a) => a.orderId === order.value.id),
);

const setStatus = (next: ProviderOrderStatus) => {
  updateOrderStatus(order.value.id, next);
};

const currentFlowIndex = computed(() => getFlowStepIndex(order.value.status));

const mapsUrl = computed(() => {
  const encoded = encodeURIComponent(order.value.pickupAddress);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
});

definePageMeta({ layout: "dashboard" });
</script>

