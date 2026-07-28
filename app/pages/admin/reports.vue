<template>
  <div>
    <SectionHeader
      title="Platform Reports"
      subtitle="Provider metrics, customer activity and platform KPIs"
    />

    <ReportExporter title="Platform Reports" subtitle="EcoFluffa Admin | Provider and Customer Analytics" @period-change="onPeriodChange">
      <template #default>
        <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading report data...</div>

        <template v-else>

          <div
            class="rounded-2xl p-4 mb-6 no-print"
            style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
          >
            <div class="flex items-center gap-2 mb-4">
              <Icon name="mdi:filter-variant" size="16" style="color: var(--brand-blue);" />
              <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Filter &amp; Customise Report</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Provider search -->
              <div>
                <label class="text-xs font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-muted);">Search Provider</label>
                <div class="relative">
                  <Icon name="mdi:magnify" size="16" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: var(--text-faint);" />
                  <input
                    v-model="providerSearch"
                    type="text"
                    placeholder="e.g. Sunrise Laundry"
                    class="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style="background-color: var(--bg-subtle); border: 1px solid var(--border-color); color: var(--text-primary);"
                  />
                </div>
              </div>

              <!-- Provider status filter -->
              <div>
                <label class="text-xs font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-muted);">Provider Status</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="s in providerStatusOptions"
                    :key="s.value"
                    @click="providerStatusFilter = s.value"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    :style="providerStatusFilter === s.value
                      ? 'background-color: var(--brand-blue); color: #fff;'
                      : 'background-color: var(--bg-subtle); color: var(--text-muted);'"
                  >{{ s.label }}</button>
                </div>
              </div>

              <!-- Sort providers by -->
              <div>
                <label class="text-xs font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-muted);">Sort Providers By</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="s in sortOptions"
                    :key="s.value"
                    @click="providerSort = s.value"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    :style="providerSort === s.value
                      ? 'background-color: var(--brand-blue); color: #fff;'
                      : 'background-color: var(--bg-subtle); color: var(--text-muted);'"
                  >{{ s.label }}</button>
                </div>
              </div>

              <!-- Min rating -->
              <div>
                <label class="text-xs font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-muted);">Min Rating</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="r in minRatingOptions"
                    :key="r.value"
                    @click="minRating = r.value"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    :style="minRating === r.value
                      ? 'background-color: var(--brand-blue); color: #fff;'
                      : 'background-color: var(--bg-subtle); color: var(--text-muted);'"
                  >{{ r.label }}</button>
                </div>
              </div>
            </div>

            <!-- Section visibility toggles -->
            <div class="mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
              <div class="text-xs font-semibold uppercase tracking-wide mb-2" style="color: var(--text-muted);">Show Sections</div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="sec in sectionToggles"
                  :key="sec.key"
                  @click="sec.visible.value = !sec.visible.value"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  :style="sec.visible.value
                    ? 'background-color: var(--brand-blue-light); color: var(--brand-blue); border: 1px solid var(--brand-blue);'
                    : 'background-color: var(--bg-subtle); color: var(--text-faint); border: 1px solid var(--border-color);'"
                >
                  <Icon :name="sec.visible.value ? 'mdi:eye' : 'mdi:eye-off'" size="13" />
                  {{ sec.label }}
                </button>
              </div>
            </div>

            <!-- Active filter summary -->
            <div v-if="hasActiveFilters" class="mt-3 flex items-center gap-2">
              <span class="text-xs" style="color: var(--text-muted);">
                Showing {{ filteredProviders.length }} of {{ allProviders.length }} providers
              </span>
              <button
                @click="resetFilters"
                class="text-xs font-semibold hover:underline"
                style="color: var(--brand-orange);"
              >Reset filters</button>
            </div>
          </div>
          <div v-if="showKpis" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
              v-for="kpi in kpiCards"
              :key="kpi.label"
              class="rounded-2xl p-5 relative overflow-hidden"
              style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
            >
              <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-6 translate-x-6" style="background-color: var(--brand-blue);"></div>
              <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style="background-color: var(--brand-blue-light);">
                <Icon :name="kpi.icon" size="18" style="color: var(--brand-blue);" />
              </div>
              <div class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--text-muted);">{{ kpi.label }}</div>
              <div class="text-3xl font-black" style="color: var(--text-primary);">{{ kpi.value }}</div>
              <div class="text-xs mt-1" style="color: var(--text-faint);">{{ kpi.hint }}</div>
              <div class="mt-4 h-1 rounded-full" style="background: var(--brand-orange); opacity: 0.5;"></div>
            </div>
          </div>

          <div v-if="showProviders" class="mb-8">
            <div class="flex items-center justify-between mb-1">
              <SectionHeader
                title="Provider Performance"
                :subtitle="`${filteredProviders.length} provider${filteredProviders.length !== 1 ? 's' : ''} shown`"
              />
            </div>

            <div
              v-if="filteredProviders.length === 0"
              class="bg-surface border border-theme rounded-xl p-10 text-center text-muted"
            >
              No providers match the selected filters.
            </div>

            <div v-else class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
              <table class="w-full text-left">
                <thead class="bg-subtle border-b border-theme">
                  <tr>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">#</th>
                    <th
                      class="p-4 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
                      style="color: var(--text-muted);"
                      @click="providerSort = 'name'"
                    >
                      Provider
                      <Icon v-if="providerSort === 'name'" name="mdi:sort-alphabetical-ascending" size="12" class="ml-1" />
                    </th>
                    <th
                      class="p-4 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
                      style="color: var(--text-muted);"
                      @click="providerSort = 'rating'"
                    >
                      Avg Rating
                      <Icon v-if="providerSort === 'rating'" name="mdi:sort-descending" size="12" class="ml-1" />
                    </th>
                    <th
                      class="p-4 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
                      style="color: var(--text-muted);"
                      @click="providerSort = 'reviews'"
                    >
                      Reviews
                      <Icon v-if="providerSort === 'reviews'" name="mdi:sort-descending" size="12" class="ml-1" />
                    </th>
                    <th
                      class="p-4 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
                      style="color: var(--text-muted);"
                      @click="providerSort = 'completed'"
                    >
                      Completed
                      <Icon v-if="providerSort === 'completed'" name="mdi:sort-descending" size="12" class="ml-1" />
                    </th>
                    <th class="p-4 text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-theme">
                  <tr
                    v-for="(p, idx) in filteredProviders"
                    :key="p.id"
                    class="hover:bg-subtle transition-colors"
                  >
                    <td class="p-4 text-sm font-bold" style="color: var(--text-faint);">{{ idx + 1 }}</td>
                    <td class="p-4 font-semibold text-sm" style="color: var(--text-primary);">{{ p.name }}</td>
                    <td class="p-4">
                      <div class="flex items-center gap-1">
                        <Icon name="mdi:star" size="14" style="color: #f59e0b;" />
                        <span class="text-sm font-bold" style="color: var(--text-primary);">{{ (p.avgRating || 0).toFixed(1) }}</span>
                        <span class="text-xs" style="color: var(--text-muted);">/ 5</span>
                      </div>
                    </td>
                    <td class="p-4 text-sm" style="color: var(--text-muted);">{{ p.reviewCount }}</td>
                    <td class="p-4 text-sm font-bold" style="color: var(--brand-blue);">{{ p.completed }}</td>
                    <td class="p-4">
                      <span
                        class="px-2.5 py-1 rounded-full text-xs font-semibold"
                        :style="p.approvalStatus === 'approved'
                          ? 'background-color: #d1fae5; color: #065f46;'
                          : p.approvalStatus === 'disabled'
                            ? 'background-color: #fee2e2; color: #991b1b;'
                            : 'background-color: #fef3c7; color: #92400e;'"
                      >{{ p.approvalStatus }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="showCustomers" class="mb-8">
            <SectionHeader title="Customer Summary" subtitle="Active users and engagement for the selected period" />
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                v-for="cs in customerSummary"
                :key="cs.label"
                class="rounded-2xl p-5 relative overflow-hidden"
                style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
              >
                <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-6 translate-x-6" style="background-color: var(--brand-blue);"></div>
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background-color: var(--brand-blue-light);">
                    <Icon :name="cs.icon" size="16" style="color: var(--brand-blue);" />
                  </div>
                  <div class="text-xs font-semibold uppercase tracking-wide" style="color: var(--text-muted);">{{ cs.label }}</div>
                </div>
                <div class="text-3xl font-black" style="color: var(--text-primary);">{{ cs.value }}</div>
                <div class="text-xs mt-1" style="color: var(--text-faint);">{{ cs.hint }}</div>
                <div class="mt-4 h-1 rounded-full" style="background: var(--brand-orange); opacity: 0.5;"></div>
              </div>
            </div>
          </div>

          <div v-if="showPlatform">
            <SectionHeader title="Platform Usage" subtitle="Service trends and delivery performance" />
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm">
                <div class="font-bold mb-2" style="color: var(--brand-blue);">Delivery Rate</div>
                <div class="text-3xl font-black" style="color: var(--text-primary);">{{ deliveryRate }}%</div>
                <div class="text-xs mt-1" style="color: var(--text-muted);">Orders reaching delivered status</div>
                <div class="mt-3 h-2 rounded-full overflow-hidden" style="background-color: var(--bg-subtle);">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    style="background-color: var(--brand-blue);"
                    :style="`width: ${deliveryRate}%;`"
                  ></div>
                </div>
              </div>
              <div class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm">
                <div class="font-bold mb-2" style="color: var(--brand-blue);">Top Service</div>
                <div class="text-lg font-black leading-tight" style="color: var(--text-primary);">{{ reports?.topService ?? 'N/A' }}</div>
                <div v-if="reports?.topServiceCount" class="text-xs mt-2" style="color: var(--text-muted);">
                  {{ reports.topServiceCount }} bookings
                </div>
              </div>
              <div class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm">
                <div class="font-bold mb-2" style="color: var(--brand-blue);">Total Orders</div>
                <div class="text-3xl font-black" style="color: var(--text-primary);">{{ reports?.totalOrders ?? 0 }}</div>
                <div class="text-xs mt-1" style="color: var(--text-muted);">All time across platform</div>
              </div>
            </div>
          </div>

        </template>
      </template>
    </ReportExporter>
  </div>
</template>

<script setup lang="ts">
const { reports, providers, loadReports, loadProviders } = useAdminPlatform()
const loading = ref(true)
const activePeriod = ref('30d')

// Filter state
const providerSearch = ref('')
const providerStatusFilter = ref('all')
const providerSort = ref('completed')
const minRating = ref(0)

// Section visibility
const showKpis      = ref(true)
const showProviders = ref(true)
const showCustomers = ref(true)
const showPlatform  = ref(true)

const sectionToggles = [
  { key: 'kpis',      label: 'Platform KPIs',   visible: showKpis },
  { key: 'providers', label: 'Providers',        visible: showProviders },
  { key: 'customers', label: 'Customer Summary', visible: showCustomers },
  { key: 'platform',  label: 'Platform Usage',   visible: showPlatform },
]

const providerStatusOptions = [
  { label: 'All',      value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending',  value: 'pending' },
  { label: 'Disabled', value: 'disabled' },
]

const sortOptions = [
  { label: 'Completed', value: 'completed' },
  { label: 'Rating',    value: 'rating' },
  { label: 'Reviews',   value: 'reviews' },
  { label: 'Name A-Z',  value: 'name' },
]

const minRatingOptions = [
  { label: 'Any',  value: 0 },
  { label: '3+',   value: 3 },
  { label: '4+',   value: 4 },
  { label: '4.5+', value: 4.5 },
]

const onPeriodChange = (p: string) => { activePeriod.value = p }

onMounted(async () => {
  await Promise.all([loadReports(), loadProviders()])
  loading.value = false
})

const deliveryRate = computed(() => {
  if (!reports.value || reports.value.totalOrders === 0) return 0
  return Math.round((reports.value.totalDelivered / reports.value.totalOrders) * 1000) / 10
})

// All providers enriched with raw provider data
const allProviders = computed(() => {
  const perf = reports.value?.providerPerformance ?? []
  return perf.map(p => {
    const raw = providers.value.find(pr => pr.id === p.id)
    return {
      ...p,
      reviewCount:    raw?.review_count ?? 0,
      approvalStatus: raw?.approval_status ?? 'pending',
    }
  })
})

// Filtered + sorted providers
const filteredProviders = computed(() => {
  let list = [...allProviders.value]

  // Search
  if (providerSearch.value.trim()) {
    const q = providerSearch.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }

  // Status
  if (providerStatusFilter.value !== 'all') {
    list = list.filter(p => p.approvalStatus === providerStatusFilter.value)
  }

  // Min rating
  if (minRating.value > 0) {
    list = list.filter(p => (p.avgRating ?? 0) >= minRating.value)
  }

  // Sort
  if (providerSort.value === 'rating')    list.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
  else if (providerSort.value === 'reviews')   list.sort((a, b) => b.reviewCount - a.reviewCount)
  else if (providerSort.value === 'name')      list.sort((a, b) => a.name.localeCompare(b.name))
  else                                         list.sort((a, b) => b.completed - a.completed)

  return list
})

const hasActiveFilters = computed(() =>
  providerSearch.value.trim() !== '' ||
  providerStatusFilter.value !== 'all' ||
  minRating.value !== 0 ||
  providerSort.value !== 'completed'
)

const resetFilters = () => {
  providerSearch.value = ''
  providerStatusFilter.value = 'all'
  providerSort.value = 'completed'
  minRating.value = 0
}

const kpiCards = computed(() => [
  { label: 'Total Orders',    value: reports.value?.totalOrders ?? 0,                                                hint: 'Across all time',       icon: 'mdi:package-variant-closed' },
  { label: 'Delivered',       value: reports.value?.totalDelivered ?? 0,                                            hint: 'Successfully completed', icon: 'mdi:check-circle-outline' },
  { label: 'Active Providers',value: allProviders.value.filter(p => p.approvalStatus === 'approved').length,        hint: 'Approved and listed',    icon: 'mdi:store-check' },
  { label: 'Delivery Rate',   value: `${deliveryRate.value}%`,                                                      hint: 'Orders completed',       icon: 'mdi:trending-up' },
])

const customerSummary = computed(() => [
  { label: 'Monthly Active Users', value: reports.value?.monthlyActiveUsers ?? 0,  hint: 'Placed an order in last 30 days', icon: 'mdi:account-clock' },
  { label: 'Top Booked Service',   value: reports.value?.topService ?? 'N/A',      hint: `${reports.value?.topServiceCount ?? 0} bookings`, icon: 'mdi:washing-machine' },
  { label: 'Total Providers',      value: providers.value.length,                  hint: `${providers.value.filter(p => p.approval_status === 'approved').length} approved`, icon: 'mdi:store-outline' },
])

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
