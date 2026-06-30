<template>
  <div>
    <div v-if="loading" class="space-y-6">
      <SkeletonCard :rows="2" :row-height="36" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard v-for="i in 3" :key="i" :rows="3" :row-height="24" class="bg-surface border border-theme rounded-xl p-5 shadow-sm" />
      </div>
      <SkeletonCard :rows="5" :row-height="30" />
    </div>

    <template v-else-if="order">
      <div class="flex items-start justify-between gap-6">
        <div>
          <div class="text-brand-blue font-bold text-3xl">Order {{ order.id }}</div>
          <div class="text-primary mt-2">Customer Pickup: {{ order.pickup_date }} at {{ order.pickup_time }}</div>
          <div class="text-primary text-sm mt-1">Customer: {{ customerDisplayName }}</div>
        </div>
        <OrderStatusBadge :status="order.status" />
      </div>

      <div class="mt-8">
        <SectionHeader title="Customer Details" subtitle="Where to pick up and drop off" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div
            class="rounded-xl p-5 flex flex-col gap-3"
            style="background-color: var(--brand-blue-light); border: 2px solid var(--brand-blue);"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style="background-color: var(--brand-blue);"
              >
                <Icon name="mdi:map-marker" size="18" style="color: #fff;" />
              </div>
              <span class="text-xs font-bold uppercase tracking-wide" style="color: var(--brand-blue);">Pickup Address</span>
            </div>

            <p class="text-sm font-semibold leading-snug" style="color: var(--text-primary);">
              {{ order.pickup_address }}
            </p>

            <a
              :href="mapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 self-start"
              style="background-color: var(--brand-blue); color: #fff;"
            >
              <Icon name="mdi:map-search" size="17" />
              Open in Google Maps
            </a>
          </div>

          <div class="bg-surface border border-theme rounded-xl p-5">
            <div class="text-xs font-semibold text-muted mb-1">Customer Contact</div>
            <div class="text-primary font-semibold">{{ customerDisplayName }}</div>
            <a
              v-if="customerDisplayPhone"
              :href="`tel:${customerDisplayPhone}`"
              class="text-brand-blue font-semibold text-sm mt-1 inline-block hover:underline"
            >
              {{ customerDisplayPhone }}
            </a>
            <div v-else class="text-muted text-sm">N/A</div>
            <!-- <div class="text-muted text-xs mt-1">Contact details saved from the customer's profile at booking time.</div> -->
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
          :other-party-label="order.customer?.full_name ?? 'Customer'"
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
const { success } = useToast()

const loading = ref(true)
const routeId = computed(() => String(route.params.id ?? ''))

onMounted(async () => {
  await loadAll()
  loading.value = false
})

const order = computed(() => getOrderById(routeId.value))
const currentFlowIndex = computed(() => order.value ? getFlowStepIndex(order.value.status) : -1)
const providerName = computed(() => order.value?.provider?.name ?? profile.value?.full_name ?? 'Provider')

const customerDisplayName = computed(() =>
  order.value?.customer_name?.trim()
  || order.value?.customer?.full_name
  || 'Customer'
)

const customerDisplayPhone = computed(() =>
  order.value?.customer_phone?.trim()
  || order.value?.customer?.phone
  || ''
)

const orderActivities = computed(() =>
  recentActivities.value
    .filter((a) => a.order_id === routeId.value)
    .map((a) => ({
      id: a.id,
      orderId: a.order_id,
      type: a.type,
      title: a.title,
      detail: a.detail,
      at: a.created_at,
      actorName: a.actor_name,
    }))
)

const setStatus = async (next: OrderStatus) => {
  if (!order.value) return
  await updateOrderStatus(order.value.id, next)
  success(`Order status updated to ${next}.`)
}

const mapsUrl = computed(() => {
  const encoded = encodeURIComponent(order.value?.pickup_address ?? '')
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role', 'provider-onboarding'] })
</script>
