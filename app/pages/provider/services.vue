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
        {{ editingId ? 'Edit Service' : 'Add New Service' }}
      </div>
      <div class="text-muted text-sm mb-6">Enter the details of the service you want to offer.</div>

      <div class="mb-4">
        <label class="block text-primary mb-2 font-semibold text-sm">Service</label>
        <select v-model="form.service_id" :disabled="!!editingId"
          class="w-full border-2 border-theme bg-surface text-primary px-4 py-3 rounded-lg focus:outline-none focus:border-brand-blue-700 transition-all">
          <option value="">Select a service…</option>
          <option v-for="s in availableToAdd" :key="s.id" :value="s.id">{{ s.title }}</option>
        </select>
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
        <div class="font-bold text-lg" style="color: var(--brand-blue);">{{ ps.service?.title }}</div>
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

const { myServices, loading: profileLoading, fetchMyProvider, addService, updateService, removeService } = useProviderProfile()
const { services, fetchAll } = useServices()

const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ service_id: '', price: '', unit: '', turnaround: '' })

onMounted(async () => {
  await Promise.all([fetchMyProvider(), fetchAll()])
  loading.value = false
})

const availableToAdd = computed(() =>
  services.value.filter((s) => !myServices.value.some((ps) => ps.service_id === s.id))
)

const openAdd = () => {
  editingId.value = null
  form.value = { service_id: '', price: '', unit: '', turnaround: '' }
  showForm.value = true
}

const openEdit = (ps: ProviderService) => {
  editingId.value = ps.id
  form.value = { service_id: ps.service_id, price: ps.price, unit: ps.unit, turnaround: ps.turnaround }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
}

const save = async () => {
  if (!form.value.price || !form.value.unit || !form.value.turnaround) return
  if (editingId.value) {
    await updateService(editingId.value, form.value.price, form.value.unit, form.value.turnaround)
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