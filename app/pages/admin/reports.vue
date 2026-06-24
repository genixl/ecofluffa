<template>
  <div>
    <SectionHeader
      title="Reports"
      subtitle="Order stats, provider performance, and platform usage"
    />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading reports…</div>

    <template v-else-if="reports">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-surface border border-theme rounded-xl p-4 shadow-theme-sm">
          <div class="font-bold" style="color: var(--brand-blue);">Total Orders</div>
          <div class="text-primary text-2xl font-bold mt-2">{{ reports.totalOrders }}</div>
        </div>
        <div class="bg-surface border border-theme rounded-xl p-4 shadow-theme-sm">
          <div class="font-bold" style="color: var(--brand-blue);">Delivered Orders</div>
          <div class="text-primary text-2xl font-bold mt-2">{{ reports.totalDelivered }}</div>
        </div>
        <div class="bg-surface border border-theme rounded-xl p-4 shadow-theme-sm">
          <div class="font-bold" style="color: var(--brand-blue);">Active Customers (30d)</div>
          <div class="text-primary text-2xl font-bold mt-2">{{ reports.monthlyActiveUsers }}</div>
          <div class="text-xs text-muted mt-1">Customers who placed an order in the last 30 days</div>
        </div>
      </div>

      <SectionHeader title="Provider Performance" subtitle="Ratings and completed orders" />

      <div v-if="reports.providerPerformance.length === 0" class="bg-surface border border-theme rounded-xl p-10 text-center text-muted mb-8">
        No provider data yet.
      </div>

      <div v-else class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm mb-8">
        <table class="w-full text-left">
          <thead class="bg-subtle border-b border-theme">
            <tr>
              <th class="p-4 text-xs font-semibold text-muted uppercase">Provider</th>
              <th class="p-4 text-xs font-semibold text-muted uppercase">Avg Rating</th>
              <th class="p-4 text-xs font-semibold text-muted uppercase">Completed Orders</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-theme">
            <tr v-for="p in reports.providerPerformance" :key="p.id" class="hover:bg-subtle transition-colors">
              <td class="p-4 font-semibold text-primary">{{ p.name }}</td>
              <td class="p-4 text-sm text-muted">{{ p.avgRating }} / 5</td>
              <td class="p-4 text-sm text-muted">{{ p.completed }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <SectionHeader title="Platform Usage" subtitle="Service booking trends" />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm">
          <div class="font-bold" style="color: var(--brand-blue);">Delivery rate</div>
          <div class="text-muted text-sm mt-2">
            Share of all orders that reached delivered status.
          </div>
          <div class="text-primary font-semibold mt-3">{{ deliveryRate }}%</div>
        </div>
        <div class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm">
          <div class="font-bold" style="color: var(--brand-blue);">Top booked service</div>
          <div class="text-muted text-sm mt-2">
            Most frequently ordered service across all bookings.
          </div>
          <div class="text-primary font-semibold mt-3">
            {{ reports.topService }}
            <span v-if="reports.topServiceCount > 0" class="text-sm text-muted font-normal">
              ({{ reports.topServiceCount }} bookings)
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { reports, loadReports } = useAdminPlatform()
const loading = ref(true)

const deliveryRate = computed(() => {
  if (!reports.value || reports.value.totalOrders === 0) return 0
  return Math.round((reports.value.totalDelivered / reports.value.totalOrders) * 1000) / 10
})

onMounted(async () => {
  await loadReports()
  loading.value = false
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
