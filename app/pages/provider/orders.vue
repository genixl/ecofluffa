<template>
  <div>
    <SectionHeader title="All Orders" subtitle="Your assigned orders — click to manage" />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading orders…</div>

    <div v-else-if="orders.length === 0" class="bg-surface border border-theme rounded-xl p-10 text-center">
      <div class="text-primary font-semibold">No orders assigned yet</div>
    </div>

    <div v-else class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
      <table class="w-full text-left">
        <thead class="bg-subtle border-b border-theme">
          <tr>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Order</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Customer</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Status</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Pickup Date</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border-theme">
          <tr v-for="o in orders" :key="o.id" class="hover:bg-subtle transition-colors">
            <td class="p-4 font-semibold text-primary">{{ o.id }}</td>
            <td class="p-4 text-sm text-primary">{{ o.customer?.full_name ?? '—' }}</td>
            <td class="p-4"><OrderStatusBadge :status="o.status" /></td>
            <td class="p-4 text-sm text-muted">{{ o.pickup_date }}</td>
            <td class="p-4">
              <NuxtLink :to="`/provider/order/${o.id}`" class="font-semibold text-sm hover:underline" style="color: var(--brand-blue);">
                Manage →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { orders, loadAll } = useProviderOrders()
const loading = ref(true)

onMounted(async () => {
  await loadAll()
  loading.value = false
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
