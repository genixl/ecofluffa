<template>
  <div>
    <SectionHeader title="Customers" subtitle="All customer accounts on EcoFluffa" />

    <table class="w-full border border-brand-gray border-collapse">
      <thead>
        <tr class="bg-brand-gray">
          <th class="border border-brand-gray p-3 text-left text-brand-blue">Name</th>
          <th class="border border-brand-gray p-3 text-left">Email</th>
          <th class="border border-brand-gray p-3 text-left">Phone</th>
          <th class="border border-brand-gray p-3 text-left">Member Since</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in customers" :key="c.email" class="bg-brand-white">
          <td class="border border-brand-gray p-3 font-semibold text-brand-charcoal">
            {{ c.name }}
          </td>
          <td class="border border-brand-gray p-3 text-brand-charcoal">
            {{ c.email }}
          </td>
          <td class="border border-brand-gray p-3 text-brand-charcoal">
            {{ c.phone }}
          </td>
          <td class="border border-brand-gray p-3 text-brand-charcoal">
            {{ c.since }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
type CustomerRow = {
  name: string;
  email: string;
  phone: string;
  since: string;
};

const customers = ref<CustomerRow[]>([
  { name: "Lara Cheruiyot", email: "lara@example.com", phone: "+254 712 345 678", since: "2025-11-02" },
  { name: "Musa Wanjala", email: "musa@example.com", phone: "+254 700 888 123", since: "2026-01-18" },
  { name: "Amina Hassan", email: "amina@example.com", phone: "+254 711 220 019", since: "2026-03-09" },
  { name: "Joseph Otieno", email: "joseph@example.com", phone: "+254 789 140 550", since: "2026-04-21" },
]);

definePageMeta({ layout: "dashboard" });
</script>

