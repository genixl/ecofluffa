<template>
  <div>
    <SectionHeader
      title="Business Profile"
      subtitle="Update your public details"
    />

    <form class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm" @submit.prevent="save">
      <InputField
        label="Business Name"
        type="text"
        placeholder="e.g., Ocean Breeze Laundry"
        v-model="businessName"
      />
      <InputField
        label="Location"
        type="text"
        placeholder="e.g., Riverside District"
        v-model="location"
      />
      <InputField
        label="Contact Email"
        type="email"
        placeholder="contact@provider.com"
        v-model="contactEmail"
      />
      <InputField
        label="Phone"
        type="tel"
        placeholder="+254 7XX XXX XXX"
        v-model="contactPhone"
      />

      <div class="mt-6">
        <AppButton label="Save Profile" variant="secondary" type="submit" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const businessName = ref("Ocean Breeze Laundry");
const location = ref("Riverside District");
const contactEmail = ref("hello@oceanbreezelaundry.example");
const contactPhone = ref("+254 712 111 222");

const save = () => {
  // Demo-only: no persistence
};

definePageMeta({ layout: "dashboard" });
</script>