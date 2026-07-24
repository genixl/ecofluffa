<template>
  <div>
    <!-- Header -->
    <div class="text-brand-blue font-bold text-2xl mb-2">Forgot Password?</div>
    <p class="text-gray-600 text-sm mb-6">
      Enter your email address and we'll send you a link to reset your password.
    </p>

    <!-- Success state -->
    <div v-if="sent" class="text-center py-4">
      <div class="flex justify-center mb-4">
        <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <Icon name="mdi:email-check-outline" size="36" class="text-green-600" />
        </span>
      </div>
      <h2 class="font-semibold text-lg text-brand-charcoal mb-2">Check your inbox!</h2>
      <p class="text-gray-500 text-sm mb-6">
        A password reset link has been sent to <span class="font-semibold text-brand-blue">{{ email }}</span>.
        Check your spam folder if you don't see it within a few minutes.
      </p>
      <NuxtLink
        to="/auth/login"
        class="text-brand-orange font-semibold hover:text-brand-blue transition-colors text-sm"
      >
        ← Back to Login
      </NuxtLink>
    </div>

    <!-- Request form -->
    <form v-else class="space-y-4" @submit.prevent="submit">
      <InputField
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        v-model="email"
        id="forgot-email"
      />

      <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>

      <div class="pt-2">
        <AppButton
          :label="loading ? 'Sending…' : 'Send Reset Link'"
          variant="primary"
          type="submit"
          :disabled="loading"
          :loading="loading"
        />
      </div>
    </form>

    <!-- Back to login -->
    <div v-if="!sent" class="text-brand-charcoal text-sm mt-6 text-center">
      Remember your password?
      <NuxtLink to="/auth/login" class="text-brand-orange font-semibold hover:text-brand-blue transition-colors">
        Log in
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { resetPassword, loading } = useAuth()

const email = ref('')
const error = ref('')
const sent = ref(false)

const submit = async () => {
  error.value = ''
  if (!email.value.trim()) {
    error.value = 'Please enter your email address.'
    return
  }

  const result = await resetPassword(email.value.trim())
  if (result.error) {
    error.value = result.error
    return
  }

  sent.value = true
}

definePageMeta({ layout: 'auth' })
</script>
