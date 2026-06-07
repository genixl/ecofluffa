<template>
  <div class="min-h-screen transition-theme" style="background-color: var(--bg-base); color: var(--text-primary);">
    <div class="max-w-2xl mx-auto px-6 py-12">

      <NuxtLink
        :to="backLink"
        class="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-opacity hover:opacity-70"
        style="color: var(--brand-blue);"
      >
        <Icon name="mdi:arrow-left" size="18" /> {{ backLabel }}
      </NuxtLink>

      <SectionHeader title="Book Your Pickup" subtitle="Fill in your details and confirm the booking" />

      <div v-if="loadingData" class="text-center py-12 text-muted">Loading…</div>

      <template v-else>
        <!-- Provider + Service info banner -->
        <div v-if="selectedProvider" class="rounded-2xl p-5 mb-8 flex items-center gap-4"
          style="background-color: var(--brand-blue-light); border: 1px solid var(--brand-blue);">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background-color: var(--brand-blue);">
            <Icon name="mdi:store" size="22" style="color: #fff;" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold" style="color: var(--brand-blue);">{{ selectedProvider.name }}</div>
            <div class="text-sm" style="color: var(--text-muted);">{{ selectedProvider.location }} · {{ selectedProvider.pickup_fee }}</div>
          </div>
          <div v-if="selectedOffer" class="text-right shrink-0">
            <div class="font-bold" style="color: var(--brand-orange);">KSh {{ selectedOffer.price }}</div>
            <div class="text-xs" style="color: var(--text-muted);">{{ selectedOffer.unit }}</div>
          </div>
        </div>

        <form @submit.prevent="submitOrder"
          class="rounded-2xl p-8 space-y-6"
          style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">

          <!-- Provider picker if not pre-filled -->
          <div v-if="!selectedProvider">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">Provider</label>
            <select v-model="providerIdLocal"
              class="w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all outline-none"
              style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);">
              <option value="">Select a provider…</option>
              <option v-for="p in allProviders" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <!-- Service type -->
          <div>
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">Service Type</label>
            <select v-model="serviceId"
              class="w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all outline-none"
              style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);">
              <option v-for="s in availableServices" :key="s.service_id" :value="s.service_id">
                {{ s.service?.title }} — KSh {{ s.price }} {{ s.unit }}
              </option>
            </select>
          </div>

          <InputField label="Pickup Address" type="text" placeholder="e.g., 12 Green Street, Apt 4" v-model="pickupAddress" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Pickup Date" type="date" v-model="pickupDate" />
            <InputField label="Pickup Time" type="time" v-model="pickupTime" />
          </div>

          <InputField label="Phone Number" type="tel" placeholder="+254 7XX XXX XXX" v-model="customerPhone" />

          <div v-if="formError" class="text-red-500 text-sm font-medium">{{ formError }}</div>

          <!-- Price estimate -->
          <div v-if="selectedOffer" class="rounded-xl p-4 flex items-center justify-between"
            style="background-color: var(--bg-subtle); border: 1px solid var(--border-color);">
            <div>
              <div class="text-sm font-semibold" style="color: var(--text-primary);">Estimated Cost</div>
              <div class="text-xs" style="color: var(--text-muted);">{{ selectedOffer.unit }} · turnaround {{ selectedOffer.turnaround }}</div>
            </div>
            <div class="font-bold text-xl" style="color: var(--brand-orange);">KSh {{ selectedOffer.price }}</div>
          </div>

          <div class="flex gap-4 pt-2">
            <AppButton :label="submitting ? 'Booking…' : 'Confirm Booking'" variant="primary" type="submit" :disabled="submitting" />
            <AppButton label="Cancel" variant="outline" type="button" @click="$router.back()" />
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { createOrder } = usePlatform()
const { profile } = useAuth()
const { providers, providerServices, fetchAll } = useServices()

const loadingData = ref(true)
const submitting = ref(false)
const formError = ref('')

const queryProviderId = computed(() => String(route.query.provider ?? ''))
const queryServiceId = computed(() => String(route.query.service ?? ''))

const providerIdLocal = ref(queryProviderId.value)
const resolvedProviderId = computed(() => queryProviderId.value || providerIdLocal.value)

const allProviders = computed(() => providers.value)
const selectedProvider = computed(() => providers.value.find((p) => p.id === resolvedProviderId.value) ?? null)

const availableServices = computed(() => {
  if (!resolvedProviderId.value) return []
  return providerServices.value
    .filter((ps) => ps.provider_id === resolvedProviderId.value)
})

const serviceId = ref(queryServiceId.value)
watch(availableServices, (list) => {
  if (list.length && !list.some((s) => s.service_id === serviceId.value)) {
    serviceId.value = list[0]?.service_id ?? ''
  }
})

const selectedOffer = computed(() =>
  availableServices.value.find((s) => s.service_id === serviceId.value) ?? null
)

// Form fields
const pickupAddress = ref('')
const pickupDate = ref('')
const pickupTime = ref('')
const customerPhone = ref(profile.value?.phone ?? '')

const backLink = computed(() => queryProviderId.value ? `/customer/providers/${queryProviderId.value}` : '/customer/browse')
const backLabel = computed(() => selectedProvider.value ? `Back to ${selectedProvider.value.name}` : 'Back to Browse')

onMounted(async () => {
  await fetchAll()
  if (!serviceId.value && availableServices.value.length) {
    serviceId.value = availableServices.value[0]?.service_id ?? ''
  }
  loadingData.value = false
})

const submitOrder = async () => {
  formError.value = ''
  if (!resolvedProviderId.value) { formError.value = 'Please select a provider.'; return }
  if (!serviceId.value) { formError.value = 'Please select a service.'; return }
  if (!pickupAddress.value) { formError.value = 'Please enter your pickup address.'; return }
  if (!pickupDate.value) { formError.value = 'Please choose a pickup date.'; return }
  if (!pickupTime.value) { formError.value = 'Please choose a pickup time.'; return }

  submitting.value = true

  const offer = selectedOffer.value
  const svc = offer?.service

  const id = await createOrder({
    provider_id: resolvedProviderId.value,
    pickup_date: pickupDate.value,
    pickup_time: pickupTime.value,
    pickup_address: pickupAddress.value,
    total_estimate: offer ? `KSh ${offer.price} ${offer.unit}` : '—',
    services: [{
      title: svc?.title ?? serviceId.value,
      price: offer ? `KSh ${offer.price}` : '—',
      description: svc?.description ?? '',
    }],
  })

  submitting.value = false
  if (!id) { formError.value = 'Failed to place order. Please try again.'; return }
  router.push(`/customer/order/${id}`)
}

definePageMeta({ layout: 'default', middleware: ['auth'] })
</script>