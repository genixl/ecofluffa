<template>
  <div>
    <SectionHeader title="Providers" subtitle="Approve or remove provider accounts" />

    <table class="w-full border border-brand-gray border-collapse">
      <thead>
        <tr class="bg-brand-gray">
          <th class="border border-brand-gray p-3 text-left text-brand-blue">Provider</th>
          <th class="border border-brand-gray p-3 text-left">Location</th>
          <th class="border border-brand-gray p-3 text-left">Rating</th>
          <th class="border border-brand-gray p-3 text-left">Status</th>
          <th class="border border-brand-gray p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in providers" :key="p.name" class="bg-brand-white">
          <td class="border border-brand-gray p-3 font-semibold text-brand-charcoal">
            {{ p.name }}
          </td>
          <td class="border border-brand-gray p-3 text-brand-charcoal">
            {{ p.location }}
          </td>
          <td class="border border-brand-gray p-3 text-brand-charcoal">
            {{ p.rating }} / 5
          </td>
          <td class="border border-brand-gray p-3 text-brand-charcoal">
            {{ p.status }}
          </td>
          <td class="border border-brand-gray p-3">
            <div class="flex flex-wrap gap-3">
              <AppButton
                label="Approve"
                variant="outline"
                type="button"
                @click="approve(p.name)"
              />
              <AppButton
                label="Remove"
                variant="outline"
                type="button"
                @click="remove(p.name)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
type ProviderRow = {
  name: string;
  location: string;
  rating: number;
  status: "Pending" | "Approved" | "Removed";
};

const providers = ref<ProviderRow[]>([
  { name: "GreenLeaf Cleaners", location: "Westside", rating: 4.5, status: "Pending" },
  { name: "CitySpin Laundromat", location: "Downtown", rating: 4.3, status: "Approved" },
  { name: "RoyalRinse Laundry", location: "East Heights", rating: 4.2, status: "Pending" },
]);

const approve = (name: string) => {
  const p = providers.value.find((x) => x.name === name);
  if (p) p.status = "Approved";
};

const remove = (name: string) => {
  const p = providers.value.find((x) => x.name === name);
  if (p) p.status = "Removed";
};

definePageMeta({ layout: "dashboard" });
</script>

