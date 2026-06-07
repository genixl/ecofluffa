<template>
  <div>
    <SectionHeader
      title="Your Profile"
      subtitle="Only you can view and edit this information"
    />

    <form class="border border-brand-gray bg-brand-white p-6" @submit.prevent="save">
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
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const { profile, user, fetchProfile } = useAuth()

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
    return
  }
  await fetchProfile(profile.value.id)
  saved.value = true
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
