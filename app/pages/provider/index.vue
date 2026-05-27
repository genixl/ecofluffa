<template>
  <div>
    <SectionHeader
      title="Provider Dashboard"
      subtitle="Manage your orders, update service offerings, and track platform activity all in one place"
    />

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <CustomerStatCard label="Incoming" :value="stats.incoming" hint="Awaiting acceptance" />
      <CustomerStatCard label="Washing" :value="stats.washing" hint="In progress" />
      <CustomerStatCard label="Ready" :value="stats.ready" hint="Ready for delivery" />
      <CustomerStatCard label="Delivered" :value="stats.delivered" hint="Completed" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div class="lg:col-span-2">
        <SectionHeader title="Incoming Orders" subtitle="Tap to manage pickup, status & messages" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrderCard
            v-for="o in incomingOrders"
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
      <div>
        <SectionHeader title="Platform Activity" subtitle="Live updates from all roles" />
        <ActivityFeed
          :items="recentActivities.slice(0, 5)"
          order-link-prefix="/provider/order"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProviderOrders } from "~/composables/useProviderOrders";

const { stats, incomingOrders, recentActivities } = useProviderOrders();

definePageMeta({ layout: "dashboard" });
</script>
