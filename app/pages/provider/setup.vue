<template>
  <div>
    <div
      class="rounded-xl border-2 p-5 mb-8"
      style="border-color: var(--brand-orange); background-color: rgba(255, 107, 53, 0.08);"
    >
      <div class="flex items-start gap-3">
        <Icon name="mdi:alert-circle-outline" size="28" style="color: var(--brand-orange);" />
        <div>
          <div class="font-bold text-lg" style="color: var(--brand-blue);">Complete your provider profile</div>
          <p class="text-sm mt-1" style="color: var(--text-muted);">
            Customers cannot see your business until you fill in your details, add at least one service, and publish your listing.
          </p>
        </div>
      </div>
    </div>

    <div v-if="pageLoading" class="text-muted text-sm py-10 text-center">Loading…</div>

    <template v-else>
      <section class="bg-surface border border-theme rounded-xl p-6 mb-6 shadow-theme-sm">
        <SectionHeader title="Your contact details" subtitle="Shown on orders and messages" />
        <InputField label="Your full name" type="text" v-model="contactName" placeholder="Jane Doe" />
        <InputField label="Your phone" type="tel" v-model="contactPhone" placeholder="+254 7XX XXX XXX" />
        <div class="mt-2">
          <AppButton
            label="Save contact details"
            variant="outline"
            type="button"
            @click="savePersonal"
          />
        </div>
      </section>

      <section class="bg-surface border border-theme rounded-xl p-6 mb-6 shadow-theme-sm">
        <SectionHeader title="Business profile" subtitle="Public listing customers will browse" />
        <!-- Profile photo (optional) -->
        <div class="mb-5">
          <ProviderPhotoUpload
            v-model="photoUrl"
            :providerName="businessName || 'Provider'"
          />
        </div>
        <InputField label="Business name" type="text" v-model="businessName" placeholder="Ocean Breeze Laundry" />
        <InputField label="Location / area" type="text" v-model="location" placeholder="Riverside, Nairobi" />
        <InputField label="Business phone" type="tel" v-model="businessPhone" placeholder="+254 7XX XXX XXX" />
        <InputField label="Pickup fee label" type="text" v-model="pickupFee" placeholder="Free pickup" />
        <div class="mt-2">
          <AppButton label="Save business profile" variant="outline" type="button" @click="saveBusiness" />
        </div>
      </section>

      <section class="bg-surface border border-theme rounded-xl p-6 mb-6 shadow-theme-sm">
        <div class="flex items-end justify-between gap-4 mb-4">
          <SectionHeader
            title="Services you offer"
            subtitle="Add at least one service with price and turnaround"
          />
          <AppButton label="Add service" variant="primary" type="button" @click="openAdd" />
        </div>

        <div
          v-if="!editingId && catalogServices.length === 0"
          class="text-sm text-muted py-4 px-3 mb-4 rounded-lg border border-theme"
        >
          No services are available in the catalog yet. Ask your admin to seed the
          <code class="text-xs">services</code> table (run <code class="text-xs">fix-provider-setup.sql</code> in Supabase).
        </div>

        <div v-if="showForm" class="border border-theme rounded-xl p-5 mb-4">
          <div class="font-bold text-lg mb-1" style="color: var(--brand-blue);">
            {{ editingId ? 'Edit Service' : (isCustomService ? 'Add Custom Service' : 'Add Service from Catalog') }}
          </div>
          <div class="text-muted text-sm mb-4">
            {{ isCustomService
              ? 'Custom services are private to your account until an admin approves them.'
              : 'Choose from the shared platform catalog of default services.' }}
          </div>

          <div v-if="!editingId" class="mb-4">
            <div class="flex gap-3">
              <button
                @click="isCustomService = false"
                :class="['px-4 py-2 rounded-lg font-semibold text-sm transition-all', !isCustomService ? 'bg-brand-blue text-white' : 'bg-surface border-2 border-theme text-primary']"
              >
                From Catalog
              </button>
              <button
                @click="isCustomService = true"
                :class="['px-4 py-2 rounded-lg font-semibold text-sm transition-all', isCustomService ? 'bg-brand-blue text-white' : 'bg-surface border-2 border-theme text-primary']"
              >
                Custom Service
              </button>
            </div>
          </div>

          <div v-if="!editingId && !isCustomService" class="mb-4">
            <label class="block text-primary mb-2 font-semibold text-sm">Service</label>
            <select
              v-model="form.service_id"
              :disabled="!!editingId || availableToAdd.length === 0"
              class="w-full border-2 border-theme bg-surface text-primary px-4 py-3 rounded-lg"
            >
              <option value="">{{ availableToAdd.length ? 'Select a service…' : 'No services available' }}</option>
              <option v-for="s in availableToAdd" :key="s.id" :value="s.id">{{ s.title }}</option>
            </select>
          </div>

          <div v-if="!editingId && isCustomService" class="space-y-4 mb-4">
            <InputField label="Service Title" type="text" placeholder="e.g. Leather Jacket Cleaning" v-model="form.title" />
            <div>
              <label class="block text-primary mb-2 font-semibold text-sm">Category</label>
              <select v-model="form.category"
                class="w-full border-2 border-theme bg-surface text-primary px-4 py-3 rounded-lg focus:outline-none focus:border-brand-blue-700 transition-all">
                <option v-for="cat in categories.filter(c => c !== 'All')" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <InputField label="Description" type="text" placeholder="Brief description of the service" v-model="form.description" />
          </div>

          <InputField label="Price (KSh)" type="text" v-model="form.price" placeholder="195" />
          <InputField label="Unit" type="text" v-model="form.unit" placeholder="per kg" />
          <InputField label="Turnaround" type="text" v-model="form.turnaround" placeholder="24 hrs" />
          <div v-if="serviceError" class="text-red-500 text-sm mb-3">{{ serviceError }}</div>
          <div class="flex gap-3 mt-4">
            <AppButton
              :label="editingId ? 'Update' : 'Add'"
              variant="primary"
              type="button"
              :loading="savingService"
              :disabled="savingService"
              @click="saveService"
            />
            <AppButton label="Cancel" variant="outline" type="button" @click="closeForm" />
          </div>
        </div>

        <div v-if="myServices.length === 0" class="text-sm text-muted py-6 text-center">
          No services added yet, add at least one to publish.
        </div>
        <ul v-else class="space-y-3">
          <li
            v-for="ps in myServices"
            :key="ps.id"
            class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-theme"
          >
            <div>
              <div class="font-semibold" style="color: var(--brand-blue);">{{ ps.service?.title }}</div>
              <div class="text-sm text-muted">KSh {{ ps.price }} {{ ps.unit }} · {{ ps.turnaround }}</div>
            </div>
            <div class="flex gap-2">
              <AppButton label="Edit" variant="outline" type="button" @click="openEdit(ps)" />
              <AppButton label="Remove" variant="outline" type="button" @click="remove(ps.id)" />
            </div>
          </li>
        </ul>
      </section>

      <section class="bg-surface border border-theme rounded-xl p-6 shadow-theme-md">
        <SectionHeader title="Submit for admin approval" subtitle="An admin must approve your account before customers can see you or place orders" />
        <ul class="space-y-2 mb-6 text-sm">
          <li class="flex items-center gap-2" :style="checkStyle(hasContact)">
            <Icon :name="hasContact ? 'mdi:check-circle' : 'mdi:circle-outline'" size="20" />
            Contact name and phone saved
          </li>
          <li class="flex items-center gap-2" :style="checkStyle(businessComplete)">
            <Icon :name="businessComplete ? 'mdi:check-circle' : 'mdi:circle-outline'" size="20" />
            Business name, location, and phone completed
          </li>
          <li class="flex items-center gap-2" :style="checkStyle(myServices.length > 0)">
            <Icon :name="myServices.length ? 'mdi:check-circle' : 'mdi:circle-outline'" size="20" />
            At least one service added
          </li>
        </ul>

        <div v-if="provider?.approval_status === 'pending' && canPublish" class="rounded-lg p-4 mb-4 text-sm" style="background-color: var(--brand-blue-light); color: var(--brand-blue);">
          Your profile has been submitted. An admin will review and approve your account shortly.
        </div>

        <div v-if="publishError" class="text-red-500 text-sm mb-3">{{ publishError }}</div>

        <AppButton
          label="Submit profile for admin approval"
          variant="primary"
          type="button"
          :disabled="!canPublish || publishing || provider?.approval_status === 'pending'"
          :loading="publishing"
          @click="publish"
        />
        <p class="text-xs text-muted mt-3">
          Once approved, your business will appear to customers and you can receive orders. If disabled later, contact support to request restoration.
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ProviderService } from '~/types/supabase'
import { isProviderBusinessComplete } from '~/composables/useProviderProfile'
import { isCatalogService } from '~/types/supabase'

