<template>
  <div class="bg-brand-white text-brand-charcoal">
    <div class="max-w-6xl mx-auto px-4 py-10">
      <div class="border border-brand-gray bg-brand-gray p-6">
        <div class="text-brand-blue text-3xl font-bold">
          {{ provider.name }}
        </div>
        <div class="text-brand-charcoal mt-2">
          Location: {{ provider.location }}
        </div>
        <div class="text-brand-charcoal mt-1 font-semibold">
          Rating: {{ provider.rating }} / 5
        </div>

        <div class="mt-6">
          <SectionHeader
            title="Available Services"
            subtitle="Choose what you want cleaned"
          />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceCard
              v-for="s in provider.servicesDetailed"
              :key="s.title"
              :title="s.title"
              :price="s.price"
              :description="s.description"
            />
          </div>
        </div>

        <div class="mt-8">
          <AppButton
            label="Place Order"
            variant="primary"
            type="button"
            @click="placeOrder"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type DetailedService = {
  title: string;
  price: string;
  description: string;
};

type Provider = {
  name: string;
  location: string;
  rating: number;
  servicesDetailed: DetailedService[];
};

const router = useRouter();
const route = useRoute();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const providers = ref<Provider[]>([
  {
    name: "Ocean Breeze Laundry",
    location: "Riverside District",
    rating: 4.6,
    servicesDetailed: [
      {
        title: "Wash & Fold",
        price: "KSh 195 / kg",
        description: "Gentle wash, fold, and quality finishing for everyday items.",
      },
      {
        title: "Ironing",
        price: "KSh 104 / item",
        description: "Pressing and crisp finishing for shirts, pants, and uniforms.",
      },
      {
        title: "Dry Cleaning",
        price: "KSh 1,040 / item",
        description: "Careful dry cleaning for suits, dresses, and delicate garments.",
      },
    ],
  },
  {
    name: "Sunshine Suds Co.",
    location: "Central Business Area",
    rating: 4.4,
    servicesDetailed: [
      {
        title: "Wash & Fold",
        price: "KSh 169 / kg",
        description: "Reliable cleaning with consistent folding and packaging.",
      },
      {
        title: "Stain Removal",
        price: "KSh 780 / request",
        description: "Spot-treatment for common stains using provider best practices.",
      },
      {
        title: "Blanket Cleaning",
        price: "KSh 1,560 / blanket",
        description: "Deep cleaning for blankets, comforters, and heavy linens.",
      },
    ],
  },
  {
    name: "FreshWave Laundry",
    location: "North End",
    rating: 4.7,
    servicesDetailed: [
      {
        title: "Wash & Fold",
        price: "KSh 208 / kg",
        description: "Fast turnaround for everyday laundry and mixed loads.",
      },
      {
        title: "Delicate Care",
        price: "KSh 1,170 / basket",
        description: "Low-tumble cleaning for delicates like lingerie and silk blends.",
      },
      {
        title: "Curtain Cleaning",
        price: "KSh 1,950 / panel",
        description: "Professional cleaning with careful drying and fold-up packaging.",
      },
    ],
  },
]);

const routeId = computed(() => String(route.params.id ?? ""));

const provider = computed<Provider>(() => {
  const match = providers.value.find((p) => slugify(p.name) === routeId.value);
  return (
    match ?? {
      name: "Selected Laundry Provider",
      location: "Pickup Service Area",
      rating: 4.5,
      servicesDetailed: [],
    }
  );
});

const placeOrder = () => {
  router.push("/order/new");
};

definePageMeta({ layout: "default" });
</script>

