<template>
  <div>
    <SectionHeader
      title="Provider Dashboard"
      subtitle="Manage your orders, update service offerings, and track platform activity all in one place"
    />

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SkeletonCard v-for="i in 5" :key="i" :rows="2" :row-height="28" />
      </div>
      <SkeletonCard :rows="4" :row-height="90" />
    </div>

    <template v-else>
      <!-- Stat cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <CustomerStatCard label="Incoming" :value="stats.incoming" hint="Awaiting acceptance" />
        <CustomerStatCard label="Washing" :value="stats.washing" hint="In progress" />
        <CustomerStatCard label="Ready" :value="stats.ready" hint="Ready for delivery" />
        <CustomerStatCard label="Delivered" :value="stats.delivered" hint="Completed" />
        <!-- Today's pickups — highlighted -->
        <div
          class="rounded-xl p-5 flex flex-col gap-1"
          :style="todayOrders.length
            ? 'background-color: #ffedd5; border: 2px solid #ea580c;'
            : 'background-color: var(--bg-surface); border: 1px solid var(--border-color);'"
        >
          <div class="text-xs font-semibold uppercase tracking-wide"
            :style="todayOrders.length ? 'color: #ea580c;' : 'color: var(--text-muted);'">
            Today's Pickups
          </div>
          <div class="text-3xl font-black"
            :style="todayOrders.length ? 'color: #ea580c;' : 'color: var(--text-primary);'">
            {{ todayOrders.length }}
          </div>
          <div class="text-xs" :style="todayOrders.length ? 'color: #c2410c;' : 'color: var(--text-muted);'">
            {{ revenueEstimate }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div class="lg:col-span-2">
          <SectionHeader title="Incoming Orders" subtitle="Tap to manage pickup, status & messages" />
          <div v-if="incomingOrders.length === 0" class="bg-surface border border-theme rounded-xl p-8 text-center">
            <Icon name="mdi:clipboard-check" size="40" style="color: var(--text-muted);" />
            <div class="text-muted text-sm mt-3">No active orders right now.</div>
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
              :urgency="getUrgency(o)"
              :to="`/provider/order/${o.id}`"
            />
          </div>
        </div>
        <div>
          <div
            class="cursor-pointer select-none"
            @click="showPlatformActivity = !showPlatformActivity"
          >
            <SectionHeader title="Platform Activity" subtitle="Live updates from all roles" />
            <div class="text-muted text-xs mt-1">
              {{ showPlatformActivity ? '▼ Hide' : '▶ Show' }} activity feed
            </div>
          </div>
          <ActivityFeed
            v-if="showPlatformActivity"
            :items="recentActivities.slice(0, 10)"
            order-link-prefix="/provider/order"
            class="mt-4"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { stats, incomingOrders, recentActivities, orders, loadAll } = useProviderOrders()
const loading = ref(true)
const showPlatformActivity = ref(false)

onMounted(async () => {
  await loadAll()
  loading.value = false
})

const today = new Date().toISOString().slice(0, 10)

const getUrgency = (o: { pickup_date: string; status: string }) => {
  if (['delivered', 'cancelled'].includes(o.status)) return null
  if (o.pickup_date < today) return 'overdue' as const
  if (o.pickup_date === today) return 'today' as const
  return null
}

const todayOrders = computed(() =>
  incomingOrders.value.filter(o => o.pickup_date === today)
)

const revenueEstimate = computed(() => {
  const delivered = orders.value.filter(o => o.status === 'delivered')
  if (!delivered.length) return 'No revenue yet'
  // Extract numeric part from total_estimate strings like "KSh 500 per kg"
  const total = delivered.reduce((sum, o) => {
    const match = o.total_estimate.match(/[\d,]+/)
    return sum + (match ? parseInt(match[0].replace(/,/g, ''), 10) : 0)
  }, 0)
  return total ? `Est. KSh ${total.toLocaleString()} earned` : 'Revenue tracked'
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
