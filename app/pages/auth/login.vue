<template>
  <div>
    <div class="text-brand-blue font-bold text-2xl mb-2">Welcome Back</div>
    <p class="text-gray-600 text-sm mb-6">Log in to your account to continue</p>

    <form class="space-y-4" @submit.prevent="submit">
      <InputField label="Email" type="email" placeholder="you@example.com" v-model="email" />
      <InputField label="Password" type="password" placeholder="Your password" v-model="password" />

      <div v-if="info" class="text-brand-blue text-sm font-medium">{{ info }}</div>
      <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>

      <div class="pt-2">
        <AppButton
          :label="loading ? 'Logging in…' : 'Log In'"
          variant="primary"
          type="submit"
          :disabled="loading"
          :loading="loading"
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
const route = useRoute()
const { signIn, loading, isLoggedIn, getRedirectPath } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const info = ref('')

onMounted(() => {
  const msg = route.query.message
  if (typeof msg === 'string' && msg) info.value = msg

  if (isLoggedIn.value) {
    navigateTo(getRedirectPath(), { replace: true })
  }
})

const submit = async () => {
  error.value = ''
  info.value = ''
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }

  try {
    const result = await signIn(email.value, password.value)
    if (result.error) {
      error.value = result.error
      return
    }

    const path = result.redirectPath ?? getRedirectPath()
    await navigateTo(path, { replace: true })
  } catch (e) {
    console.error('Login failed:', e)
    error.value = 'Something went wrong. Please try again.'
  }
}

definePageMeta({ layout: 'auth' })
</script>
