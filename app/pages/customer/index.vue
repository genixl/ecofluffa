<template>
  <div>
    <SectionHeader
      title="Welcome back, Lara"
      subtitle="Search services, track pickups, and manage your laundry in one place"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <CustomerStatCard label="Active Orders" :value="stats.active" hint="Pending, washing, or ready" />
      <CustomerStatCard label="Ready for Pickup" :value="stats.ready" hint="Provider marked as ready" />
      <CustomerStatCard label="Completed" :value="stats.completed" hint="Delivered to you" />
      <CustomerStatCard label="Awaiting Provider" :value="stats.pending" hint="Not yet accepted" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="theme-card rounded-xl p-6">
        <div class="font-bold text-lg mb-1" style="color: var(--brand-blue);">Search Services</div>
        <div class="text-muted text-sm mb-4">
          Find wash, iron, dry clean, and specialty laundry options.
        </div>
        <InputField
          label="Service keyword"
          type="text"
          placeholder="e.g. ironing, dry cleaning"
          v-model="serviceSearch"
        />
        <NuxtLink
          :to="servicesLink"
          class="inline-block mt-2 bg-brand-orange text-brand-white px-6 py-3 font-semibold text-sm rounded-lg hover:shadow-lg hover:bg-opacity-90 transition-all duration-200"
        >
          Browse Services
        </NuxtLink>
      </div>

      <div class="theme-card rounded-xl p-6">
        <div class="font-bold text-lg mb-1" style="color: var(--brand-blue);">Track Your Order</div>
        <div class="text-muted text-sm mb-4">
          Enter your order ID to see live status and pickup details.
        </div>
        <InputField
          label="Order ID"
          type="text"
          placeholder="e.g. EF-2048"
          v-model="trackOrderId"
        />
        <div v-if="trackError" class="text-red-600 text-sm mb-3">
          {{ trackError }}
        </div>
        <AppButton
          label="Track Order"
          variant="primary"
          type="button"
          @click="trackOrder"
        />
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <SectionHeader
        title="Recent Orders"
        subtitle="Tap an order to view full tracking and status"
      />
      <NuxtLink
        to="/customer/orders"
        class="font-semibold text-sm hover:underline shrink-0"
        style="color: var(--brand-blue);"
      >
        View all orders →
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderCard
          v-for="o in recentOrders"
          :key="o.id"
          :orderId="o.id"
          :provider="o.provider"
          :status="o.status"
          :date="o.pickupDate"
          role="customer"
          :pickup-address="o.pickupAddress"
          :to="`/customer/order/${o.id}`"
        />
      </div>
      <div>
        <SectionHeader title="Live Activity" subtitle="Updates from providers & platform" />
        <ActivityFeed
          :items="recentActivities.slice(0, 6)"
          order-link-prefix="/customer/order"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCustomerOrders } from "~/composables/useCustomerOrders";

const router = useRouter();
const { orders, stats, getOrderById, recentActivities } = useCustomerOrders();

const serviceSearch = ref("");
const trackOrderId = ref("");
const trackError = ref("");

const recentOrders = computed(() => orders.value.slice(0, 4));

const servicesLink = computed(() => {
  const q = serviceSearch.value.trim();
  return q ? `/customer/services?q=${encodeURIComponent(q)}` : "/customer/services";
});

const trackOrder = () => {
  trackError.value = "";
  const id = trackOrderId.value.trim();
  if (!id) {
    trackError.value = "Please enter an order ID.";
    return;
  }
  const found = getOrderById(id);
  if (!found) {
    trackError.value = "Order not found. Try EF-2048, EF-1007, EF-0833, or EF-0711.";
    return;
  }
  router.push(`/customer/order/${found.id}`);
};

definePageMeta({ layout: "dashboard" });
</script>

<style scoped>
.theme-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.theme-card:hover {
  box-shadow: var(--shadow-md);
}
</style>