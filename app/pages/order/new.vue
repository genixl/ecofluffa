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

      <SectionHeader title="Book Your Pickup" subtitle="Your profile details are pre-filled below-confirm and book" />

      <div v-if="loadingData" class="text-center py-12 text-muted">Loading…</div>

      <template v-else>
        <div v-if="selectedProvider" class="rounded-2xl p-5 mb-8 flex items-center gap-4"
          style="background-color: var(--brand-blue-light); border: 1px solid var(--brand-blue);">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background-color: var(--brand-blue);">
            <Icon name="mdi:store" size="22" style="color: #fff;" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold" style="color: var(--brand-blue);">{{ selectedProvider.name }}</div>
            <div class="text-sm" style="color: var(--text-muted);">{{ selectedProvider.location }} · {{ selectedProvider.pickup_fee }}</div>
          </div>
        </div>

        <form @submit.prevent="submitOrder"
          class="rounded-2xl p-8 space-y-6"
          style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">

          <div v-if="!selectedProvider">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">Provider</label>
            <select v-model="providerIdLocal"
              class="w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all outline-none"
              style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);">
              <option value="">Select a provider…</option>
              <option v-for="p in allProviders" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <!-- Selected services -->
          <div>
            <label class="block text-sm font-semibold mb-3" style="color: var(--text-primary);">Your Services</label>

            <div v-if="bookedServices.length === 0" class="text-muted text-sm py-4 rounded-xl px-4"
              style="background-color: var(--bg-subtle); border: 1px dashed var(--border-color);">
              No service selected yet. Choose one below or use "Add Another Service".
            </div>

            <div v-else class="space-y-3 mb-4">
              <div
                v-for="entry in bookedServices"
                :key="entry.service_id"
                class="flex items-center gap-3 p-4 rounded-xl border"
                style="background-color: var(--brand-blue-light); border-color: var(--brand-blue);"
              >
                <div class="flex-1 min-w-0">
                  <div class="font-semibold" style="color: var(--brand-blue);">{{ entry.service?.service?.title }}</div>
                  <div class="text-xs mt-0.5" style="color: var(--text-muted);">
                    KSh {{ entry.service?.price }} {{ entry.service?.unit }}
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <label class="text-xs font-medium" style="color: var(--text-muted);">Qty</label>
                  <input
                    type="number"
                    min="1"
                    :value="entry.quantity"
                    @input="setServiceQuantity(entry.service_id, $event)"
                    class="w-16 px-2 py-1.5 rounded-lg text-sm border text-center"
                    style="background-color: var(--bg-surface); border-color: var(--border-color); color: var(--text-primary);"
                  />
                </div>
                <button
                  v-if="bookedServices.length > 1"
                  type="button"
                  class="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                  style="background-color: var(--bg-surface); color: #ef4444; border: 1px solid var(--border-color);"
                  title="Remove service"
                  @click="removeService(entry.service_id)"
                >
                  <Icon name="mdi:close" size="16" />
                </button>
              </div>
            </div>

            <button
              v-if="!showAddService"
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style="background-color: var(--bg-subtle); color: var(--brand-blue); border: 1px solid var(--border-color);"
              @click="showAddService = true"
            >
              <Icon name="mdi:plus-circle-outline" size="18" />
              Add Another Service
            </button>

            <div v-else class="rounded-xl p-4 mt-2" style="background-color: var(--bg-subtle); border: 1px solid var(--border-color);">
              <label class="block text-xs font-semibold mb-2" style="color: var(--text-muted);">Choose a service to add</label>
              <div class="flex gap-2">
                <select
                  v-model="serviceToAdd"
                  class="flex-1 px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style="background-color: var(--bg-surface); border-color: var(--border-color); color: var(--text-primary);"
                >
                  <option value="">Select a service…</option>
                  <option
                    v-for="s in servicesNotYetAdded"
                    :key="s.service_id"
                    :value="s.service_id"
                  >
                    {{ s.service?.title }}-KSh {{ s.price }} {{ s.unit }}
                  </option>
                </select>
                <AppButton label="Add" variant="primary" type="button" :disabled="!serviceToAdd" @click="addAnotherService" />
                <AppButton label="Cancel" variant="outline" type="button" @click="showAddService = false" />
              </div>
            </div>
          </div>

          <!-- Contact from profile -->
          <div class="rounded-xl p-4" style="background-color: var(--bg-subtle); border: 1px solid var(--border-color);">
            <div class="text-xs font-bold uppercase tracking-wide mb-3" style="color: var(--brand-blue);">Your contact details</div>
            <p class="text-xs mb-3" style="color: var(--text-muted);">Taken from your profile-visible to the provider with this order.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" type="text" placeholder="Your full name" v-model="customerName" />
              <InputField label="Phone Number" type="tel" placeholder="+254 7XX XXX XXX" v-model="customerPhone" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">
              Pickup Address
            </label>

            <div v-if="addresses.length" class="mb-3">
              <label class="block text-xs font-medium mb-1.5" style="color: var(--text-muted);">Use a saved address</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="addr in addresses"
                  :key="addr.id"
                  type="button"
                  @click="pickupAddress = addr.address"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                  :style="pickupAddress === addr.address
                    ? 'background-color: var(--brand-blue); color: #fff; border-color: var(--brand-blue);'
                    : 'background-color: var(--bg-subtle); color: var(--text-primary); border-color: var(--border-color);'"
                >
                  <Icon name="mdi:map-marker" size="13" />
                  {{ addr.label || addr.address.split(',')[0] }}
                  <span v-if="addr.is_default" class="opacity-70">(default)</span>
                </button>
              </div>
            </div>

            <div class="flex gap-2">
              <input
                id="pickup-address-input"
                v-model="pickupAddress"
                type="text"
                placeholder="e.g., 12 Green Street, Apt 4, Nairobi"
                class="flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all outline-none"
                style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);"
              />
              <a
                v-if="pickupAddress.trim()"
                :href="mapsUrl(pickupAddress)"
                target="_blank"
                rel="noopener noreferrer"
                title="Verify location on Google Maps"
                class="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold shrink-0 transition-all hover:opacity-90"
                style="background-color: var(--brand-blue); color: #fff;"
              >
                <Icon name="mdi:map-search" size="16" />
                Verify
              </a>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Pickup Date" type="date" v-model="pickupDate" />
            <InputField label="Pickup Time" type="time" v-model="pickupTime" />
          </div>

          <InputField
            label="Pickup notes (optional)"
            type="text"
            placeholder="Gate code, landmarks, special instructions…"
            v-model="pickupNotes"
          />

          <div v-if="formError" class="text-red-500 text-sm font-medium">{{ formError }}</div>

          <div v-if="bookedServices.length > 0" class="rounded-xl p-4 flex items-center justify-between"
            style="background-color: var(--bg-subtle); border: 1px solid var(--border-color);">
            <div>
              <div class="text-sm font-semibold" style="color: var(--text-primary);">Estimated Total</div>
              <div class="text-xs" style="color: var(--text-muted);">{{ bookedServices.length }} service{{ bookedServices.length > 1 ? 's' : '' }}</div>
            </div>
            <div class="font-bold text-xl" style="color: var(--brand-orange);">KSh {{ totalCost }}</div>
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
import type { ProviderService } from '~/types/supabase'

