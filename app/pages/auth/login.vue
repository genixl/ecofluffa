<template>
  <div>
    <div class="text-brand-blue font-bold text-2xl mb-2">
      Welcome Back
    </div>
    <p class="text-gray-600 text-sm mb-6">Log in to your account to continue</p>

    <form class="space-y-4" @submit.prevent="submit">
      <InputField
        label="Email"
        type="email"
        placeholder="you@example.com"
        v-model="email"
      />
      <InputField
        label="Password"
        type="password"
        placeholder="Your password"
        v-model="password"
      />

      <!-- Role selector -->
      <div>
        <label class="block text-brand-charcoal mb-3 font-semibold text-sm">
          Login as:
        </label>
        <div class="grid grid-cols-3 gap-2">
          <label
            v-for="r in roles"
            :key="r.value"
            class="flex flex-col items-center gap-1.5 cursor-pointer rounded-xl border-2 p-3 transition-all duration-200"
            :style="role === r.value
              ? 'border-color: var(--brand-blue); background-color: var(--brand-blue-light);'
              : 'border-color: var(--border-color); background-color: var(--bg-subtle);'"
          >
            <input type="radio" v-model="role" :value="r.value" class="sr-only" />
            <Icon :name="r.icon" size="22" :style="role === r.value ? 'color: var(--brand-blue);' : 'color: var(--text-muted);'" />
            <span class="text-xs font-semibold" :style="role === r.value ? 'color: var(--brand-blue);' : 'color: var(--text-muted);'">{{ r.label }}</span>
          </label>
        </div>
      </div>

      <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>

      <div class="pt-2">
        <AppButton
          label="Log In"
          variant="primary"
          type="submit"
        />
      </div>
    </form>

    <div class="text-brand-charcoal text-sm mt-6 text-center">
      New here?
      <NuxtLink to="/auth/register" class="text-brand-orange font-semibold hover:text-brand-blue transition-colors">
        Create an account
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const role = ref<'customer' | 'provider' | 'admin'>('customer')
const error = ref('')

const roles = [
  { value: 'customer', label: 'Customer', icon: 'mdi:account' },
  { value: 'provider', label: 'Provider', icon: 'mdi:store' },
  { value: 'admin', label: 'Admin', icon: 'mdi:shield-account' },
] as const

const submit = () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }
  login(role.value, email.value.split('@')[0])
  if (role.value === 'admin') router.push('/admin')
  else if (role.value === 'provider') router.push('/provider')
  else router.push('/customer')
}

definePageMeta({ layout: 'auth' })
</script>
