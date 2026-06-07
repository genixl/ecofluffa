<template>
  <div>
    <SectionHeader title="Customers" subtitle="All customer accounts on EcoFluffa" />

    <div class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
      <table class="w-full text-left">
        <thead class="bg-subtle border-b border-theme">
          <tr>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Name</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Email</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Phone</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Member Since</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-theme">
          <tr v-for="c in customers" :key="c.email" class="hover:bg-subtle transition-colors">
            <td class="p-4 font-semibold text-primary">{{ c.name }}</td>
            <td class="p-4 text-sm text-muted">{{ c.email }}</td>
            <td class="p-4 text-sm text-muted">{{ c.phone }}</td>
            <td class="p-4 text-sm text-muted">{{ c.since }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>