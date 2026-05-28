<template>
  <div>
    <SectionHeader title="Providers" subtitle="Approve or remove provider accounts" />

    <div class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
      <table class="w-full text-left">
        <thead class="bg-subtle border-b border-theme">
          <tr>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Provider</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Location</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Rating</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Status</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-theme">
          <tr v-for="p in providers" :key="p.name" class="hover:bg-subtle transition-colors">
            <td class="p-4 font-semibold text-primary">{{ p.name }}</td>
            <td class="p-4 text-sm text-muted">{{ p.location }}</td>
            <td class="p-4 text-sm text-primary">{{ p.rating }} / 5</td>
            <td class="p-4 text-sm">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="{
                  'bg-green-100 text-green-700': p.status === 'Approved',
                  'bg-brand-orange/10 text-brand-orange': p.status === 'Pending',
                  'bg-red-100 text-red-600': p.status === 'Removed',
                }"
              >
                {{ p.status }}
              </span>
            </td>
            <td class="p-4">
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