const { profile, ensureProviderLink, fetchProfile } = useAuth()
const {
  provider,
  myServices,
  catalogServices,
  fetchMyProvider,
  updatePersonalProfile,
  updateProvider,
  addService,
  updateService,
  removeService,
  submitForApproval,
  canPublish,
} = useProviderProfile()
const { createService, categories } = useServices()
const { success } = useToast()

const pageLoading = ref(true)
const publishing = ref(false)
const publishError = ref('')
const serviceError = ref('')
const savingService = ref(false)

const contactName = ref('')
const contactPhone = ref('')
const businessName = ref('')
const location = ref('')
const businessPhone = ref('')
const pickupFee = ref('Free pickup')
const photoUrl = ref<string | null>(null)

const showForm = ref(false)
const editingId = ref<string | null>(null)
const isCustomService = ref(false)
const form = ref({ service_id: '', price: '', unit: '', turnaround: '', title: '', category: 'Everyday', description: '' })

watch(profile, (p) => {
  if (!p) return
  contactName.value = p.full_name
  contactPhone.value = p.phone
}, { immediate: true })

watch(provider, (p) => {
  if (!p) return
  businessName.value = p.name
  location.value = p.location
  businessPhone.value = p.phone
  pickupFee.value = p.pickup_fee
  photoUrl.value = p.photo_url ?? null
}, { immediate: true })

