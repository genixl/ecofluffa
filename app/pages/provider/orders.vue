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

    <div v-else class="space-y-3">
      <div
        v-for="o in filteredOrders"
        :key="o.id"
        class="bg-surface border border-theme rounded-xl p-5 shadow-theme-sm hover:shadow-md transition-all cursor-pointer"
        @click="navigateTo(`/provider/order/${o.id}`)"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="font-bold text-lg" style="color: var(--brand-blue);">{{ o.id }}</div>
              <OrderStatusBadge :status="o.status" />
              <span
                v-if="getUrgency(o)"
                class="text-xs font-bold px-2 py-1 rounded-full"
                :style="getUrgency(o) === 'overdue'
                  ? 'background-color: #fee2e2; color: #ef4444;'
                  : 'background-color: #ffedd5; color: #ea580c;'"
              >
                {{ getUrgency(o) === 'overdue' ? '⚠ Overdue' : '📅 Today' }}
              </span>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1.5" style="color: var(--text-muted);">
                <Icon name="mdi:account" size="16" />
                <span>{{ o.customer?.full_name ?? 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-1.5" style="color: var(--text-muted);">
                <Icon name="mdi:calendar" size="16" />
                <span>{{ o.pickup_date }}</span>
              </div>
              <div class="flex items-center gap-1.5" style="color: var(--text-muted);">
                <Icon name="mdi:clock" size="16" />
                <span>{{ o.pickup_time }}</span>
              </div>
            </div>
            <div class="mt-2 text-sm" style="color: var(--text-muted);">
              {{ o.pickup_address }}
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <Icon name="mdi:chevron-right" size="20" style="color: var(--brand-blue);" />
          </div>
        </div>
      </div>
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

// Sort: urgency first (overdue → today → future), then by date (newest first)
const sortedOrders = computed(() =>
  [...orders.value].sort((a, b) => {
    const urgencyRank = { overdue: 0, today: 1, null: 2 }
    const ra = urgencyRank[getUrgency(a) ?? 'null'] ?? 2
    const rb = urgencyRank[getUrgency(b) ?? 'null'] ?? 2
    if (ra !== rb) return ra - rb
    return b.pickup_date.localeCompare(a.pickup_date)
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
