<template>
  <div>
    <!-- Checking link state (waiting for PASSWORD_RECOVERY event) -->
    <div v-if="checking" class="text-center py-8">
      <div class="inline-flex items-center gap-3 text-gray-500 text-sm">
        <svg class="animate-spin h-5 w-5 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Verifying reset link…
      </div>
    </div>

    <!-- Invalid / expired link state -->
    <div v-else-if="linkInvalid" class="text-center py-4">
      <div class="flex justify-center mb-4">
        <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <Icon name="mdi:link-off" size="36" class="text-red-500" />
        </span>
      </div>
      <h2 class="font-semibold text-lg text-brand-charcoal mb-2">Link Expired or Invalid</h2>
      <p class="text-gray-500 text-sm mb-6">
        This password reset link is no longer valid. Please request a new one.
      </p>
      <NuxtLink
        to="/auth/forgot-password"
        class="inline-block bg-brand-blue text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        Request a new link
      </NuxtLink>
    </div>

    <!-- Success state -->
    <div v-else-if="done" class="text-center py-4">
      <div class="flex justify-center mb-4">
        <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <Icon name="mdi:shield-check-outline" size="36" class="text-green-600" />
        </span>
      </div>
      <h2 class="font-semibold text-lg text-brand-charcoal mb-2">Password Updated!</h2>
      <p class="text-gray-500 text-sm mb-6">
        Your password has been changed successfully. You can now log in with your new password.
      </p>
      <NuxtLink
        to="/auth/login"
        class="inline-block bg-brand-blue text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        Go to Login
      </NuxtLink>
    </div>

    <!-- Reset form -->
    <template v-else>
      <div class="text-brand-blue font-bold text-2xl mb-2">Set New Password</div>
      <p class="text-gray-600 text-sm mb-6">
        Choose a strong password for your account.
      </p>

      <form class="space-y-4" @submit.prevent="submit">
        <div class="relative">
          <InputField
            label="New Password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="At least 8 characters"
            v-model="password"
            id="reset-password"
          />
          <button
            type="button"
            class="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <Icon :name="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" size="20" />
          </button>
        </div>

        <div class="relative">
          <InputField
            label="Confirm New Password"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="Repeat your new password"
            v-model="confirm"
            id="reset-confirm"
          />
          <button
            type="button"
            class="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            @click="showConfirm = !showConfirm"
            :aria-label="showConfirm ? 'Hide confirm password' : 'Show confirm password'"
          >
            <Icon :name="showConfirm ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" size="20" />
          </button>
        </div>

        <!-- Password strength indicator -->
        <div v-if="password" class="space-y-1">
          <div class="flex gap-1">
            <div
              v-for="n in 4"
              :key="n"
              class="h-1 flex-1 rounded-full transition-all duration-300"
              :class="strengthBarClass(n)"
            />
          </div>
          <p class="text-xs" :class="strengthLabelColor">{{ strengthLabel }}</p>
        </div>

        <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>

        <div class="pt-2">
          <AppButton
            :label="loading ? 'Updating…' : 'Update Password'"
            variant="primary"
            type="submit"
            :disabled="loading"
            :loading="loading"
          />
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
const { updatePassword, loading } = useAuth()
const supabase = useSupabaseClient()

const password = ref('')
const confirm = ref('')
const error = ref('')
const done = ref(false)
const linkInvalid = ref(false)
const checking = ref(true)   // show a spinner while we wait for the auth event
const showPassword = ref(false)
const showConfirm = ref(false)

// --- Password strength ---
const strengthScore = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[strengthScore.value] ?? ''
})

const strengthLabelColor = computed(() => {
  const colors = ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-600']
  return colors[strengthScore.value] ?? ''
})

const strengthBarClass = (n: number) => {
  if (n > strengthScore.value) return 'bg-gray-200'
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500']
  return colors[strengthScore.value] ?? 'bg-gray-200'
}

// -------------------------------------------------------------------
// Wait for Supabase to fire PASSWORD_RECOVERY before showing the form.
//
// Why onAuthStateChange instead of getSession()?
// When the user clicks the reset link, Supabase embeds the recovery
// token in the URL hash or as a ?code= query param. The Supabase JS
// client processes that token asynchronously after the page loads and
// then fires PASSWORD_RECOVERY. Calling getSession() immediately (even
// with a short timeout) races against that token exchange and almost
// always loses — producing a false "link expired" result.
// -------------------------------------------------------------------
onMounted(() => {
  // Timeout: if we haven't received PASSWORD_RECOVERY within 8 seconds,
  // assume the link is genuinely invalid/expired.
  const timer = setTimeout(() => {
    checking.value = false
    linkInvalid.value = true
  }, 8000)

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      clearTimeout(timer)
      checking.value = false
      // form is now shown — user can set their new password
    } else if (event === 'SIGNED_IN' && !checking.value) {
      // already handled
    } else if (event === 'SIGNED_OUT') {
      clearTimeout(timer)
      checking.value = false
      linkInvalid.value = true
    }
  })

  // Clean up listener when the component unmounts
  onUnmounted(() => {
    clearTimeout(timer)
    subscription.unsubscribe()
  })
})

const submit = async () => {
  error.value = ''

  if (!password.value || !confirm.value) {
    error.value = 'Please fill in both fields.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'
    return
  }

  const result = await updatePassword(password.value)
  if (result.error) {
    error.value = result.error
    return
  }

  done.value = true
}

definePageMeta({ layout: 'auth' })
</script>
