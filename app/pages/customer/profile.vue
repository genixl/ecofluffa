<template>
  <div>
    <SectionHeader
      title="Your Profile"
      subtitle="Update your contact details"
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
        v-model="email"
      />
      <InputField
        label="Phone"
        type="tel"
        placeholder="+254 7XX XXX XXX"
        v-model="phone"
      />

      <div class="mt-6">
        <AppButton label="Save Changes" variant="secondary" type="submit" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const fullName = ref("Lara Cheruiyot");
const email = ref("lara@example.com");
const phone = ref("+254 712 345 678");

const save = () => {
  // Demo-only: no API call
};

definePageMeta({ layout: "dashboard" });
</script>

