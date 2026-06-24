<template>
  <div>
    <SectionHeader title="All Orders" subtitle="Your assigned orders, click to manage" />

    <div class="flex flex-wrap gap-2 mb-6 border-b pb-4" style="border-color: var(--border-color);">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeStatus = tab.key"
        class="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
        :style="activeStatus === tab.key
          ? 'background-color: var(--brand-blue); color: #fff;'
          : 'background-color: var(--bg-subtle); color: var(--text-muted);'"
      >
        {{ tab.label }}
        <span
          class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
          :style="activeStatus === tab.key
            ? 'background: rgba(255,255,255,0.25); color: #fff;'
            : 'background-color: var(--bg-base); color: var(--text-muted);'"
        >{{ tab.count }}</span>
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <SkeletonCard v-for="i in 5" :key="i" :rows="1" :row-height="52" />
    </div>

    <div v-else-if="filteredOrders.length === 0"
      class="bg-surface border border-theme rounded-xl p-10 text-center">
      <Icon name="mdi:clipboard-text-off" size="40" style="color: var(--text-muted);" />
      <div class="text-primary font-semibold mt-3">No orders in this category</div>
      <div class="text-muted text-sm mt-1">Check another tab or wait for new bookings.</div>
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
          <tr
            v-for="o in filteredOrders"
            :key="o.id"
            class="hover:bg-subtle transition-colors"
          >
            <td class="p-4">
              <div class="font-semibold text-primary">{{ o.id }}</div>
              <span
                v-if="getUrgency(o)"
                class="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
                :style="getUrgency(o) === 'overdue'
                  ? 'background-color: #fee2e2; color: #ef4444;'
                  : 'background-color: #ffedd5; color: #ea580c;'"
              >
                {{ getUrgency(o) === 'overdue' ? '⚠ Overdue' : '📅 Today' }}
              </span>
            </td>
            <td class="p-4 text-sm text-primary">{{ o.customer?.full_name ?? 'N/A' }}</td>
            <td class="p-4"><OrderStatusBadge :status="o.status" /></td>
            <td class="p-4 text-sm text-muted">{{ o.pickup_date }}</td>
            <td class="p-4">
              <NuxtLink
                :to="`/provider/order/${o.id}`"
                class="font-semibold text-sm hover:underline"
                style="color: var(--brand-blue);"
              >
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
const activeStatus = ref<'all' | 'pending' | 'washing' | 'ready' | 'delivered' | 'cancelled'>('all')

onMounted(async () => {
  await loadAll()
  loading.value = false
})

const today = new Date().toISOString().slice(0, 10)

const getUrgency = (o: { pickup_date: string; status: string }) => {
  if (['delivered', 'cancelled'].includes(o.status)) return null
  if (o.pickup_date < today) return 'overdue'
  if (o.pickup_date === today) return 'today'
  return null
}

// Sort: urgency first (overdue → today → future), then by date
const sortedOrders = computed(() =>
  [...orders.value].sort((a, b) => {
    const urgencyRank = { overdue: 0, today: 1, null: 2 }
    const ra = urgencyRank[getUrgency(a) ?? 'null'] ?? 2
    const rb = urgencyRank[getUrgency(b) ?? 'null'] ?? 2
    if (ra !== rb) return ra - rb
    return a.pickup_date.localeCompare(b.pickup_date)
  })
)

const tabs = computed(() => [
  { key: 'all' as const,       label: 'All',       count: orders.value.length },
  { key: 'pending' as const,   label: 'Pending',   count: orders.value.filter(o => o.status === 'pending').length },
  { key: 'washing' as const,   label: 'Washing',   count: orders.value.filter(o => o.status === 'washing').length },
  { key: 'ready' as const,     label: 'Ready',     count: orders.value.filter(o => o.status === 'ready').length },
  { key: 'delivered' as const, label: 'Delivered', count: orders.value.filter(o => o.status === 'delivered').length },
  { key: 'cancelled' as const, label: 'Cancelled', count: orders.value.filter(o => o.status === 'cancelled').length },
])

const filteredOrders = computed(() =>
  activeStatus.value === 'all'
    ? sortedOrders.value
    : sortedOrders.value.filter(o => o.status === activeStatus.value)
)

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
