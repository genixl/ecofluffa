<template>
  <div class="browse-page min-h-screen pt-6">
    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="mb-12">
        <h1 class="text-4xl font-bold mb-2" style="color: var(--brand-blue);">Browse Providers</h1>
        <p class="text-muted">Find the perfect laundry service for your needs</p>
      </div>

      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
        <div class="flex-1 md:max-w-sm">
          <InputField
            label="Search providers"
            type="text"
            placeholder="e.g., Sunshine"
            v-model="query"
          />
        </div>
        <div class="results-badge text-sm">
          Showing {{ providers.length }} provider results
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProviderCard
          v-for="p in providers"
          :key="p.name"
          :name="p.name"
          :location="p.location"
          :rating="p.rating"
          :services="p.services"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Provider = {
  name: string;
  location: string;
  rating: number;
  services: string[];
};

const query = ref("");

const providers = ref<Provider[]>([
  {
    name: "Ocean Breeze Laundry",
    location: "Riverside District",
    rating: 4.6,
    services: ["Wash & Fold", "Ironing", "Dry Cleaning"],
  },
  {
    name: "Sunshine Suds Co.",
    location: "Central Business Area",
    rating: 4.4,
    services: ["Wash & Fold", "Stain Removal", "Blanket Cleaning"],
  },
  {
    name: "FreshWave Laundry",
    location: "North End",
    rating: 4.7,
    services: ["Wash & Fold", "Delicate Care", "Curtain Cleaning"],
  },
  {
    name: "CitySpin Laundromat",
    location: "Downtown",
    rating: 4.3,
    services: ["Wash & Fold", "Steam Press", "Shoe Cleaning"],
  },
  {
    name: "GreenLeaf Cleaners",
    location: "Westside",
    rating: 4.5,
    services: ["Eco Wash", "Delicate Care", "Blanket Cleaning"],
  },
  {
    name: "RoyalRinse Laundry",
    location: "East Heights",
    rating: 4.2,
    services: ["Dry Cleaning", "Stain Removal", "Curtain Cleaning"],
  },
]);

definePageMeta({ layout: "default" });
</script>

<style scoped>
.browse-page {
  background-color: var(--bg-base);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.results-badge {
  background-color: var(--bg-surface);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>