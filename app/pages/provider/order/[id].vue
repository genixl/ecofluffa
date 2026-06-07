<template>
  <div>
    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading order…</div>

    <template v-else-if="order">
      <div class="flex items-start justify-between gap-6">
        <div>
          <div class="text-brand-blue font-bold text-3xl">Order {{ order.id }}</div>
          <div class="text-brand-charcoal mt-2">Customer Pickup: {{ order.pickup_date }} at {{ order.pickup_time }}</div>
          <div class="text-brand-charcoal text-sm mt-1">Customer: {{ order.customer?.full_name }}</div>
        </div>
        <OrderStatusBadge :status="order.status" />
      </div>

      <div class="mt-8">
        <SectionHeader title="Customer Details" subtitle="Where to pick up and drop off" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-surface border border-theme rounded-xl p-5">
            <div class="text-xs font-semibold text-muted mb-1">Pickup Address</div>
            <div class="text-primary">{{ order.pickup_address }}</div>
            <a :href="mapsUrl" target="_blank" rel="noopener" class="mt-3 inline-block text-sm text-brand-blue font-semibold hover:underline">
              View on Maps
            </a>
          </div>
          <div class="bg-surface border border-theme rounded-xl p-5">
            <div class="text-xs font-semibold text-muted mb-1">Customer Contact</div>
            <div class="text-primary">{{ order.customer?.phone || '—' }}</div>
            <div class="text-muted text-xs mt-1">Call or text to confirm pickup time.</div>
          </div>
          <div class="bg-surface border border-theme rounded-xl p-5">
            <div class="text-xs font-semibold text-muted mb-1">Notes</div>
            <div class="text-primary text-sm">{{ order.notes || 'No special instructions provided.' }}</div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <SectionHeader title="Manage Order" subtitle="Update the status as you process the laundry" />
        <div class="flex flex-wrap gap-3">
          <AppButton label="Accept Order" variant="primary" type="button" @click="setStatus('washing')" :disabled="order.status !== 'pending'" />
          <AppButton label="Mark Ready" variant="outline" type="button" @click="setStatus('ready')" :disabled="order.status !== 'washing'" />
          <AppButton label="Mark Delivered" variant="outline" type="button" @click="setStatus('delivered')" :disabled="order.status !== 'ready'" />
          <AppButton label="Cancel Order" variant="outline" type="button" @click="setStatus('cancelled')" :disabled="order.status === 'delivered' || order.status === 'cancelled'" />
        </div>
      </div>

      <div class="mt-8">
        <OrderFlowTimeline :status="order.status" :current-index="currentFlowIndex" />
      </div>

      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderMessagesPanel
          :order-id="order.id"
          current-role="provider"
          :sender-name="providerName"
          other-party-label="customer"
        />
        <div>
          <SectionHeader title="Platform activity" />
          <ActivityFeed :items="orderActivities" order-link-prefix="/provider/order" />
        </div>
      </div>

      <div class="mt-8">
        <SectionHeader title="Services" subtitle="What needs processing" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceCard
            v-for="srv in order.order_services"
            :key="srv.id"
            :title="srv.title"
            :price="srv.price"
            :description="srv.description"
          />
        </div>
      </div>
    </template>

    <div v-else class="text-center py-16 text-muted">Order not found.</div>
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types/supabase'

const route = useRoute()
const { profile } = useAuth()
const { getOrderById, updateOrderStatus, getFlowStepIndex, recentActivities, loadAll } = useProviderOrders()

const loading = ref(true)
const routeId = computed(() => String(route.params.id ?? ''))

onMounted(async () => {
  await loadAll()
  loading.value = false
})

const order = computed(() => getOrderById(routeId.value))
const currentFlowIndex = computed(() => order.value ? getFlowStepIndex(order.value.status) : -1)
const providerName = computed(() => order.value?.provider?.name ?? profile.value?.full_name ?? 'Provider')

const orderActivities = computed(() =>
  recentActivities.value.filter((a) => a.order_id === routeId.value)
)

const setStatus = async (next: OrderStatus) => {
  if (!order.value) return
  await updateOrderStatus(order.value.id, next)
}

const mapsUrl = computed(() => {
  const encoded = encodeURIComponent(order.value?.pickup_address ?? '')
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
