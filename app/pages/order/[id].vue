<template>
  <div class="bg-gray-50 text-brand-charcoal py-12">
    <div class="max-w-6xl mx-auto px-6">
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
        <div class="flex items-start justify-between gap-6 mb-8">
          <div>
            <div class="text-brand-blue font-bold text-3xl mb-2">
              Order Details
            </div>
            <div class="text-gray-600">
              Provider: <span class="font-semibold text-brand-charcoal">{{ order.provider }}</span>
            </div>
            <div class="text-gray-600 text-sm mt-2">
              {{ order.pickupDate }} at {{ order.pickupTime }}
            </div>
          </div>
          <div>
            <OrderStatusBadge :status="order.status" />
          </div>
        </div>

        <div class="border-t border-gray-200 pt-8">
          <SectionHeader
            title="Services"
            subtitle="Services processed for this order"
          />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceCard
              v-for="s in order.services"
              :key="s.title"
              :title="s.title"
              :price="s.price"
              :description="s.description"
            />
          </div>
        </div>
      </div>

      <div class="text-center">
        <AppButton
          label="Back to Orders"
          variant="secondary"
          type="button"
          @click="$router.push('/customer/orders')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Status = "pending" | "washing" | "ready" | "delivered" | "cancelled";

type Service = {
  title: string;
  price: string;
  description: string;
};

type Order = {
  id: string;
  provider: string;
  status: Status;
  pickupDate: string;
  pickupTime: string;
  services: Service[];
};

const route = useRoute();

const orders = ref<Order[]>([
  {
    id: "EF-2048",
    provider: "Ocean Breeze Laundry",
    status: "washing",
    pickupDate: "2026-05-28",
    pickupTime: "14:30",
    services: [
      {
        title: "Wash & Fold",
        price: "KSh 3,120",
        description: "Mixed-load wash and fold for everyday items.",
      },
      {
        title: "Ironing",
        price: "KSh 1,248",
        description: "Crisp press for shirts and office attire.",
      },
    ],
  },
  {
    id: "EF-1007",
    provider: "FreshWave Laundry",
    status: "ready",
    pickupDate: "2026-05-27",
    pickupTime: "10:00",
    services: [
      {
        title: "Delicate Care",
        price: "KSh 2,340",
        description: "Low-tumble cleaning designed for delicates.",
      },
      {
        title: "Curtain Cleaning",
        price: "KSh 3,900",
        description: "Professional cleaning with careful drying.",
      },
    ],
  },
]);

const routeId = computed(() => String(route.params.id ?? ""));

const order = computed<Order>(() => {
  return (
    orders.value.find((o) => o.id === routeId.value) ?? {
      id: routeId.value,
      provider: "Selected Laundry Provider",
      status: "pending",
      pickupDate: "2026-05-29",
      pickupTime: "09:15",
      services: [],
    }
  );
});

definePageMeta({ layout: "default" });
</script>