const route = useRoute()
const router = useRouter()
const { createOrder } = usePlatform()
const { profile } = useAuth()
const { providers, providerServices, fetchAll } = useServices()
const { addresses, mapsUrl, fetchAddresses, defaultAddress } = useAddresses()
const { success } = useToast()

const loadingData = ref(true)
const submitting = ref(false)
const formError = ref('')
const showAddService = ref(false)
const serviceToAdd = ref('')

const queryProviderId = computed(() => String(route.query.provider ?? ''))
const queryServiceId = computed(() => String(route.query.service ?? ''))

const providerIdLocal = ref(queryProviderId.value)
const resolvedProviderId = computed(() => queryProviderId.value || providerIdLocal.value)

const allProviders = computed(() => providers.value)
const selectedProvider = computed(() => providers.value.find((p) => p.id === resolvedProviderId.value) ?? null)

const availableServices = computed(() => {
  if (!resolvedProviderId.value) return []
  return providerServices.value.filter((ps) => ps.provider_id === resolvedProviderId.value)
})

interface BookedEntry {
  service_id: string
  quantity: number
  service: ProviderService | undefined
}

const bookedServices = ref<BookedEntry[]>([])

const initFromQuery = () => {
  const list = availableServices.value
  if (!list.length) return

  const initialId = queryServiceId.value && list.some((s) => s.service_id === queryServiceId.value)
    ? queryServiceId.value
    : list[0]?.service_id

  if (initialId && !bookedServices.value.some((b) => b.service_id === initialId)) {
    bookedServices.value = [{
      service_id: initialId,
      quantity: 1,
      service: list.find((s) => s.service_id === initialId),
    }]
  }
}

