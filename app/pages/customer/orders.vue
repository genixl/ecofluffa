<template>
  <div>
    <SectionHeader
      title="Your Orders"
      subtitle="Search, filter, and track every pickup in one place"
    />

    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Search orders"
          type="text"
          placeholder="Order ID, provider, or address"
          v-model="searchQuery"
        />
        <div>
          <label class="block text-brand-charcoal mb-3 font-semibold text-sm">
            Status
          </label>
          <select
            v-model="statusFilter"
            class="w-full border-2 border-gray-300 bg-brand-white text-brand-charcoal px-4 py-3 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all duration-200"
          >
            <option value="all">All statuses</option>
            <option v-for="s in statusOptions" :key="s" :value="s">
              {{ statusLabels[s] }}
            </option>
          </select>
        </div>
      </div>
      <div class="text-gray-500 text-sm mt-4">
        {{ filteredOrders.length }} order{{ filteredOrders.length === 1 ? "" : "s" }} found
      </div>
    </div>

    <div v-if="filteredOrders.length === 0" class="bg-white rounded-xl border border-gray-200 p-10 text-center">
      <div class="text-brand-charcoal font-semibold">No orders match your filters</div>
      <div class="text-gray-500 text-sm mt-2">Clear search or try a different status.</div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <OrderCard
        v-for="o in filteredOrders"
        :key="o.id"
        :orderId="o.id"
        :provider="o.provider"
        :status="o.status"
        :date="o.pickupDate"
        role="customer"
        :pickup-address="o.pickupAddress"
        :to="`/customer/order/${o.id}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCustomerOrders } from "~/composables/useCustomerOrders";
import type { ProviderOrderStatus } from "~/data/providerOrders";

const { orders, statusLabels } = useCustomerOrders();

const searchQuery = ref("");
const statusFilter = ref<string>("all");

const statusOptions: ProviderOrderStatus[] = [
  "pending",
  "washing",
  "ready",
  "delivered",
  "cancelled",
];

const filteredOrders = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return orders.value.filter((o) => {
    const matchesStatus =
      statusFilter.value === "all" || o.status === statusFilter.value;
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.provider.toLowerCase().includes(q) ||
      o.pickupAddress.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
});

definePageMeta({ layout: "dashboard" });
</script>
