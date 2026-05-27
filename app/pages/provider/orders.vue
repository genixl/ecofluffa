<template>
  <div>
    <SectionHeader title="Incoming Orders" subtitle="Status changes notify customer and admin automatically" />

    <div class="flex flex-wrap gap-3 mb-6">
      <AppButton
        v-for="s in filterStatuses"
        :key="s"
        :label="s === 'all' ? 'All' : statusLabels[s]"
        :variant="s === activeFilter ? 'primary' : 'outline'"
        type="button"
        @click="activeFilter = s"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <OrderCard
        v-for="o in filteredOrders"
        :key="o.id"
        :orderId="o.id"
        :provider="o.provider"
        :status="o.status"
        :date="o.pickupDate"
        role="provider"
        :customer-name="o.customerName"
        :pickup-address="o.pickupAddress"
        :to="`/provider/order/${o.id}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProviderOrders } from "~/composables/useProviderOrders";
import type { ProviderOrderStatus } from "~/data/platform";

const { orders, statusLabels } = useProviderOrders();

const filterStatuses = ["all", "pending", "washing", "ready", "delivered", "cancelled"] as const;
type FilterStatus = (typeof filterStatuses)[number];

const activeFilter = ref<FilterStatus>("all");

const filteredOrders = computed(() => {
  if (activeFilter.value === "all") return orders.value;
  return orders.value.filter((o) => o.status === activeFilter.value);
});

definePageMeta({ layout: "dashboard" });
</script>
