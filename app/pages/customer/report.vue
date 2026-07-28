<template>
  <div>
    <SectionHeader
      title="My Reports"
      subtitle="Your laundry history, spending and favourite services"
    />

    <ReportExporter title="Customer Report" subtitle="EcoFluffa | My Laundry History Report" @period-change="onPeriodChange">
      <template #default>
        <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading your report...</div>

        <template v-else>
          <!-- Welcome summary card -->
          <div
            class="rounded-2xl p-5 mb-6 flex items-center gap-4"
            style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
          >
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style="background-color: var(--brand-blue-light);"
            >
              <Icon name="mdi:account" size="28" style="color: var(--brand-blue);" />
            </div>
            <div>
              <div class="text-lg font-black" style="color: var(--text-primary);">{{ userName }}</div>
              <div class="text-sm" style="color: var(--text-muted);">Customer Report</div>
              <div class="text-xs mt-0.5" style="color: var(--text-faint);">{{ filteredStats.total }} orders in selected period</div>
            </div>
          </div>

          <!-- Order KPI cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
              v-for="kpi in orderKpis"
              :key="kpi.label"
              class="rounded-2xl p-5 relative overflow-hidden"
              style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
            >
              <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-6 translate-x-6" style="background-color: var(--brand-blue);"></div>
              <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style="background-color: var(--brand-blue-light);">
                <Icon :name="kpi.icon" size="16" style="color: var(--brand-blue);" />
              </div>
              <div class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--text-muted);">{{ kpi.label }}</div>
              <div class="text-3xl font-black" style="color: var(--text-primary);">{{ kpi.value }}</div>
              <div class="text-xs mt-1" style="color: var(--text-faint);">{{ kpi.hint }}</div>
              <div class="mt-4 h-1 rounded-full" style="background: var(--brand-orange); opacity: 0.5;"></div>
            </div>
          </div>

          <!-- Spend estimate -->
          <div
            class="rounded-2xl p-6 mb-8 flex items-center gap-5"
            style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
          >
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style="background-color: var(--brand-blue-light);"
            >
              <Icon name="mdi:wallet-outline" size="28" style="color: var(--brand-blue);" />
            </div>
            <div>
              <div class="text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Estimated Spend</div>
              <div class="text-3xl font-black mt-1" style="color: var(--text-primary);">{{ spendEstimate }}</div>
              <div class="text-xs mt-1" style="color: var(--text-faint);">From {{ filteredStats.completed }} completed orders</div>
            </div>
          </div>

          <!-- Favourite provider and service -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div
              class="rounded-2xl p-5"
              style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
            >
              <div class="flex items-center gap-2 mb-3">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background-color: var(--brand-blue-light);">
                  <Icon name="mdi:store-heart" size="16" style="color: var(--brand-blue);" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Favourite Provider</div>
              </div>
              <div class="text-xl font-black" style="color: var(--text-primary);">{{ topProvider || 'None yet' }}</div>
              <div class="text-xs mt-1" style="color: var(--text-faint);">Most orders placed with</div>
            </div>
            <div
              class="rounded-2xl p-5"
              style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
            >
              <div class="flex items-center gap-2 mb-3">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background-color: var(--brand-blue-light);">
                  <Icon name="mdi:washing-machine" size="16" style="color: var(--brand-blue);" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Most-Used Service</div>
              </div>
              <div class="text-xl font-black" style="color: var(--text-primary);">{{ topService || 'None yet' }}</div>
              <div class="text-xs mt-1" style="color: var(--text-faint);">Most frequently ordered</div>
            </div>
          </div>

          <!-- Order history table -->
          <div>
            <SectionHeader title="Order History" subtitle="All orders in selected period" />

            <div
              v-if="filteredOrders.length === 0"
              class="bg-surface border border-theme rounded-xl p-8 text-center text-muted"
            >
              No orders in this period.
            </div>

            <div v-else class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
              <table class="w-full text-left">
                <thead class="bg-subtle border-b border-theme">
                  <tr>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Order ID</th>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Provider</th>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Status</th>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Date</th>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Est. Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-theme">
                  <tr
                    v-for="o in filteredOrders"
                    :key="o.id"
                    class="hover:bg-subtle transition-colors"
                  >
                    <td class="p-4 text-xs font-mono font-bold" style="color: var(--brand-blue);">{{ o.id }}</td>
                    <td class="p-4 text-sm" style="color: var(--text-primary);">{{ o.provider?.name ?? 'N/A' }}</td>
                    <td class="p-4">
                      <span
                        class="px-2.5 py-1 rounded-full text-xs font-semibold"
                        :style="statusStyle(o.status)"
                      >{{ o.status }}</span>
                    </td>
                    <td class="p-4 text-sm" style="color: var(--text-muted);">{{ formatDate(o.pickup_date) }}</td>
                    <td class="p-4 text-sm font-semibold" style="color: var(--text-primary);">{{ o.total_estimate || 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </template>
    </ReportExporter>
  </div>
</template>

<script setup lang="ts">
const { orders, loadAll } = useCustomerOrders()
const { userName } = useAuth()
const loading = ref(true)
const activePeriod = ref('30d')

const onPeriodChange = (p: string) => { activePeriod.value = p }

onMounted(async () => {
  await loadAll()
  loading.value = false
})

const daysAgoIso = (days: number) => {
  const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString()
}

const sinceDate = computed(() => {
  if (activePeriod.value === '7d')  return daysAgoIso(7)
  if (activePeriod.value === '30d') return daysAgoIso(30)
  if (activePeriod.value === '90d') return daysAgoIso(90)
  return null
})

const filteredOrders = computed(() => {
  if (!sinceDate.value) return orders.value
  return orders.value.filter(o => o.created_at >= sinceDate.value!)
})

const filteredStats = computed(() => ({
  total:     filteredOrders.value.length,
  active:    filteredOrders.value.filter(o => ['pending', 'washing', 'ready'].includes(o.status)).length,
  completed: filteredOrders.value.filter(o => o.status === 'delivered').length,
  cancelled: filteredOrders.value.filter(o => o.status === 'cancelled').length,
}))

const spendEstimate = computed(() => {
  const delivered = filteredOrders.value.filter(o => o.status === 'delivered')
  if (!delivered.length) return 'KSh 0'
  const total = delivered.reduce((sum, o) => {
    const match = o.total_estimate?.match(/[\d,]+/)
    return sum + (match ? parseInt(match[0].replace(/,/g, ''), 10) : 0)
  }, 0)
  return `KSh ${total.toLocaleString()}`
})

const topProvider = computed(() => {
  const counts = new Map<string, number>()
  for (const o of filteredOrders.value) {
    const name = o.provider?.name
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  let top = '', max = 0
  counts.forEach((v, k) => { if (v > max) { max = v; top = k } })
  return top || null
})

const topService = computed(() => {
  const counts = new Map<string, number>()
  for (const o of filteredOrders.value) {
    for (const svc of (o.order_services ?? [])) {
      const t = svc.title ?? 'Other'
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  let top = '', max = 0
  counts.forEach((v, k) => { if (v > max) { max = v; top = k } })
  return top || null
})

const orderKpis = computed(() => [
  { label: 'Total Orders', value: filteredStats.value.total,     hint: 'In selected period',  icon: 'mdi:package-variant' },
  { label: 'Completed',    value: filteredStats.value.completed, hint: 'Delivered to you',    icon: 'mdi:check-circle' },
  { label: 'Active',       value: filteredStats.value.active,    hint: 'In progress',         icon: 'mdi:clock-outline' },
  { label: 'Cancelled',    value: filteredStats.value.cancelled, hint: 'In selected period',  icon: 'mdi:close-circle-outline' },
])

const statusStyle = (status: string) => {
  if (status === 'delivered') return 'background-color: #d1fae5; color: #065f46;'
  if (status === 'cancelled') return 'background-color: #fee2e2; color: #991b1b;'
  if (status === 'pending')   return 'background-color: #fef3c7; color: #92400e;'
  return 'background-color: var(--bg-subtle); color: var(--text-muted);'
}

const formatDate = (d: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d))
  } catch { return d }
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
