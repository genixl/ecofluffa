<template>
  <div>
    <SectionHeader
      title="Reports"
      subtitle="Order stats, provider performance, platform usage"
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-surface border border-theme rounded-xl p-4 shadow-theme-sm">
        <div class="font-bold" style="color: var(--brand-blue);">Avg Time to Ready</div>
        <div class="text-primary text-2xl font-bold mt-2">18.2 hrs</div>
      </div>
      <div class="bg-surface border border-theme rounded-xl p-4 shadow-theme-sm">
        <div class="font-bold" style="color: var(--brand-blue);">On-time Delivery</div>
        <div class="text-primary text-2xl font-bold mt-2">98.1%</div>
      </div>
      <div class="bg-surface border border-theme rounded-xl p-4 shadow-theme-sm">
        <div class="font-bold" style="color: var(--brand-blue);">Monthly Active Users</div>
        <div class="text-primary text-2xl font-bold mt-2">1,902</div>
      </div>
    </div>

    <SectionHeader title="Provider Performance" subtitle="Performance snapshot (demo data)" />

    <div class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm mb-8">
      <table class="w-full text-left">
        <thead class="bg-subtle border-b border-theme">
          <tr>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Provider</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Avg Rating</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Completed Orders</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-theme">
          <tr v-for="p in providerPerformance" :key="p.name" class="hover:bg-subtle transition-colors">
            <td class="p-4 font-semibold text-primary">{{ p.name }}</td>
            <td class="p-4 text-sm text-muted">{{ p.avgRating }}</td>
            <td class="p-4 text-sm text-muted">{{ p.completed }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <SectionHeader title="Platform Usage" subtitle="How the marketplace is used" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm">
        <div class="font-bold" style="color: var(--brand-blue);">Search-to-book rate</div>
        <div class="text-muted text-sm mt-2">
          Users who browse providers are 22% more likely to confirm an order.
        </div>
        <div class="text-primary font-semibold mt-3">22%</div>
      </div>
      <div class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm">
        <div class="font-bold" style="color: var(--brand-blue);">Top service category</div>
        <div class="text-muted text-sm mt-2">
          Wash & Fold is the most booked service across new pickups.
        </div>
        <div class="text-primary font-semibold mt-3">Wash & Fold</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ProviderPerf = {
  name: string;
  avgRating: number;
  completed: number;
};

const providerPerformance = ref<ProviderPerf[]>([
  { name: "GreenLeaf Cleaners", avgRating: 4.5, completed: 1_204 },
  { name: "Ocean Breeze Laundry", avgRating: 4.6, completed: 1_086 },
  { name: "FreshWave Laundry", avgRating: 4.7, completed: 982 },
]);

definePageMeta({ layout: "dashboard" });
</script>