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
const router = useRouter();

const email = ref("");
const password = ref("");

const submit = () => {
  router.push("/browse");
};

definePageMeta({ layout: "auth" });
</script>

