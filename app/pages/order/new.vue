<template>
  <div class="min-h-screen transition-theme" style="background-color: var(--bg-base); color: var(--text-primary);">
    <div class="max-w-2xl mx-auto px-6 py-12">

      <!-- Back link -->
      <NuxtLink
        :to="backLink"
        class="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-opacity hover:opacity-70"
        style="color: var(--brand-blue);"
      >
        <Icon name="mdi:arrow-left" size="18" /> {{ backLabel }}
      </NuxtLink>

      <SectionHeader
        title="Book Your Pickup"
        subtitle="Fill in your details and confirm the booking"
      />

      <!-- Provider + Service info banner -->
      <div v-if="selectedProvider" class="rounded-2xl p-5 mb-8 flex items-center gap-4"
        style="background-color: var(--brand-blue-light); border: 1px solid var(--brand-blue);">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style="background-color: var(--brand-blue);">
          <Icon name="mdi:store" size="22" style="color: #fff;" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold" style="color: var(--brand-blue);">{{ selectedProvider.name }}</div>
          <div class="text-sm" style="color: var(--text-muted);">{{ selectedProvider.location }} · {{ selectedProvider.pickupFee }}</div>
        </div>
        <div v-if="selectedOffer" class="text-right shrink-0">
          <div class="font-bold" style="color: var(--brand-orange);">KSh {{ selectedOffer.price }}</div>
          <div class="text-xs" style="color: var(--text-muted);">{{ selectedOffer.unit }}</div>
        </div>
      </div>

      <form @submit.prevent="submitOrder"
        class="rounded-2xl p-8 space-y-6"
        style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">

        <!-- Provider (if not pre-filled, let user pick) -->
        <div v-if="!selectedProvider">
          <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">Provider</label>
          <select
            v-model="providerIdLocal"
            class="w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all outline-none"
            style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);"
          >
            <option value="">Select a provider…</option>
            <option v-for="p in allProviders" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <!-- Service type -->
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">Service Type</label>
          <select
            v-model="serviceType"
            class="w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all outline-none"
            style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);"
          >
            <option v-for="s in availableServices" :key="s.id" :value="s.id">
              {{ s.title }} — {{ s.price }}
            </option>
          </select>
        </div>

        <InputField
          label="Pickup Address"
          type="text"
          placeholder="e.g., 12 Green Street, Apt 4"
          v-model="pickupAddress"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Pickup Date" type="date" v-model="pickupDate" />
          <InputField label="Pickup Time" type="time" v-model="pickupTime" />
        </div>

        <InputField
          label="Your Name"
          type="text"
          placeholder="Full name"
          v-model="customerName"
        />

        <InputField
          label="Phone Number"
          type="tel"
          placeholder="+254 7XX XXX XXX"
          v-model="customerPhone"
        />

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
          <AppButton label="Confirm Booking" variant="primary" type="submit" />
          <AppButton
            label="Cancel"
            variant="outline"
            type="button"
            @click="$router.back()"
          />
        </div>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { HARDCODED_LAUNDRY_PROVIDERS } from '~/data/customerProviders'
import { HARDCODED_LAUNDRY_SERVICES } from '~/data/customerServices'
import { usePlatform } from '~/composables/usePlatform'
import { useAuth } from '~/composables/useAuth'

const route  = useRoute()
const router = useRouter()
const { createOrder } = usePlatform()
const { userName } = useAuth()

const allProviders = HARDCODED_LAUNDRY_PROVIDERS

// Read query params
const queryProviderId = computed(() => String(route.query.provider ?? ''))
const queryServiceId  = computed(() => String(route.query.service  ?? ''))

// Local state for when not pre-filled
const providerIdLocal = ref(queryProviderId.value)

// Resolve the active provider (query param wins, fallback to local selection)
const resolvedProviderId = computed(() => queryProviderId.value || providerIdLocal.value)
const selectedProvider   = computed(() => allProviders.find(p => p.id === resolvedProviderId.value) ?? null)

// Services available from selected provider, or all services if no provider
const availableServices = computed(() => {
  if (selectedProvider.value) {
    return selectedProvider.value.offers
      .map(o => HARDCODED_LAUNDRY_SERVICES.find(s => s.id === o.serviceId))
      .filter(Boolean) as typeof HARDCODED_LAUNDRY_SERVICES
  }
  return HARDCODED_LAUNDRY_SERVICES
})

// Pre-select service from query param or first available
const serviceType = ref(queryServiceId.value || availableServices.value[0]?.id || 'wash-fold')
watch(availableServices, list => {
  if (!list.some(s => s.id === serviceType.value) && list[0]) {
    serviceType.value = list[0].id
  }
})

const selectedOffer = computed(() =>
  selectedProvider.value?.offers.find(o => o.serviceId === serviceType.value) ?? null
)
const selectedService = computed(() =>
  HARDCODED_LAUNDRY_SERVICES.find(s => s.id === serviceType.value) ?? null
)

// Form fields
const pickupAddress = ref('')
const pickupDate    = ref('')
const pickupTime    = ref('')
const customerName  = ref(userName.value || '')
const customerPhone = ref('')
const formError     = ref('')

// Back navigation
const backLink  = computed(() => queryProviderId.value ? `/providers/${queryProviderId.value}` : '/browse')
const backLabel = computed(() => selectedProvider.value ? `Back to ${selectedProvider.value.name}` : 'Back to Browse')

const submitOrder = () => {
  formError.value = ''
  if (!resolvedProviderId.value) { formError.value = 'Please select a provider.'; return }
  if (!pickupAddress.value)      { formError.value = 'Please enter your pickup address.'; return }
  if (!pickupDate.value)         { formError.value = 'Please choose a pickup date.'; return }
  if (!pickupTime.value)         { formError.value = 'Please choose a pickup time.'; return }
  if (!customerName.value)       { formError.value = 'Please enter your name.'; return }

  const provider  = selectedProvider.value!
  const service   = selectedService.value
  const offer     = selectedOffer.value

  const id = createOrder({
    provider:       provider.name,
    customerName:   customerName.value,
    customerPhone:  customerPhone.value || '+254 7XX XXX XXX',
    providerPhone:  '+254 700 111 222',
    pickupDate:     pickupDate.value,
    pickupTime:     pickupTime.value,
    pickupAddress:  pickupAddress.value,
    totalEstimate:  offer ? `KSh ${offer.price}` : 'KSh —',
    services: [
      {
        title:       service?.title       ?? serviceType.value,
        price:       offer  ? `KSh ${offer.price}` : '—',
        description: service?.description ?? `${serviceType.value} service`,
      },
    ],
  })

  router.push(`/customer/order/${id}`)
}

definePageMeta({ layout: 'default' })
</script>