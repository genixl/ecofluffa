<template>
  <div>
    <SectionHeader
      title="Find a Service"
      subtitle="Browse services, compare provider prices, and book the best option for you"
    />

    <div class="bg-surface border border-theme rounded-xl p-6 mb-8 shadow-theme-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Search services or providers"
          type="text"
          placeholder="e.g. ironing, Ocean Breeze, dry clean"
          v-model="searchQuery"
        />
        <div>
          <label class="block text-muted mb-3 font-semibold text-sm">Category</label>
          <select
            v-model="activeCategory"
            class="w-full border-2 border-theme bg-surface text-primary px-4 py-3 rounded-lg focus:outline-none focus:border-brand-blue-700 transition-all duration-200"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-muted">Loading services…</div>

    <template v-else>
      <SectionHeader title="Service Catalog" subtitle="Select a service to compare provider prices below" />

      <div v-if="filteredServices.length === 0" class="bg-surface border border-theme rounded-xl p-10 text-center mb-10">
        <div class="text-primary font-semibold">No services match your search</div>
        <div class="text-muted text-sm mt-2">Try a different keyword or category.</div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <button
          v-for="srv in filteredServices"
          :key="srv.id"
          type="button"
          class="text-left bg-surface rounded-xl border p-5 shadow-theme-sm transition-all relative"
          :class="selectedServiceId === srv.id
            ? 'border-brand-blue-700 ring-2 ring-brand-blue-700/30 shadow-theme-md'
            : 'border-theme hover:border-brand-blue-700/50 hover:shadow-theme-md'"
          @click="selectedServiceId = srv.id"
        >
          <span v-if="srv.popular" class="absolute top-3 right-3 text-xs font-semibold bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">Popular</span>
          <div class="text-brand-blue-700 font-bold">{{ srv.title }}</div>
          <div class="text-muted text-xs mt-0.5">{{ srv.category }}</div>
          <div class="text-brand-orange font-semibold text-sm mt-2">{{ srv.price_label }}</div>
        </button>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SectionHeader :title="comparisonTitle" :subtitle="comparisonSubtitle" />
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <label class="text-sm font-semibold text-muted">Sort by</label>
          <select v-model="sortBy" class="border-2 border-theme bg-surface text-primary px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-brand-blue-700 transition-all duration-200">
            <option value="price-asc">Lowest price</option>
            <option value="price-desc">Highest price</option>
            <option value="rating-desc">Best rating</option>
            <option value="turnaround">Fastest turnaround</option>
          </select>
        </div>
      </div>

      <div v-if="comparisonRows.length === 0" class="bg-surface border border-theme rounded-xl p-10 text-center">
        <div class="text-primary font-semibold">No providers found for this service</div>
        <div class="text-muted text-sm mt-2">Select another service or clear your search.</div>
      </div>

      <template v-else>
        <!-- Desktop table -->
        <div class="hidden lg:block bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm mb-8">
          <table class="w-full text-left">
            <thead class="bg-subtle border-b border-theme">
              <tr>
                <th class="p-4 text-xs font-semibold text-muted uppercase">Provider</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase">Rating</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase">Location</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase">Price</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase">Pickup fee</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase">Turnaround</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase" />
              </tr>
            </thead>
            <tbody class="divide-y divide-border-theme">
              <tr v-for="row in comparisonRows" :key="row.provider.id" class="hover:bg-subtle transition-colors" :class="{ 'bg-brand-blue-50': row.isCheapest }">
                <td class="p-4">
                  <div class="font-semibold text-primary">{{ row.provider.name }}</div>
                  <span v-if="row.isCheapest" class="inline-block mt-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Best price</span>
                </td>
                <td class="p-4">
                  <span class="font-bold text-brand-orange">{{ row.provider.rating }}</span>
                  <span class="text-muted text-xs ml-1">({{ row.provider.review_count }})</span>
                </td>
                <td class="p-4 text-sm text-muted">{{ row.provider.location }}</td>
                <td class="p-4">
                  <span class="font-bold text-primary">KSh {{ row.offer.price }}</span>
                  <span class="text-muted text-xs block">{{ row.offer.unit }}</span>
                </td>
                <td class="p-4 text-sm text-muted">{{ row.provider.pickup_fee }}</td>
                <td class="p-4 text-sm text-muted">{{ row.offer.turnaround }}</td>
                <td class="p-4">
                  <NuxtLink
                    :to="row.bookHref"
                    class="inline-block bg-brand-orange text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90"
                  >Book</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
          <ProviderCompareCard
            v-for="row in comparisonRows"
            :key="row.provider.id"
            :provider="row.provider"
            :offer="row.offer"
            :service-title="selectedService?.title ?? 'Service'"
            :highlighted="row.isCheapest"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { services, providers, refreshCatalog, getProvidersForService, getServiceById, categories, loading } = useServices()

const searchQuery = ref(String(route.query.q ?? ''))
const activeCategory = ref<string>('All')
const selectedServiceId = ref<string>('')
const sortBy = ref<'price-asc' | 'price-desc' | 'rating-desc' | 'turnaround'>('price-asc')

watch(() => route.query.q, (q) => { if (typeof q === 'string') searchQuery.value = q })

onMounted(async () => {
  await refreshCatalog()
  if (services.value.length && !selectedServiceId.value) {
    selectedServiceId.value = services.value[0]?.id ?? ''
  }
})

// Fresh prices when returning from another tab or after provider updates
onActivated(async () => {
  await refreshCatalog()
})

const filteredServices = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return services.value.filter((srv) => {
    const matchesCategory = activeCategory.value === 'All' || srv.category === activeCategory.value
    const matchesSearch = !q ||
      srv.title.toLowerCase().includes(q) ||
      srv.description.toLowerCase().includes(q) ||
      srv.category.toLowerCase().includes(q) ||
      providers.value.some((p) => p.name.toLowerCase().includes(q))
    return matchesCategory && matchesSearch
  })
})

watch(filteredServices, (list) => {
  if (list.length && !list.some((s) => s.id === selectedServiceId.value)) {
    selectedServiceId.value = list[0]?.id ?? ''
  }
})

const selectedService = computed(() => getServiceById(selectedServiceId.value))

const comparisonTitle = computed(() => `Compare providers - ${selectedService.value?.title ?? 'Service'}`)
const comparisonSubtitle = computed(() => {
  const n = comparisonRows.value.length
  return `${n} provider${n === 1 ? '' : 's'} offering this service · prices in KSh`
})

const comparisonRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let rows = getProvidersForService(selectedServiceId.value).map(({ provider, offer }) => ({
    provider,
    offer,
    priceNum: parseInt(offer.price.replace(/,/g, ''), 10) || 0,
    bookHref: `/order/new?provider=${provider.id}&service=${offer.service_id}`,
    isCheapest: false,
  }))

  if (q) {
    rows = rows.filter((r) =>
      r.provider.name.toLowerCase().includes(q) ||
      r.provider.location.toLowerCase().includes(q)
    )
  }

  const minPrice = rows.length ? Math.min(...rows.map((r) => r.priceNum)) : 0
  rows = rows.map((r) => ({ ...r, isCheapest: r.priceNum === minPrice && rows.length > 1 }))

  if (sortBy.value === 'price-asc') rows.sort((a, b) => a.priceNum - b.priceNum)
  else if (sortBy.value === 'price-desc') rows.sort((a, b) => b.priceNum - a.priceNum)
  else if (sortBy.value === 'rating-desc') rows.sort((a, b) => b.provider.rating - a.provider.rating)
  else rows.sort((a, b) => a.offer.turnaround.localeCompare(b.offer.turnaround))

  return rows
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>