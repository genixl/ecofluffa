<template>
  <div>
    <SectionHeader
      title="My Reports"
      subtitle="Your order performance, revenue estimates and service breakdown"
    />

    <ReportExporter title="Provider Report" subtitle="EcoFluffa | Provider Performance Report" @period-change="onPeriodChange">
      <template #default>
        <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading your report...</div>

        <template v-else>
          <!-- Business summary card -->
          <div
            class="rounded-2xl p-5 mb-6 flex items-center gap-4"
            style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
          >
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style="background-color: var(--brand-blue-light);"
            >
              <Icon name="mdi:store" size="28" style="color: var(--brand-blue);" />
            </div>
            <div>
              <div class="text-lg font-black" style="color: var(--text-primary);">{{ provider?.name ?? 'My Business' }}</div>
              <div class="text-sm" style="color: var(--text-muted);">{{ provider?.city ?? '' }}</div>
              <div class="flex items-center gap-1 mt-1">
                <Icon name="mdi:star" size="14" style="color: #f59e0b;" />
                <span class="text-sm font-bold" style="color: var(--text-primary);">{{ (provider?.rating ?? 0).toFixed(1) }}</span>
                <span class="text-xs" style="color: var(--text-muted);">/ 5 · {{ provider?.review_count ?? 0 }} reviews</span>
              </div>
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

          <!-- Revenue estimate -->
          <div
            class="rounded-2xl p-6 mb-8 flex items-center gap-5"
            style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
          >
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style="background-color: var(--brand-blue-light);"
            >
              <Icon name="mdi:cash-multiple" size="28" style="color: var(--brand-blue);" />
            </div>
            <div>
              <div class="text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Estimated Revenue</div>
              <div class="text-3xl font-black mt-1" style="color: var(--text-primary);">{{ revenueEstimate }}</div>
              <div class="text-xs mt-1" style="color: var(--text-faint);">From {{ filteredStats.delivered }} delivered orders in period</div>
            </div>
          </div>

          <!-- Service breakdown -->
          <div>
            <SectionHeader title="Service Breakdown" subtitle="Most booked services in selected period" />

            <div
              v-if="serviceBreakdown.length === 0"
              class="bg-surface border border-theme rounded-xl p-8 text-center text-muted"
            >
              No service data in this period.
            </div>

            <div v-else class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
              <table class="w-full text-left">
                <thead class="bg-subtle border-b border-theme">
                  <tr>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Service</th>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Bookings</th>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Share</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-theme">
                  <tr
                    v-for="svc in serviceBreakdown"
                    :key="svc.title"
                    class="hover:bg-subtle transition-colors"
                  >
                    <td class="p-4 font-semibold text-sm" style="color: var(--text-primary);">{{ svc.title }}</td>
                    <td class="p-4 text-sm font-bold" style="color: var(--brand-blue);">{{ svc.count }}</td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <div
                          class="flex-1 h-2 rounded-full overflow-hidden"
                          style="background-color: var(--bg-subtle); max-width: 100px;"
                        >
                          <div
                            class="h-full rounded-full transition-all duration-500"
                            style="background-color: var(--brand-blue);"
                            :style="`width: ${svc.pct}%;`"
                          ></div>
                        </div>
                        <span class="text-xs" style="color: var(--text-muted);">{{ svc.pct }}%</span>
                      </div>
                    </td>
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
const { orders, loadAll } = useProviderOrders()
const { provider, fetchMyProvider } = useProviderProfile()
const loading = ref(true)
const activePeriod = ref('30d')

const onPeriodChange = (p: string) => { activePeriod.value = p }

onMounted(async () => {
  await Promise.all([loadAll(), fetchMyProvider()])
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
  pending:   filteredOrders.value.filter(o => o.status === 'pending').length,
  active:    filteredOrders.value.filter(o => ['washing', 'ready'].includes(o.status)).length,
  delivered: filteredOrders.value.filter(o => o.status === 'delivered').length,
  cancelled: filteredOrders.value.filter(o => o.status === 'cancelled').length,
}))

const revenueEstimate = computed(() => {
  const delivered = filteredOrders.value.filter(o => o.status === 'delivered')
  if (!delivered.length) return 'KSh 0'
  const total = delivered.reduce((sum, o) => {
    const match = o.total_estimate?.match(/[\d,]+/)
    return sum + (match ? parseInt(match[0].replace(/,/g, ''), 10) : 0)
  }, 0)
  return `KSh ${total.toLocaleString()}`
})

const serviceBreakdown = computed(() => {
  const counts = new Map<string, number>()
  for (const o of filteredOrders.value) {
    for (const svc of (o.order_services ?? [])) {
      const t = svc.title ?? 'Other'
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([title, count]) => ({ title, count, pct: Math.round((count / total) * 100) }))
})

const orderKpis = computed(() => [
  { label: 'Total Orders', value: filteredStats.value.total,     hint: 'In selected period',       icon: 'mdi:inbox-multiple' },
  { label: 'Delivered',    value: filteredStats.value.delivered, hint: 'Successfully completed',   icon: 'mdi:check-circle' },
  { label: 'Active',       value: filteredStats.value.active,    hint: 'In progress now',          icon: 'mdi:washing-machine' },
  { label: 'Cancelled',    value: filteredStats.value.cancelled, hint: 'In selected period',       icon: 'mdi:close-circle-outline' },
])

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
