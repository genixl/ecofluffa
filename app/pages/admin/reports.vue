<template>
  <div>
    <SectionHeader
      title="Reports"
      subtitle="Order stats, provider performance, platform usage"
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="border border-brand-gray bg-brand-white p-4">
        <div class="text-brand-blue font-bold">Avg Time to Ready</div>
        <div class="text-brand-charcoal text-2xl font-bold mt-2">18.2 hrs</div>
      </div>
      <div class="border border-brand-gray bg-brand-white p-4">
        <div class="text-brand-blue font-bold">On-time Delivery</div>
        <div class="text-brand-charcoal text-2xl font-bold mt-2">98.1%</div>
      </div>
      <div class="border border-brand-gray bg-brand-white p-4">
        <div class="text-brand-blue font-bold">Monthly Active Users</div>
        <div class="text-brand-charcoal text-2xl font-bold mt-2">1,902</div>
      </div>
    </div>

    <SectionHeader title="Provider Performance" subtitle="Performance snapshot (demo data)" />

    <table class="w-full border border-brand-gray border-collapse mb-8">
      <thead>
        <tr class="bg-brand-gray">
          <th class="border border-brand-gray p-3 text-left text-brand-blue">
            Provider
          </th>
          <th class="border border-brand-gray p-3 text-left">Avg Rating</th>
          <th class="border border-brand-gray p-3 text-left">Completed Orders</th>
        </tr>
      </thead>
      <tbody>
        <tr class="bg-brand-white" v-for="p in providerPerformance" :key="p.name">
          <td class="border border-brand-gray p-3 font-semibold text-brand-charcoal">
            {{ p.name }}
          </td>
          <td class="border border-brand-gray p-3 text-brand-charcoal">
            {{ p.avgRating }}
          </td>
          <td class="border border-brand-gray p-3 text-brand-charcoal">
            {{ p.completed }}
          </td>
        </tr>
      </tbody>
    </table>

    <SectionHeader title="Platform Usage" subtitle="How the marketplace is used" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border border-brand-gray bg-brand-white p-6">
        <div class="text-brand-blue font-bold">Search-to-book rate</div>
        <div class="text-brand-charcoal text-sm mt-2">
          Users who browse providers are 22% more likely to confirm an order.
        </div>
        <div class="text-brand-charcoal font-semibold mt-3">22%</div>
      </div>
      <div class="border border-brand-gray bg-brand-white p-6">
        <div class="text-brand-blue font-bold">Top service category</div>
        <div class="text-brand-charcoal text-sm mt-2">
          Wash & Fold is the most booked service across new pickups.
        </div>
        <div class="text-brand-charcoal font-semibold mt-3">Wash & Fold</div>
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

