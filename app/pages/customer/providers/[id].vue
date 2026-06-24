<template>
  <div class="min-h-screen transition-theme" style="background-color: var(--bg-base); color: var(--text-primary);">
    <div class="max-w-5xl mx-auto px-6 py-10">

      <!-- Back -->
      <NuxtLink to="/customer/browse"
        class="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-opacity hover:opacity-70"
        style="color: var(--brand-blue);">
        <Icon name="mdi:arrow-left" size="18" /> Back to Providers
      </NuxtLink>

      <!-- Provider not found -->
      <div v-if="!provider" class="text-center py-24">
        <Icon name="mdi:store-off" size="48" style="color: var(--text-muted);" class="mb-4" />
        <div class="text-xl font-bold mb-2" style="color: var(--brand-blue);">Provider not found</div>
        <NuxtLink to="/customer/browse" class="text-sm font-semibold" style="color: var(--brand-orange);">Browse all providers →</NuxtLink>
      </div>

      <template v-else>

        <!-- Hero card -->
        <div class="rounded-2xl p-8 mb-8"
          style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

            <!-- Left: identity -->
            <div class="flex gap-5 items-start">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style="background-color: var(--brand-blue-light);">
                <Icon name="mdi:store" size="32" style="color: var(--brand-blue);" />
              </div>
              <div>
                <h1 class="text-3xl font-bold mb-1" style="color: var(--brand-blue);">{{ provider.name }}</h1>
                <div class="flex items-center gap-2 text-sm mb-3" style="color: var(--text-muted);">
                  <Icon name="mdi:map-marker" size="16" />
                  <span>{{ provider.location }}</span>
                </div>
                <div class="flex flex-wrap gap-3">
                  <!-- Rating -->
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
                    style="background-color: var(--brand-blue-light); color: var(--brand-blue);">
                    <Icon name="mdi:star" size="16" style="color: #fbbf24;" />
                    {{ provider.rating }}
                    <span class="font-normal text-xs" style="color: var(--text-muted);">({{ provider.review_count }} reviews)</span>
                  </div>
                  <!-- Pickup fee -->
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style="background-color: var(--bg-subtle); color: var(--text-muted); border: 1px solid var(--border-color);">
                    <Icon name="mdi:truck-delivery-outline" size="16" />
                    {{ provider.pickup_fee }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: quick book CTA -->
            <button
              @click="scrollToServices"
              class="shrink-0 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 flex items-center gap-2"
              style="background-color: var(--brand-orange);">
              <Icon name="mdi:calendar-check" size="18" />
              Book a Service
            </button>
          </div>
        </div>

        <!-- Services grid -->
        <div id="services-section" class="mb-8">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--brand-blue);">Available Services</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="offer in offers"
              :key="offer.service_id"
              class="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              :style="selectedServiceId === offer.service_id
                ? 'background-color: var(--brand-blue-light); border: 2px solid var(--brand-blue); box-shadow: var(--shadow-md);'
                : 'background-color: var(--bg-surface); border: 2px solid var(--border-color); box-shadow: var(--shadow-sm);'"
              @click="selectedServiceId = offer.service_id"
            >
              <div class="flex items-start justify-between gap-4 mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    :style="selectedServiceId === offer.service_id
                      ? 'background-color: var(--brand-blue); '
                      : 'background-color: var(--bg-subtle);'">
                    <Icon :name="serviceIcon(offer.service_id)" size="20"
                      :style="selectedServiceId === offer.service_id ? 'color: #fff;' : 'color: var(--brand-blue);'" />
                  </div>
                  <div>
                    <div class="font-bold" :style="selectedServiceId === offer.service_id ? 'color: var(--brand-blue);' : 'color: var(--text-primary);'">
                      {{ offer.service?.title }}
                    </div>
                    <div class="text-xs" style="color: var(--text-muted);">{{ offer.service?.description }}</div>
                  </div>
                </div>
                <!-- Selected checkmark -->
                <div v-if="selectedServiceId === offer.service_id"
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style="background-color: var(--brand-blue);">
                  <Icon name="mdi:check" size="14" style="color: #fff;" />
                </div>
              </div>

              <div class="flex items-center justify-between mt-4">
                <div>
                  <div class="font-bold text-lg" style="color: var(--brand-orange);">KSh {{ offer.price }}</div>
                  <div class="text-xs" style="color: var(--text-muted);">{{ offer.unit }} · {{ offer.turnaround }}</div>
                </div>
                <NuxtLink
                  :to="`/order/new?provider=${provider.id}&service=${offer.service_id}`"
                  class="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  style="background-color: var(--brand-orange);"
                  @click.stop
                >
                  Book
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Book selected service CTA banner -->
        <Transition name="slide-up">
          <div v-if="selectedServiceId"
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl"
            style="background-color: var(--brand-blue); color: #fff; min-width: 320px; max-width: 600px;">
            <div class="flex-1 min-w-0">
              <div class="font-bold truncate">{{ offers.find(o => o.service_id === selectedServiceId)?.service?.title }}</div>
              <div class="text-xs opacity-80">with {{ provider.name }}</div>
            </div>
            <NuxtLink
              :to="`/order/new?provider=${provider.id}&service=${selectedServiceId}`"
              class="shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:opacity-90"
              style="background-color: var(--brand-orange); color: #fff;">
              Book Now →
            </NuxtLink>
          </div>
        </Transition>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { providers, providerServices, refreshCatalog } = useServices()

onMounted(() => {
  refreshCatalog()
})

watch(() => route.params.id, () => {
  refreshCatalog()
})

const provider = computed(() =>
  providers.value.find(p => p.id === route.params.id)
)

const offers = computed(() => 
  providerServices.value.filter(ps => ps.provider_id === route.params.id)
)

const selectedServiceId = ref<string>('')

// Pre-select first service when provider loads
watchEffect(() => {
  if (offers.value.length && !selectedServiceId.value) {
    selectedServiceId.value = offers.value[0]?.service_id ?? ''
  }
})

const scrollToServices = () => {
  document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })
}

const serviceIcon = (id: string) => {
  const icons: Record<string, string> = {
    'wash-fold':      'mdi:washing-machine',
    'ironing':        'mdi:iron',
    'dry-cleaning':   'mdi:tshirt-crew',
    'delicate-care':  'mdi:flower',
    'stain-removal':  'mdi:water-off',
    'curtain-cleaning':'mdi:window-open',
    'blanket-cleaning':'mdi:bed',
    'eco-wash':       'mdi:leaf',
  }
  return icons[id] ?? 'mdi:water'
}

useHead({ title: computed(() => provider.value ? `${provider.value.name} – EcoFluffa` : 'Provider – EcoFluffa') })
definePageMeta({ layout: 'default', middleware: ['auth', 'role'] })
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translate(-50%, 20px); }
.slide-up-enter-to, .slide-up-leave-from { opacity: 1; transform: translate(-50%, 0); }
</style>
