<template>
  <div class="browse-page min-h-screen pt-6">
    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="mb-12">
        <h1 class="text-4xl font-bold mb-2" style="color: var(--brand-blue);">Browse Providers</h1>
        <p class="text-muted">Find the perfect laundry service for your needs</p>
      </div>

      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
        <div class="flex-1 md:max-w-sm">
          <InputField
            label="Search providers"
            type="text"
            placeholder="e.g., Sunshine, North End…"
            v-model="query"
          />
        </div>
        <div class="results-badge text-sm">
          Showing {{ filteredProviders.length }} provider{{ filteredProviders.length === 1 ? '' : 's' }}
        </div>
      </div>

      <div v-if="filteredProviders.length === 0" class="text-center py-20">
        <Icon name="mdi:store-search" size="48" style="color: var(--text-muted);" class="mb-3" />
        <div class="font-bold mb-1" style="color: var(--brand-blue);">No providers match your search</div>
        <div class="text-sm" style="color: var(--text-muted);">Try a different name or location.</div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProviderCard
          v-for="p in filteredProviders"
          :key="p.id"
          :name="p.name"
          :location="p.location"
          :rating="p.rating"
          :services="getProviderServices(p.id).map(ps => ps.service?.title ?? '')"
          :to="`/customer/providers/${p.id}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { providers, providerServices, refreshCatalog, loading } = useServices()
const query = ref('')

onMounted(() => {
  refreshCatalog()
})

const getProviderServices = (providerId: string) => 
  providerServices.value.filter(ps => ps.provider_id === providerId)

const filteredProviders = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return providers.value
  return providers.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.location.toLowerCase().includes(q)
  )
})

definePageMeta({ layout: 'dashboard' })
</script>

<style scoped>
.browse-page {
  background-color: var(--bg-base);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.results-badge {
  background-color: var(--bg-surface);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>
