<template>
  <div>
    <div class="text-brand-blue font-bold text-2xl mb-2">
      Join EcoFluffa
    </div>
    <p class="text-gray-600 text-sm mb-6">Create your account to get started</p>

    <form class="space-y-4" @submit.prevent="submit">
      <InputField
        label="Full Name"
        type="text"
        placeholder="John Doe"
        v-model="fullName"
      />
      <InputField
        label="Email"
        type="email"
        placeholder="you@example.com"
        v-model="email"
      />
      <InputField
        label="Password"
        type="password"
        placeholder="Create a password"
        v-model="password"
      />

      <div>
        <label class="block text-brand-charcoal mb-3 font-semibold text-sm">
          I am a:
        </label>
        <div class="flex gap-3">
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="role"
              value="Customer"
              class="w-4 h-4 text-brand-orange border-gray-300 focus:ring-brand-orange"
            />
            <span class="ml-2 text-sm">Customer</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="role"
              value="Provider"
              class="w-4 h-4 text-brand-orange border-gray-300 focus:ring-brand-orange"
            />
            <span class="ml-2 text-sm">Service Provider</span>
          </label>
        </div>
      </div>

      <div class="pt-2">
        <AppButton
          label="Create Account"
          variant="primary"
          type="submit"
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
const router = useRouter();

const fullName = ref("");
const email = ref("");
const password = ref("");
const role = ref<"Customer" | "Provider">("Customer");

const submit = () => {
  router.push(role.value === "Provider" ? "/provider" : "/customer");
};

definePageMeta({ layout: "auth" });
</script>

