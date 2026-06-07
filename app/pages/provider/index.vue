<template>
  <div>
    <SectionHeader
      title="Provider Dashboard"
      subtitle="Manage your orders, update service offerings, and track platform activity all in one place"
    />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading dashboard…</div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <CustomerStatCard label="Incoming" :value="stats.incoming" hint="Awaiting acceptance" />
        <CustomerStatCard label="Washing" :value="stats.washing" hint="In progress" />
        <CustomerStatCard label="Ready" :value="stats.ready" hint="Ready for delivery" />
        <CustomerStatCard label="Delivered" :value="stats.delivered" hint="Completed" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div class="lg:col-span-2">
          <SectionHeader title="Incoming Orders" subtitle="Tap to manage pickup, status & messages" />
          <div v-if="incomingOrders.length === 0" class="bg-surface border border-theme rounded-xl p-8 text-center text-muted">
            No active orders right now.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrderCard
              v-for="o in incomingOrders"
              :key="o.id"
              :orderId="o.id"
              :provider="o.provider?.name ?? ''"
              :status="o.status"
              :date="o.pickup_date"
              role="provider"
              :customer-name="o.customer?.full_name ?? ''"
              :pickup-address="o.pickup_address"
              :to="`/provider/order/${o.id}`"
            />
          </div>
        </div>
        <div>
          <SectionHeader title="Platform Activity" subtitle="Live updates from all roles" />
          <ActivityFeed :items="recentActivities.slice(0, 5)" order-link-prefix="/provider/order" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { stats, incomingOrders, recentActivities, loadAll } = useProviderOrders()
const loading = ref(true)

onMounted(async () => {
  await loadAll()
  loading.value = false
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
