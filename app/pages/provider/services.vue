<template>
  <div>
    <div class="flex items-end justify-between gap-6 mb-6">
      <SectionHeader title="Your Services" subtitle="Manage what you offer on the platform" />
      <AppButton label="Add Service" variant="primary" type="button" @click="openAdd" />
    </div>

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading services…</div>

    <!-- Add / Edit form -->
    <div v-if="showForm" class="bg-surface border border-theme rounded-xl p-6 mb-6 shadow-theme-md">
      <div class="font-bold text-xl mb-1" style="color: var(--brand-blue);">
        {{ editingId ? 'Edit Service' : (isCustomService ? 'Add Custom Service' : 'Add Service from Catalog') }}
      </div>
      <div class="text-muted text-sm mb-6">
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
        <select v-model="form.service_id"
          class="w-full border-2 border-theme bg-surface text-primary px-4 py-3 rounded-lg focus:outline-none focus:border-brand-blue-700 transition-all">
          <option value="">Select a service…</option>
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

      <InputField label="Price (numbers only, e.g. 195)" type="text" placeholder="195" v-model="form.price" />
      <InputField label="Unit (e.g. per kg, per item)" type="text" placeholder="per kg" v-model="form.unit" />
      <InputField label="Turnaround (e.g. 24 hrs)" type="text" placeholder="24 hrs" v-model="form.turnaround" />

      <div class="flex flex-wrap gap-3 mt-4">
        <AppButton :label="editingId ? 'Update Service' : 'Save Service'" variant="primary" type="button" @click="save" />
        <AppButton label="Cancel" variant="outline" type="button" @click="closeForm" />
      </div>
    </div>

    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-if="myServices.length === 0" class="col-span-2 text-muted text-sm text-center py-10">
        No services yet. Click "Add Service" to get started.
      </div>
      <div
        v-for="ps in myServices"
        :key="ps.id"
        class="bg-surface border border-theme rounded-xl p-5 shadow-theme-sm hover:shadow-theme-md transition-shadow"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="font-bold text-lg" style="color: var(--brand-blue);">{{ ps.service?.title }}</div>
          <span
            v-if="serviceBadge(ps)"
            class="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
            :class="serviceBadge(ps)?.class"
          >
            {{ serviceBadge(ps)?.label }}
          </span>
        </div>
        <div class="text-primary text-sm mt-2 font-semibold">KSh {{ ps.price }} {{ ps.unit }}</div>
        <div class="text-muted text-sm mt-1">Turnaround: {{ ps.turnaround }}</div>
        <div class="text-muted text-xs mt-1">{{ ps.service?.category }}</div>

        <div class="flex flex-wrap gap-3 mt-4">
          <AppButton label="Edit" variant="outline" type="button" @click="openEdit(ps)" />
          <AppButton label="Remove" variant="outline" type="button" @click="remove(ps.id)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProviderService } from '~/types/supabase'
import { isCatalogService } from '~/types/supabase'

const {
  myServices,
  catalogServices,
  fetchMyProvider,
  addService,
  updateService,
  removeService,
} = useProviderProfile()
const { profile } = useAuth()
const { createService, categories } = useServices()
const { success } = useToast()

const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const isCustomService = ref(false)
const form = ref({ service_id: '', price: '', unit: '', turnaround: '', title: '', category: 'Everyday', description: '' })

onMounted(async () => {
  await fetchMyProvider()
  loading.value = false
})

const availableToAdd = computed(() =>
  catalogServices.value.filter((s) => !myServices.value.some((ps) => ps.service_id === s.id))
)

const serviceBadge = (ps: ProviderService) => {
  const svc = ps.service
  if (!svc || isCatalogService(svc)) return null
  if (svc.approval_status === 'pending') {
    return { label: 'Pending approval', class: 'bg-brand-orange/10 text-brand-orange' }
  }
  if (svc.approval_status === 'rejected') {
    return { label: 'Rejected', class: 'bg-red-100 text-red-700' }
  }
  return { label: 'Approved', class: 'bg-green-100 text-green-700' }
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
  form.value = { service_id: ps.service_id, price: ps.price, unit: ps.unit, turnaround: ps.turnaround, title: '', category: 'Everyday', description: '' }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
  isCustomService.value = false
}

const save = async () => {
  if (!form.value.price || !form.value.unit || !form.value.turnaround) return

  if (editingId.value) {
    await updateService(editingId.value, form.value.price, form.value.unit, form.value.turnaround)
  } else if (isCustomService.value) {
    if (!form.value.title || !form.value.description) return
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
      await addService(serviceId, form.value.price, form.value.unit, form.value.turnaround)
      success('Custom service submitted for admin approval.')
    }
  } else {
    if (!form.value.service_id) return
    await addService(form.value.service_id, form.value.price, form.value.unit, form.value.turnaround)
  }
  closeForm()
}

const remove = async (id: string) => {
  await removeService(id)
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
