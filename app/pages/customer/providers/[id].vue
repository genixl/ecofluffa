<template>
  <div class="min-h-screen transition-theme" style="background-color: var(--bg-base); color: var(--text-primary);">
    <div class="max-w-5xl mx-auto px-6 py-10">

      <NuxtLink to="/customer/browse"
        class="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-opacity hover:opacity-70"
        style="color: var(--brand-blue);">
        <Icon name="mdi:arrow-left" size="18" /> Back to Providers
      </NuxtLink>

      <div v-if="!provider" class="text-center py-24">
        <Icon name="mdi:store-off" size="48" style="color: var(--text-muted);" class="mb-4" />
        <div class="text-xl font-bold mb-2" style="color: var(--brand-blue);">Provider not found</div>
        <NuxtLink to="/customer/browse" class="text-sm font-semibold" style="color: var(--brand-orange);">Browse all providers →</NuxtLink>
      </div>

      <template v-else>

        <div class="rounded-2xl p-8 mb-8"
          style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div class="flex gap-5 items-start">
              <ProviderAvatar
                :photoUrl="provider.photo_url"
                :name="provider.name"
                :size="256"
                rounded="1rem"
              />
              <div>
                <h1 class="text-3xl font-bold mb-1" style="color: var(--brand-blue);">{{ provider.name }}</h1>
                <div class="flex items-center gap-2 text-sm mb-3" style="color: var(--text-muted);">
                  <Icon name="mdi:map-marker" size="16" />
                  <span>{{ provider.location }}</span>
                </div>
                <div class="flex flex-wrap gap-3">
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
                    style="background-color: var(--brand-blue-light); color: var(--brand-blue);">
                    <Icon name="mdi:star" size="16" style="color: #fbbf24;" />
                    {{ provider.rating }}
                    <span class="font-normal text-xs" style="color: var(--text-muted);">({{ provider.review_count }} reviews)</span>
                  </div>
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style="background-color: var(--bg-subtle); color: var(--text-muted); border: 1px solid var(--border-color);">
                    <Icon name="mdi:truck-delivery-outline" size="16" />
                    {{ provider.pickup_fee }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="services-section" class="mb-24">
          <h2 class="text-2xl font-bold mb-2" style="color: var(--brand-blue);">Available Services</h2>
          <p class="text-sm mb-6" style="color: var(--text-muted);">Tap a service to select it, then book using the button below.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              v-for="offer in offers"
              :key="offer.service_id"
              type="button"
              class="rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-0.5"
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
                <div v-if="selectedServiceId === offer.service_id"
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style="background-color: var(--brand-blue);">
                  <Icon name="mdi:check" size="14" style="color: #fff;" />
                </div>
              </div>

              <div class="mt-4">
                <div class="font-bold text-lg" style="color: var(--brand-orange);">KSh {{ offer.price }}</div>
                <div class="text-xs" style="color: var(--text-muted);">{{ offer.unit }} · {{ offer.turnaround }}</div>
              </div>
            </button>
          </div>
        </div>

        <Transition name="slide-up">
          <div v-if="selectedServiceId"
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl w-[min(100%-2rem,600px)]"
            style="background-color: var(--brand-blue); color: #fff;">
            <div class="flex-1 min-w-0">
              <div class="font-bold truncate">{{ selectedOffer?.service?.title }}</div>
              <div class="text-xs opacity-80">KSh {{ selectedOffer?.price }} {{ selectedOffer?.unit }} · {{ provider.name }}</div>
            </div>
            <NuxtLink
              :to="bookHref"
              class="shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:opacity-90 whitespace-nowrap"
              style="background-color: var(--brand-orange); color: #fff;">
              Book Now
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

watchEffect(() => {
  if (offers.value.length && !selectedServiceId.value) {
    selectedServiceId.value = offers.value[0]?.service_id ?? ''
  }
})

const selectedOffer = computed(() =>
  offers.value.find(o => o.service_id === selectedServiceId.value)
)

const bookHref = computed(() =>
  `/order/new?provider=${provider.value?.id}&service=${selectedServiceId.value}`
)

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