const hasContact = computed(
  () => !!contactName.value.trim() && !!contactPhone.value.trim()
)
const businessComplete = computed(() =>
  isProviderBusinessComplete({
    id: provider.value?.id ?? '',
    name: businessName.value,
    location: location.value,
    phone: businessPhone.value,
    pickup_fee: pickupFee.value,
    rating: provider.value?.rating ?? 0,
    review_count: provider.value?.review_count ?? 0,
    is_listed: false,
    approval_status: 'pending',
    created_at: '',
  })
)

const availableToAdd = computed(() =>
  catalogServices.value.filter((s) => !myServices.value.some((ps) => ps.service_id === s.id))
)

const checkStyle = (done: boolean) =>
  done ? 'color: var(--brand-blue);' : 'color: var(--text-muted);'

/** Ensure provider link exists (fallback if it wasn't created during signup) */
const ensureProviderExists = async () => {
  if (profile.value?.provider_id) return true
  
  if (!profile.value?.id) return false
  
  // Try to ensure provider link exists
  const result = await ensureProviderLink(profile.value.id, profile.value.full_name || 'Provider')
  
  if (!result.success) {
    console.error('Provider link failed:', result.error)
    return false
  }
  
  await fetchProfile(profile.value.id)
  if (profile.value?.provider_id) await fetchMyProvider()

  return !!profile.value?.provider_id
}

onMounted(async () => {
  const providerExists = await ensureProviderExists()
  await fetchMyProvider()
  pageLoading.value = false
})

const savePersonal = async () => {
  await updatePersonalProfile(contactName.value.trim(), contactPhone.value.trim())
}

const saveBusiness = async () => {
  await updateProvider({
    name: businessName.value.trim(),
    location: location.value.trim(),
    phone: businessPhone.value.trim(),
    pickup_fee: pickupFee.value.trim() || 'Free pickup',
  })
}

const openAdd = () => {
  editingId.value = null
  isCustomService.value = false
  form.value = { service_id: '', price: '', unit: '', turnaround: '', title: '', category: 'Everyday', description: '' }
  showForm.value = true
}

const openEdit = (ps: ProviderService) => {
  editingId.value = ps.id
  isCustomService.value = false
  form.value = {
    service_id: ps.service_id,
    price: ps.price,
    unit: ps.unit,
    turnaround: ps.turnaround,
    title: '',
    category: 'Everyday',
    description: ''
  }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
  isCustomService.value = false
  serviceError.value = ''
}

const saveService = async () => {
  serviceError.value = ''
  
  // Ensure provider link exists before trying to add service
  const hasProvider = await ensureProviderExists()
  if (!hasProvider) {
    serviceError.value = 'Provider profile could not be initialized. Please check the browser console for details and ensure your RLS policies allow provider creation.'
    return
  }
  
  if (!form.value.price || !form.value.unit || !form.value.turnaround) {
    serviceError.value = 'Please fill in all fields'
    return
  }
  savingService.value = true
  let result: { error: string | null }
  try {
    if (editingId.value) {
      result = await updateService(editingId.value, form.value.price, form.value.unit, form.value.turnaround)
    } else if (isCustomService.value) {
      if (!form.value.title || !form.value.description) {
        serviceError.value = 'Please fill in service title and description'
        savingService.value = false
        return
      }
      const providerId = profile.value?.provider_id || null
      const serviceId = await createService({
        title: form.value.title,
        category: form.value.category,
        price_label: `From KSh ${form.value.price} ${form.value.unit}`,
        description: form.value.description,
        turnaround: form.value.turnaround,
        popular: false,
        provider_id: providerId,
      })
      if (serviceId) {
        result = await addService(serviceId, form.value.price, form.value.unit, form.value.turnaround)
        success('Custom service submitted for admin approval.')
      } else {
        serviceError.value = 'Failed to create custom service'
        savingService.value = false
        return
      }
    } else {
      if (!form.value.service_id) {
        serviceError.value = 'Please select a service'
        savingService.value = false
        return
      }
      result = await addService(form.value.service_id, form.value.price, form.value.unit, form.value.turnaround)
    }
    if (result.error) {
      serviceError.value = result.error
    } else {
      closeForm()
    }
  } finally {
    savingService.value = false
  }
}

const remove = async (id: string) => {
  await removeService(id)
}

const publish = async () => {
  publishError.value = ''
  await savePersonal()
  await saveBusiness()
  publishing.value = true
  const result = await submitForApproval()
  publishing.value = false
  if (result.error) {
    publishError.value = result.error
    return
  }
  await fetchMyProvider()
  // Navigate to dashboard after successful submission
  await navigateTo('/provider')
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