watch(availableServices, () => {
  if (!bookedServices.value.length) initFromQuery()
})

const servicesNotYetAdded = computed(() =>
  availableServices.value.filter(
    (s) => !bookedServices.value.some((b) => b.service_id === s.service_id)
  )
)

const addAnotherService = () => {
  if (!serviceToAdd.value) return
  const svc = availableServices.value.find((s) => s.service_id === serviceToAdd.value)
  if (!svc) return
  bookedServices.value.push({ service_id: serviceToAdd.value, quantity: 1, service: svc })
  serviceToAdd.value = ''
  showAddService.value = false
}

const removeService = (serviceId: string) => {
  bookedServices.value = bookedServices.value.filter((b) => b.service_id !== serviceId)
}

const setServiceQuantity = (serviceId: string, event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value, 10) || 1
  const entry = bookedServices.value.find((b) => b.service_id === serviceId)
  if (entry) entry.quantity = Math.max(1, value)
}

const totalCost = computed(() => {
  let total = 0
  for (const entry of bookedServices.value) {
    const price = parseInt(entry.service?.price.replace(/,/g, '') ?? '0', 10) || 0
    total += price * entry.quantity
  }
  return total.toLocaleString()
})

const pickupAddress = ref('')
const pickupDate = ref('')
const pickupTime = ref('')
const pickupNotes = ref('')
const customerName = ref('')
const customerPhone = ref('')

watch(profile, (p) => {
  if (!p) return
  if (!customerName.value) customerName.value = p.full_name
  if (!customerPhone.value) customerPhone.value = p.phone || p.alternate_phone
  if (!pickupNotes.value) pickupNotes.value = p.preferred_pickup_notes
}, { immediate: true })

const backLink = computed(() => queryProviderId.value ? `/customer/providers/${queryProviderId.value}` : '/customer/browse')
const backLabel = computed(() => selectedProvider.value ? `Back to ${selectedProvider.value.name}` : 'Back to Browse')

onMounted(async () => {
  await Promise.all([fetchAll(), fetchAddresses()])
  initFromQuery()
  if (!pickupAddress.value && defaultAddress.value) {
    pickupAddress.value = defaultAddress.value.address
  }
  loadingData.value = false
})

const submitOrder = async () => {
  formError.value = ''
  if (!resolvedProviderId.value) { formError.value = 'Please select a provider.'; return }
  if (bookedServices.value.length === 0) { formError.value = 'Please add at least one service.'; return }
  if (!customerName.value.trim()) { formError.value = 'Please enter your name.'; return }
  if (!customerPhone.value.trim()) { formError.value = 'Please enter your phone number.'; return }
  if (!pickupAddress.value) { formError.value = 'Please enter your pickup address.'; return }
  if (!pickupDate.value) { formError.value = 'Please choose a pickup date.'; return }
  if (!pickupTime.value) { formError.value = 'Please choose a pickup time.'; return }

  submitting.value = true

  const servicesArray = bookedServices.value.map((entry) => {
    const quantity = entry.quantity
    const price = parseInt(entry.service?.price.replace(/,/g, '') ?? '0', 10) * quantity
    return {
      title: entry.service?.service?.title ?? entry.service_id,
      price: `KSh ${price}`,
      description: entry.service?.service?.description ?? '',
    }
  })

  const id = await createOrder({
    provider_id: resolvedProviderId.value,
    pickup_date: pickupDate.value,
    pickup_time: pickupTime.value,
    pickup_address: pickupAddress.value,
    customer_name: customerName.value.trim(),
    customer_phone: customerPhone.value.trim(),
    notes: pickupNotes.value.trim(),
    total_estimate: `KSh ${totalCost.value}`,
    services: servicesArray,
  })

  submitting.value = false
  if (!id) { formError.value = 'Failed to place order. The provider may not be approved yet-please try again or choose another provider.'; return }
  success('Booking confirmed! Your provider will be notified.')
  router.push(`/customer/order/${id}`)
}

definePageMeta({ layout: 'default', middleware: ['auth'] })
</script>
