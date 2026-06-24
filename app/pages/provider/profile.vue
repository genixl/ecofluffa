<template>
  <div>
    <SectionHeader
      title="Business Profile"
      subtitle="Updates here are visible to customers browsing your listing"
    />

    <div v-if="pageLoading" class="text-muted text-sm py-10">Loading…</div>

    <form
      v-else
      class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm"
      @submit.prevent="save"
    >
      <InputField
        label="Business Name"
        type="text"
        placeholder="e.g., Ocean Breeze Laundry"
        v-model="businessName"
      />
      <InputField
        label="Location"
        type="text"
        placeholder="e.g., Riverside District"
        v-model="location"
      />
      <InputField
        label="Phone"
        type="tel"
        placeholder="+254 7XX XXX XXX"
        v-model="contactPhone"
      />
      <InputField
        label="Pickup fee label"
        type="text"
        placeholder="e.g. Free pickup"
        v-model="pickupFee"
      />

      <div v-if="saveError" class="text-red-500 text-sm mt-2">{{ saveError }}</div>
      <div v-if="saved" class="text-brand-blue text-sm mt-2">
        Business profile saved.
        <span v-if="provider?.is_listed"> Customers will see your updates.</span>
        <NuxtLink v-else to="/provider/setup" class="font-semibold underline ml-1">Publish your listing →</NuxtLink>
      </div>

      <div class="mt-6">
        <AppButton
          :label="saving ? 'Saving…' : 'Save Profile'"
          variant="secondary"
          type="submit"
          :disabled="saving"
          :loading="saving"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const { fetchMyProvider, provider, updateProvider } = useProviderProfile()
const { success } = useToast()

const businessName = ref('')
const location = ref('')
const contactPhone = ref('')
const pickupFee = ref('Free pickup')
const pageLoading = ref(true)
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

watch(
  provider,
  (p) => {
    if (!p) return
    businessName.value = p.name
    location.value = p.location
    contactPhone.value = p.phone
    pickupFee.value = p.pickup_fee
  },
  { immediate: true }
)

onMounted(async () => {
  await fetchMyProvider()
  pageLoading.value = false
})

const save = async () => {
  saving.value = true
  saved.value = false
  saveError.value = ''

  const result = await updateProvider({
    name: businessName.value,
    location: location.value,
    phone: contactPhone.value,
    pickup_fee: pickupFee.value,
  })

  saving.value = false
  if (result.error) {
    saveError.value = result.error
    return
  }
  saved.value = true
  success('Business profile updated.')
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
