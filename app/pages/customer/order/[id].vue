<template>
  <div>
    <!-- Skeleton loading -->
    <div v-if="loading" class="space-y-6">
      <SkeletonCard :rows="2" :row-height="36" />
      <SkeletonCard :rows="4" :row-height="24" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard v-for="i in 3" :key="i" :rows="3" :row-height="20" />
      </div>
    </div>

    <template v-else-if="order">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <div class="text-brand-blue font-bold text-3xl">Order {{ order.id }}</div>
          <div class="text-brand-charcoal mt-2">
            Provider: <span class="font-semibold">{{ order.provider?.name }}</span>
          </div>
          <div class="text-brand-charcoal text-sm mt-1">
            Pickup: {{ order.pickup_date }} at {{ order.pickup_time }}
          </div>
          <div class="text-brand-orange font-semibold text-sm mt-2">
            Estimated total: {{ order.total_estimate }}
          </div>
        </div>
        <OrderStatusBadge :status="order.status" />
      </div>

      <div class="mt-8">
        <OrderFlowTimeline :status="order.status" :current-index="flowIndex" />
      </div>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface border border-theme rounded-xl p-5 shadow-sm">
          <div class="text-xs font-semibold text-muted mb-1">Pickup Address</div>
          <div class="text-primary">{{ order.pickup_address }}</div>
        </div>
        <div class="bg-surface border border-theme rounded-xl p-5 shadow-sm">
          <div class="text-xs font-semibold text-muted mb-1">Contact Provider</div>
          <div class="text-primary text-sm">{{ order.provider?.phone }}</div>
          <div class="mt-3 flex gap-2">
            <AppButton label="Call" variant="outline" type="button" />
            <AppButton label="Message" variant="outline" type="button" />
          </div>
        </div>
        <div class="bg-surface border border-theme rounded-xl p-5 shadow-sm">
          <div class="text-xs font-semibold text-muted mb-1">Manage Order</div>
          <div class="flex flex-col gap-2">
            <AppButton
              label="Cancel Order"
              variant="outline"
              type="button"
              :disabled="order.status !== 'pending'"
              @click="showCancelModal = true"
            />
            <AppButton
              label="Reschedule Pickup"
              variant="outline"
              type="button"
              :disabled="order.status === 'delivered' || order.status === 'cancelled'"
              @click="onReschedule"
            />
          </div>
          <div v-if="rescheduleNote" class="text-xs text-brand-blue mt-2">{{ rescheduleNote }}</div>
          <div class="text-xs text-muted mt-2">Cancellation is available while the order is still pending.</div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderMessagesPanel
          :order-id="order.id"
          current-role="customer"
          :sender-name="userName"
          :other-party-label="order.provider?.name ?? 'Provider'"
        />
        <div>
          <SectionHeader title="Live activity" subtitle="Track your Activity" />
          <ActivityFeed :items="orderActivities" order-link-prefix="/customer/order" />
        </div>
      </div>

      <div class="mt-8">
        <SectionHeader title="Status Updates" subtitle="What has happened so far" />
        <div class="bg-surface border border-theme rounded-xl divide-y divide-border-theme">
          <div v-for="(event, idx) in statusEvents" :key="idx" class="p-4 flex gap-4">
            <div class="w-2 h-2 rounded-full mt-2 shrink-0" :class="event.done ? 'bg-brand-blue' : 'bg-gray-300'" />
            <div>
              <div class="text-sm font-semibold text-primary">{{ event.title }}</div>
              <div class="text-xs text-muted mt-0.5">{{ event.time }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <SectionHeader title="Services" subtitle="What you requested" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceCard
            v-for="s in order.order_services"
            :key="s.id"
            :title="s.title"
            :price="s.price"
            :description="s.description"
          />
        </div>
      </div>

      <div class="mt-8">
        <NuxtLink to="/customer/orders" class="text-brand-blue font-semibold text-sm hover:underline">
          ← Back to all orders
        </NuxtLink>
      </div>
    </template>

    <div v-else class="text-center py-16 text-muted">Order not found.</div>

    <!-- ── Cancel Confirmation Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCancelModal"
          class="fixed inset-0 flex items-center justify-center z-50 p-4"
          style="background: rgba(0,0,0,0.55);"
          @click.self="showCancelModal = false"
        >
          <div
            class="rounded-2xl p-8 max-w-md w-full shadow-2xl"
            style="background-color: var(--bg-surface);"
          >
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style="background-color: #fee2e2;">
                <Icon name="mdi:alert-circle" size="26" style="color: #ef4444;" />
              </div>
              <div>
                <h2 class="text-xl font-bold" style="color: var(--text-primary);">Cancel Order?</h2>
                <p class="text-sm mt-0.5" style="color: var(--text-muted);">Order {{ order?.id }}</p>
              </div>
            </div>

            <p class="text-sm mb-8 leading-relaxed" style="color: var(--text-muted);">
              Are you sure you want to cancel this order? This action <strong style="color: var(--text-primary);">cannot be undone</strong> and the provider will be notified.
            </p>

            <div class="flex gap-3">
              <button
                :disabled="cancelling"
                @click="confirmCancel"
                class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style="background-color: #ef4444; color: #fff;"
              >
                {{ cancelling ? 'Cancelling…' : 'Yes, Cancel Order' }}
              </button>
              <button
                @click="showCancelModal = false"
                class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style="background-color: var(--bg-subtle); color: var(--text-primary);"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types/supabase'

const route = useRoute()
const { userName } = useAuth()
const { getOrderById, getFlowStepIndex, cancelOrder, rescheduleOrder, recentActivities, loadAll } = useCustomerOrders()
const { success, error } = useToast()

const loading = ref(true)
const rescheduleNote = ref('')
const showCancelModal = ref(false)
const cancelling = ref(false)

const routeId = computed(() => String(route.params.id ?? ''))

onMounted(async () => {
  await loadAll()
  loading.value = false
})

const order = computed(() => getOrderById(routeId.value))
const flowIndex = computed(() => order.value ? getFlowStepIndex(order.value.status) : -1)

const orderActivities = computed(() =>
  recentActivities.value.filter((a) => a.order_id === routeId.value)
)

const statusEvents = computed(() => {
  if (!order.value) return []
  const idx = flowIndex.value
  if (order.value.status === 'cancelled') {
    return [
      { title: 'Order placed', time: order.value.pickup_date, done: true },
      { title: 'Order cancelled', time: 'This order will not be processed', done: true },
    ]
  }
  return [
    { title: 'Order placed', time: `${order.value.pickup_date} · Booking confirmed`, done: true },
    { title: 'Provider accepted', time: 'Pickup scheduled', done: idx >= 1 },
    { title: 'Laundry in progress', time: 'Your items are being washed', done: idx >= 1 },
    { title: 'Ready for delivery', time: 'Clean clothes packed and ready', done: idx >= 2 },
    { title: 'Delivered', time: 'Handed back to you', done: idx >= 3 },
  ]
})

const confirmCancel = async () => {
  if (!order.value) return
  cancelling.value = true
  try {
    await cancelOrder(order.value.id)
    showCancelModal.value = false
    success('Order cancelled successfully.')
  } catch {
    error('Failed to cancel order. Please try again.')
  } finally {
    cancelling.value = false
  }
}

const onReschedule = async () => {
  if (!order.value) return
  await rescheduleOrder(order.value.id, '16:00')
  rescheduleNote.value = 'Pickup rescheduled to 16:00.'
  success('Pickup time rescheduled.')
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.95); }
</style>
