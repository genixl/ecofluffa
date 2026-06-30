<template>
  <div>
    <SectionHeader
      title="Provider Dashboard"
      subtitle="Manage your orders, update service offerings, and track platform activity all in one place"
    />

    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SkeletonCard v-for="i in 5" :key="i" :rows="2" :row-height="28" />
      </div>
      <SkeletonCard :rows="4" :row-height="90" />
    </div>

    <template v-else>
      <div
        v-if="isDisabled"
        class="rounded-xl border-2 p-4 mb-6 flex items-start gap-3"
        style="border-color: #ef4444; background-color: #fef2f2;"
      >
        <Icon name="mdi:account-off" size="24" style="color: #ef4444;" />
        <div>
          <div class="font-bold" style="color: #991b1b;">Account disabled</div>
          <p class="text-sm mt-1" style="color: #b91c1c;">
            Your provider account has been disabled. You cannot receive new orders. Please contact support to request restoration.
          </p>
          <NuxtLink to="/contact" class="text-sm font-semibold underline mt-2 inline-block" style="color: #991b1b;">Contact support →</NuxtLink>
        </div>
      </div>

      <div
        v-else-if="isPendingApproval"
        class="rounded-xl border-2 p-4 mb-6 flex items-start gap-3"
        style="border-color: var(--brand-orange); background-color: rgba(255, 107, 53, 0.08);"
      >
        <Icon name="mdi:clock-outline" size="24" style="color: var(--brand-orange);" />
        <div>
          <div class="font-bold" style="color: var(--brand-blue);">Awaiting admin approval</div>
          <p class="text-sm mt-1" style="color: var(--text-muted);">
            Your profile is complete but not yet approved. Customers cannot see you or place orders until an admin approves your account.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <CustomerStatCard label="Incoming" :value="stats.incoming" hint="Awaiting acceptance" />
        <CustomerStatCard label="Washing" :value="stats.washing" hint="In progress" />
        <CustomerStatCard label="Ready" :value="stats.ready" hint="Ready for delivery" />
        <CustomerStatCard label="Delivered" :value="stats.delivered" hint="Completed" />
        <div
          class="rounded-xl p-5 flex flex-col gap-1"
          :style="provider.value?.rating && provider.value.rating > 0
            ? 'background-color: #fef3c7; border: 2px solid #f59e0b;'
            : 'background-color: var(--bg-surface); border: 1px solid var(--border-color);'"
        >
          <div class="text-xs font-semibold uppercase tracking-wide"
            :style="provider.value?.rating && provider.value.rating > 0 ? 'color: #92400e;' : 'color: var(--text-muted);'">
            Rating
          </div>
          <div class="flex items-center gap-1">
            <div class="text-3xl font-black"
              :style="provider.value?.rating && provider.value.rating > 0 ? 'color: #92400e;' : 'color: var(--text-primary);'">
              {{ (provider.value?.rating ?? 0).toFixed(1) }}
            </div>
            <Icon v-if="provider.value?.rating && provider.value.rating > 0" name="mdi:star" size="20" style="color: #f59e0b;" />
          </div>
          <div class="text-xs" :style="provider.value?.rating && provider.value.rating > 0 ? 'color: #b45309;' : 'color: var(--text-muted);'">
            {{ provider.value?.review_count || 0 }} review{{ (provider.value?.review_count || 0) !== 1 ? 's' : '' }}
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
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="font-bold text-base" style="color: var(--text-primary);">Incoming Activity</div>
              <div class="text-xs mt-0.5" style="color: var(--text-muted);">All events across your orders</div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span
                v-if="newMessagesToday > 0"
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                style="background-color: #fef3c7; color: #92400e;"
              >{{ newMessagesToday }} new msg{{ newMessagesToday > 1 ? 's' : '' }}</span>
              <span
                v-if="ordersNeedingAction > 0"
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                style="background-color: #ffedd5; color: #ea580c;"
              >{{ ordersNeedingAction }} need action</span>
            </div>
          </div>

          <div v-if="recentActivities.length === 0"
            class="rounded-xl p-6 text-center"
            style="background-color: var(--bg-surface); border: 1px solid var(--border-color);"
          >
            <Icon name="mdi:inbox-outline" size="32" style="color: var(--text-muted);" />
            <div class="text-sm mt-2" style="color: var(--text-muted);">No activity yet on your orders.</div>
          </div>

          <div v-else class="flex flex-col gap-2">
            <div
              v-for="item in providerActivity.slice(0, 5)"
              :key="item.id"
              class="rounded-xl px-4 py-3 flex items-start gap-3 transition-all hover:shadow-sm"
              style="background-color: var(--bg-surface); border: 1px solid var(--border-color);"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                :style="activityDotStyle(item.type)"
              >
                <Icon :name="activityIcon(item.type)" size="14" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-bold" style="color: var(--text-primary);">{{ item.title }}</span>
                  <span class="text-xs shrink-0" style="color: var(--text-faint);">{{ formatTime(item.at) }}</span>
                </div>
                <div class="text-xs mt-0.5" style="color: var(--text-muted);">{{ item.detail }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <span v-if="item.actorName" class="text-xs font-medium" style="color: var(--text-faint);">by {{ item.actorName }}</span>
                  <NuxtLink
                    v-if="item.orderId"
                    :to="`/provider/order/${item.orderId}`"
                    class="text-xs font-semibold hover:underline"
                    style="color: var(--brand-blue);"
                  >{{ item.orderId }} →</NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { stats, incomingOrders, recentActivities, orders, loadAll } = useProviderOrders()
const { isPendingApproval, isDisabled, fetchMyProvider, provider } = useProviderProfile()
const loading = ref(true)

onMounted(async () => {
  await Promise.all([loadAll(), fetchMyProvider()])
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

const ordersNeedingAction = computed(() =>
  incomingOrders.value.filter(o => o.status === 'pending').length
)

const newMessagesToday = computed(() => {
  const todayPrefix = today
  return recentActivities.value.filter(
    (a) => a.type === 'message' && a.created_at.startsWith(todayPrefix)
  ).length
})

const providerActivity = computed(() =>
  recentActivities.value.slice(0, 5).map((a) => ({
    id: a.id,
    orderId: a.order_id,
    type: a.type,
    title: a.title,
    detail: a.detail,
    actorName: a.actor_name,
    at: a.created_at,
  }))
)

const activityIcon = (type: string) => {
  if (type === 'booking')  return 'mdi:clipboard-list-outline'
  if (type === 'status')   return 'mdi:refresh'
  if (type === 'message')  return 'mdi:chat-outline'
  if (type === 'admin')    return 'mdi:shield-account'
  return 'mdi:pin'
}

const activityDotStyle = (type: string) => {
  if (type === 'booking')  return 'background-color: var(--brand-blue-light); color: var(--brand-blue);'
  if (type === 'status')   return 'background-color: #d1fae5; color: #065f46;'
  if (type === 'message')  return 'background-color: #fef3c7; color: #92400e;'
  if (type === 'admin')    return 'background-color: #fce7f3; color: #9d174d;'
  return 'background-color: var(--bg-subtle); color: var(--text-muted);'
}

const formatTime = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch { return iso }
}

const revenueEstimate = computed(() => {
  const delivered = orders.value.filter(o => o.status === 'delivered')
  if (!delivered.length) return 'No revenue yet'
  const total = delivered.reduce((sum, o) => {
    const match = o.total_estimate.match(/[\d,]+/)
    return sum + (match ? parseInt(match[0].replace(/,/g, ''), 10) : 0)
  }, 0)
  return total ? `Est. KSh ${total.toLocaleString()} earned` : 'Revenue tracked'
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
