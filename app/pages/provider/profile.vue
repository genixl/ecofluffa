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
      <!-- Profile photo (optional) -->
      <div class="mb-6">
        <ProviderPhotoUpload
          v-model="photoUrl"
          :providerName="businessName || 'Provider'"
        />
      </div>
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
        <span v-if="isApproved"> Customers will see your updates.</span>
        <span v-else-if="isPendingApproval"> Pending admin approval before customers can see you.</span>
        <NuxtLink v-else-if="needsOnboarding" to="/provider/setup" class="font-semibold underline ml-1">Complete setup →</NuxtLink>
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

    <!-- Ratings Section -->
    <div class="mt-8">
      <SectionHeader title="Customer Ratings" subtitle="See what customers are saying about your service" />
      
      <div v-if="ratings.length === 0" class="bg-surface border border-theme rounded-xl p-8 text-center">
        <Icon name="mdi:star-outline" size="40" style="color: var(--text-muted);" />
        <div class="text-muted text-sm mt-3">No ratings yet. Complete orders to receive customer feedback!</div>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="rating in ratings.slice(0, 10)"
          :key="rating.id"
          class="bg-surface border border-theme rounded-xl p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <div class="flex items-center gap-1">
                  <Icon
                    v-for="i in 5"
                    :key="i"
                    :name="i <= rating.score ? 'mdi:star' : 'mdi:star-outline'"
                    size="16"
                    :style="i <= rating.score ? 'color: #f59e0b;' : 'color: var(--text-muted);'"
                  />
                </div>
                <span class="text-xs font-bold" style="color: var(--text-muted);">
                  {{ rating.score }}/5
                </span>
              </div>
              <p v-if="rating.comment" class="text-sm mt-2" style="color: var(--text-primary);">
                {{ rating.comment }}
              </p>
              <p v-else class="text-sm italic mt-2" style="color: var(--text-muted);">
                No comment provided
              </p>
              <div class="text-xs mt-3" style="color: var(--text-faint);">
                Order {{ rating.order_id }} • {{ formatDate(rating.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="ratings.length > 10" class="text-center">
          <div class="text-sm" style="color: var(--text-muted);">
            Showing 10 of {{ ratings.length }} ratings
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchMyProvider, provider, updateProvider, isApproved, isPendingApproval, needsOnboarding, ratings } = useProviderProfile()
const { success } = useToast()

const businessName = ref('')
const location = ref('')
const contactPhone = ref('')
const pickupFee = ref('Free pickup')
const photoUrl = ref<string | null>(null)
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
    photoUrl.value = p.photo_url ?? null
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

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch { return iso }
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
