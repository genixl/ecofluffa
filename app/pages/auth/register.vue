<template>
  <div>
    <div class="text-brand-blue font-bold text-2xl mb-2">Join EcoFluffa</div>
    <p class="text-gray-600 text-sm mb-6">Create your account to get started</p>

    <form class="space-y-4" @submit.prevent="submit">
      <InputField label="Full Name" type="text" placeholder="John Doe" v-model="fullName" />
      <InputField label="Email" type="email" placeholder="you@example.com" v-model="email" />
      <InputField label="Password" type="password" placeholder="Create a password (min 6 chars)" v-model="password" />

      <div>
        <label class="block text-brand-charcoal mb-3 font-semibold text-sm">I am a:</label>
        <div class="grid grid-cols-2 gap-3">
          <label
            v-for="r in roles"
            :key="r.value"
            class="flex flex-col items-center gap-1.5 cursor-pointer rounded-xl border-2 p-4 transition-all duration-200"
            :style="role === r.value
              ? 'border-color: var(--brand-blue); background-color: var(--brand-blue-light);'
              : 'border-color: var(--border-color); background-color: var(--bg-subtle);'"
          >
            <input type="radio" v-model="role" :value="r.value" class="sr-only" />
            <Icon :name="r.icon" size="24" :style="role === r.value ? 'color: var(--brand-blue);' : 'color: var(--text-muted);'" />
            <span class="text-xs font-semibold" :style="role === r.value ? 'color: var(--brand-blue);' : 'color: var(--text-muted);'">{{ r.label }}</span>
            <span class="text-xs text-center" style="color: var(--text-muted);">{{ r.desc }}</span>
          </label>
        </div>
      </div>

      <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>

      <div class="pt-2">
        <AppButton
          :label="loading ? 'Creating account…' : 'Create Account'"
          variant="primary"
          type="submit"
          :disabled="loading"
        />
      </div>
    </form>

    <div class="text-brand-charcoal text-sm mt-6 text-center">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-brand-orange font-semibold hover:text-brand-blue transition-colors">
        Log in
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signUp, loading, getRedirectPath } = useAuth()

const fullName = ref('')
const email = ref('')
const password = ref('')
const role = ref<'customer' | 'provider'>('customer')
const error = ref('')

const roles = [
  { value: 'customer', label: 'Customer', icon: 'mdi:account', desc: 'Book laundry pickups' },
  { value: 'provider', label: 'Service Provider', icon: 'mdi:store', desc: 'Offer laundry services' },
] as const

const submit = async () => {
  error.value = ''
  if (!fullName.value || !email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }

  const result = await signUp(email.value, password.value, fullName.value, role.value)
  if (result.error) {
    error.value = result.error
    return
  }

  if (result.needsEmailConfirmation) {
    await navigateTo({
      path: '/auth/login',
      query: {
        message: 'Account created. Check your email to confirm, then log in.',
      },
    })
    return
  }

  await navigateTo(result.redirectPath ?? getRedirectPath(role.value), { replace: true })
}

definePageMeta({ layout: 'auth' })
</script>
