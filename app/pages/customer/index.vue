<template>
  <div>
    <SectionHeader
      :title="`Welcome back, ${userName}`"
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
        <div class="text-muted text-sm mb-4">Find wash, iron, dry clean, and specialty laundry options.</div>
        <InputField label="Service keyword" type="text" placeholder="e.g. ironing, dry cleaning" v-model="serviceSearch" />
        <NuxtLink
          :to="servicesLink"
          class="inline-block mt-2 bg-brand-orange text-brand-white px-6 py-3 font-semibold text-sm rounded-lg hover:shadow-lg hover:bg-opacity-90 transition-all duration-200"
        >
          Browse Services
        </NuxtLink>
      </div>

      <div class="theme-card rounded-xl p-6">
        <div class="font-bold text-lg mb-1" style="color: var(--brand-blue);">Track Your Order</div>
        <div class="text-muted text-sm mb-4">Enter your order ID to see live status and pickup details.</div>
        <InputField label="Order ID" type="text" placeholder="e.g. EF-2048" v-model="trackOrderId" />
        <div v-if="trackError" class="text-red-600 text-sm mb-3">{{ trackError }}</div>
        <AppButton label="Track Order" variant="primary" type="button" @click="trackOrder" />
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <SectionHeader title="Recent Orders" subtitle="Tap an order to view full tracking and status" />
      <NuxtLink to="/customer/orders" class="font-semibold text-sm hover:underline shrink-0" style="color: var(--brand-blue);">
        View all orders →
      </NuxtLink>
    </div>

    <div v-if="loadingData" class="text-muted text-sm py-8 text-center">Loading your orders…</div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-if="recentOrders.length === 0" class="col-span-2 text-muted text-sm text-center py-8">
          No orders yet — book your first laundry pickup!
        </div>
        <OrderCard
          v-for="o in recentOrders"
          :key="o.id"
          :orderId="o.id"
          :provider="o.provider?.name ?? ''"
          :status="o.status"
          :date="o.pickup_date"
          role="customer"
          :pickup-address="o.pickup_address"
          :to="`/customer/order/${o.id}`"
        />
      </div>
      <div>
        <SectionHeader title="Live Activity" subtitle="Updates from providers & platform" />
        <ActivityFeed :items="recentActivities.slice(0, 6)" order-link-prefix="/customer/order" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { userName } = useAuth()
const { orders, stats, getOrderById, recentActivities, loadAll } = useCustomerOrders()

const serviceSearch = ref('')
const trackOrderId = ref('')
const trackError = ref('')
const loadingData = ref(true)

onMounted(async () => {
  await loadAll()
  loadingData.value = false
})

const recentOrders = computed(() => orders.value.slice(0, 4))
const servicesLink = computed(() => {
  const q = serviceSearch.value.trim()
  return q ? `/customer/services?q=${encodeURIComponent(q)}` : '/customer/services'
})

const trackOrder = () => {
  trackError.value = ''
  const id = trackOrderId.value.trim()
  if (!id) { trackError.value = 'Please enter an order ID.'; return }
  const found = getOrderById(id)
  if (!found) { trackError.value = 'Order not found. Check your order ID and try again.'; return }
  router.push(`/customer/order/${found.id}`)
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>

<style scoped>
.theme-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.theme-card:hover { box-shadow: var(--shadow-md); }
</style>