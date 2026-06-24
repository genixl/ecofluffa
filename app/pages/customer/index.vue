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
        <div class="font-bold text-lg mb-1" style="color: var(--brand-blue);">Browse Providers</div>
        <div class="text-muted text-sm mb-4">Explore verified laundry service providers and compare their offerings.</div>
        <NuxtLink
          to="/customer/browse"
          class="inline-block bg-brand-orange text-brand-white px-6 py-3 font-semibold text-sm rounded-lg hover:shadow-lg hover:bg-opacity-90 transition-all duration-200"
        >
          Browse All Providers
        </NuxtLink>
      </div>

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
          No orders yet. Book your first laundry pickup!
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

      <!-- My Order Updates: customer-only, status + messages only -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="font-bold text-base" style="color: var(--text-primary);">My Order Updates</div>
            <div class="text-xs mt-0.5" style="color: var(--text-muted);">Status changes &amp; messages on your orders</div>
          </div>
          <span
            v-if="orderUpdates.length > 0"
            class="text-xs font-bold px-2 py-0.5 rounded-full"
            style="background-color: var(--brand-blue-light); color: var(--brand-blue);"
          >{{ orderUpdates.length }}</span>
        </div>

        <div v-if="orderUpdates.length === 0"
          class="rounded-xl p-6 text-center"
          style="background-color: var(--bg-surface); border: 1px solid var(--border-color);"
        >
          <Icon name="mdi:bell-check-outline" size="32" style="color: var(--text-muted);" />
          <div class="text-sm mt-2" style="color: var(--text-muted);">No updates yet on your orders.</div>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="item in orderUpdates.slice(0, 8)"
            :key="item.id"
            class="rounded-xl px-4 py-3 flex items-start gap-3 transition-all hover:shadow-sm"
            style="background-color: var(--bg-surface); border: 1px solid var(--border-color);"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              :style="item.type === 'message'
                ? 'background-color: #fef3c7; color: #92400e;'
                : 'background-color: #d1fae5; color: #065f46;'" 
            >
              <Icon :name="item.type === 'message' ? 'mdi:chat-outline' : 'mdi:refresh'" size="14" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-semibold" style="color: var(--text-primary);">{{ item.title }}</div>
              <div class="text-xs mt-0.5 leading-relaxed" style="color: var(--text-muted);">{{ item.detail }}</div>
              <NuxtLink
                v-if="item.orderId"
                :to="`/customer/order/${item.orderId}`"
                class="text-xs font-semibold mt-1 inline-block hover:underline"
                style="color: var(--brand-blue);"
              >{{ item.orderId }} →</NuxtLink>
            </div>
            <span class="text-xs shrink-0" style="color: var(--text-faint);">{{ formatTime(item.at) }}</span>
          </div>
        </div>
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

/** Customer-scoped activities: only status changes and messages */
const orderUpdates = computed(() =>
  recentActivities.value
    .filter((a) => a.type === 'status' || a.type === 'message')
    .slice(0, 8)
    .map((a) => ({
      id: a.id,
      orderId: a.order_id,
      type: a.type,
      title: a.title,
      detail: a.detail,
      at: a.created_at,
    }))
)

const formatTime = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch { return iso }
}

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