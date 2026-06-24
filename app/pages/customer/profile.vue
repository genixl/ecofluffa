<template>
  <div>
    <!-- ── Profile Info ── -->
    <SectionHeader
      title="Your Profile"
      subtitle="Only you can view and edit this information"
    />

    <form class="border border-brand-gray bg-brand-white p-6 rounded-xl mb-10" @submit.prevent="save">
      <InputField
        label="Name"
        type="text"
        placeholder="Your full name"
        v-model="fullName"
      />
      <InputField
        label="Email"
        type="email"
        placeholder="you@example.com"
        :model-value="email"
        disabled
        hint="Email is managed by your login account"
      />
      <InputField
        label="Phone"
        type="tel"
        placeholder="+254 7XX XXX XXX"
        v-model="phone"
      />

      <div v-if="saveError" class="text-red-500 text-sm mt-2">{{ saveError }}</div>
      <div v-if="saved" class="text-brand-blue text-sm mt-2">Profile saved.</div>

      <div class="mt-6">
        <AppButton
          :label="saving ? 'Saving…' : 'Save Changes'"
          variant="secondary"
          type="submit"
          :disabled="saving"
          :loading="saving"
        />
      </div>
    </form>

    <!-- ── My Addresses ── -->
    <SectionHeader
      title="My Addresses"
      subtitle="Save your frequent pickup locations for faster booking"
    />

    <div
      class="rounded-xl p-6 mb-6"
      style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);"
    >
      <!-- Add new address form -->
      <div class="mb-6">
        <h3 class="text-sm font-bold mb-4" style="color: var(--text-primary);">Add New Address</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-muted);">Label (optional)</label>
            <input
              v-model="newLabel"
              type="text"
              placeholder="Home, Office, …"
              class="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
              style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold mb-1.5" style="color: var(--text-muted);">Address</label>
            <div class="flex gap-2">
              <input
                v-model="newAddress"
                type="text"
                placeholder="e.g., 12 Green Street, Nairobi"
                class="flex-1 px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);"
              />
              <!-- Verify on Google Maps -->
              <a
                v-if="newAddress.trim()"
                :href="mapsUrl(newAddress)"
                target="_blank"
                rel="noopener noreferrer"
                title="Verify on Google Maps"
                class="inline-flex items-center gap-1 px-3 py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-all hover:opacity-90"
                style="background-color: var(--brand-blue); color: #fff;"
              >
                <Icon name="mdi:map-search" size="15" />
                Verify
              </a>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-3">
          <label class="flex items-center gap-2 text-xs font-medium cursor-pointer" style="color: var(--text-muted);">
            <input
              v-model="newIsDefault"
              type="checkbox"
              class="rounded"
              style="accent-color: var(--brand-blue);"
            />
            Set as default
          </label>
          <AppButton
            :label="addingAddress ? 'Saving…' : 'Save Address'"
            variant="primary"
            type="button"
            :disabled="!newAddress.trim() || addingAddress"
            @click="handleAddAddress"
          />
          <div v-if="addError" class="text-red-500 text-xs">{{ addError }}</div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t mb-5" style="border-color: var(--border-color);"></div>

      <!-- Saved addresses list -->
      <div v-if="loadingAddresses" class="text-center py-6 text-sm" style="color: var(--text-muted);">
        Loading addresses…
      </div>

      <div v-else-if="addresses.length === 0" class="text-center py-6">
        <Icon name="mdi:map-marker-off" size="36" style="color: var(--text-muted);" />
        <p class="text-sm mt-2" style="color: var(--text-muted);">No saved addresses yet.</p>
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="addr in addresses"
          :key="addr.id"
          class="flex items-start gap-3 rounded-xl p-4 transition-all"
          style="background-color: var(--bg-subtle); border: 1px solid var(--border-color);"
        >
          <!-- Icon -->
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            :style="addr.is_default
              ? 'background-color: var(--brand-blue); color: #fff;'
              : 'background-color: var(--bg-base); color: var(--text-muted); border: 1px solid var(--border-color);'"
          >
            <Icon name="mdi:map-marker" size="16" />
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-sm" style="color: var(--text-primary);">
                {{ addr.label || 'Unnamed' }}
              </span>
              <span
                v-if="addr.is_default"
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                style="background-color: var(--brand-blue-light); color: var(--brand-blue);"
              >Default</span>
            </div>
            <p class="text-xs mt-0.5 truncate" style="color: var(--text-muted);">{{ addr.address }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Verify on Maps -->
            <a
              :href="mapsUrl(addr.address)"
              target="_blank"
              rel="noopener noreferrer"
              title="View on Google Maps"
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:opacity-80"
              style="background-color: var(--bg-base); border: 1px solid var(--border-color); color: var(--brand-blue);"
            >
              <Icon name="mdi:map-search" size="16" />
            </a>

            <!-- Set default -->
            <button
              v-if="!addr.is_default"
              type="button"
              title="Set as default"
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:opacity-80"
              style="background-color: var(--bg-base); border: 1px solid var(--border-color); color: var(--text-muted);"
              @click="handleSetDefault(addr.id)"
            >
              <Icon name="mdi:star-outline" size="16" />
            </button>

            <!-- Delete -->
            <button
              type="button"
              title="Delete"
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:opacity-80"
              style="background-color: var(--bg-base); border: 1px solid var(--border-color); color: #ef4444;"
              @click="handleDelete(addr.id)"
            >
              <Icon name="mdi:trash-can-outline" size="16" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const { profile, user, fetchProfile } = useAuth()
const {
  addresses,
  loading: loadingAddresses,
  mapsUrl,
  fetchAddresses,
  addAddress,
  deleteAddress,
  setDefault,
} = useAddresses()
const { success, error: toastError } = useToast()

// ── Profile form ──────────────────────────────────────────────
const fullName = ref('')
const phone = ref('')
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

const email = computed(() => user.value?.email ?? profile.value?.id ?? '')

watch(
  profile,
  (p) => {
    if (!p) return
    fullName.value = p.full_name
    phone.value = p.phone
  },
  { immediate: true }
)

const save = async () => {
  if (!profile.value?.id) return
  saving.value = true
  saved.value = false
  saveError.value = ''

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.value, phone: phone.value })
    .eq('id', profile.value.id)

  saving.value = false
  if (error) {
    saveError.value = error.message
    toastError('Failed to save profile.')
    return
  }
  await fetchProfile(profile.value.id)
  saved.value = true
  success('Profile updated.')
}

// ── Address management ────────────────────────────────────────
const newLabel = ref('')
const newAddress = ref('')
const newIsDefault = ref(false)
const addingAddress = ref(false)
const addError = ref('')

onMounted(() => fetchAddresses())

const handleAddAddress = async () => {
  if (!newAddress.value.trim()) return
  addingAddress.value = true
  addError.value = ''
  const result = await addAddress({
    label: newLabel.value.trim(),
    address: newAddress.value.trim(),
    is_default: newIsDefault.value,
  })
  addingAddress.value = false
  if (!result) {
    addError.value = 'Failed to save address. Please try again.'
    toastError('Failed to save address.')
    return
  }
  newLabel.value = ''
  newAddress.value = ''
  newIsDefault.value = false
  success('Address saved.')
}

const handleSetDefault = async (id: string) => {
  await setDefault(id)
  success('Default address updated.')
}

const handleDelete = async (id: string) => {
  const ok = await deleteAddress(id)
  if (ok) success('Address deleted.')
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
