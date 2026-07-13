<template>
  <div>
    <div class="text-brand-blue font-bold text-2xl mb-2">Join EcoFluffa</div>
    <p class="text-gray-600 text-sm mb-6">Create your account to get started</p>

    <form class="space-y-4" @submit.prevent="submit">
      <InputField label="Full Name" type="text" placeholder="John Doe" v-model="fullName" />
      <InputField label="Email" type="email" placeholder="you@example.com" v-model="email" />

      <div>
        <InputField
          label="Password"
          type="password"
          placeholder="Create a strong password"
          v-model="password"
        />
        <div v-if="password" class="mt-2">
          <div class="flex gap-1 mb-1">
            <div
              v-for="i in 4"
              :key="i"
              class="h-1.5 flex-1 rounded-full transition-colors duration-200"
              :style="`background-color: ${i <= strengthScore ? strengthColor : 'var(--border-color)'}`"
            />
          </div>
          <span class="text-xs font-medium" :style="`color: ${strengthColor}`">{{ strengthLabel }}</span>
        </div>
        <ul v-if="password && !passwordValid" class="mt-2 space-y-0.5">
          <li
            v-for="rule in passwordRules"
            :key="rule.label"
            class="text-xs flex items-center gap-1.5"
            :style="rule.met ? 'color: var(--brand-blue);' : 'color: var(--text-muted);'"
          >
            <Icon :name="rule.met ? 'mdi:check-circle' : 'mdi:circle-outline'" size="14" />
            {{ rule.label }}
          </li>
        </ul>
      </div>

      <div>
        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          v-model="confirmPassword"
        />
        <p
          v-if="confirmPassword && !passwordsMatch"
          class="text-xs text-red-500 mt-1"
        >
          Passwords do not match.
        </p>
      </div>

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
const confirmPassword = ref('')
const role = ref<'customer' | 'provider'>('customer')
const error = ref('')

const roles = [
  { value: 'customer', label: 'Customer', icon: 'mdi:account', desc: 'Book laundry pickups' },
  { value: 'provider', label: 'Service Provider', icon: 'mdi:store', desc: 'Offer laundry services' },
] as const

// --- Password strength rules ---
const passwordRules = computed(() => [
  { label: 'At least 8 characters', met: password.value.length >= 8 },
  { label: 'One uppercase letter', met: /[A-Z]/.test(password.value) },
  { label: 'One lowercase letter', met: /[a-z]/.test(password.value) },
  { label: 'One number', met: /\d/.test(password.value) },
  { label: 'One special character', met: /[^A-Za-z0-9]/.test(password.value) },
])

const passwordValid = computed(() => passwordRules.value.every((r) => r.met))

const strengthScore = computed(() => {
  const metCount = passwordRules.value.filter((r) => r.met).length
  // Map 0-5 met rules onto a 0-4 bar scale
  return Math.min(4, Math.ceil((metCount / passwordRules.value.length) * 4))
})

const strengthLabel = computed(() => {
  switch (strengthScore.value) {
    case 0:
    case 1:
      return 'Weak'
    case 2:
      return 'Fair'
    case 3:
      return 'Good'
    default:
      return 'Strong'
  }
})

const strengthColor = computed(() => {
  switch (strengthScore.value) {
    case 0:
    case 1:
      return '#EF4444' // red
    case 2:
      return '#F59E0B' // amber
    case 3:
      return '#3B82F6' // blue
    default:
      return '#10B981' // green
  }
})

const passwordsMatch = computed(
  () => password.value.length > 0 && password.value === confirmPassword.value
)

const submit = async () => {
  error.value = ''
  if (!fullName.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (!passwordValid.value) {
    error.value = 'Password does not meet the strength requirements.'
    return
  }
  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match.'
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