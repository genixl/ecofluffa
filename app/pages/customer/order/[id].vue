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
        <div class="flex items-start gap-4">
          <ProviderAvatar
            v-if="order.provider"
            :photoUrl="order.provider.photo_url"
            :name="order.provider.name"
            :size="64"
            rounded="1rem"
          />
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
          <div class="text-primary">{{ order.provider?.phone }}</div>
          <div class="text-muted text-xs mt-1">Call or text the provider directly to confirm pickup.</div>
        </div>
        <div class="bg-surface border border-theme rounded-xl p-5 shadow-sm">
          <div class="text-xs font-semibold text-muted mb-1">Manage Order</div>
          <div class="flex flex-col gap-2">
            <AppButton
              v-if="order.status === 'delivered' && !order.delivery_confirmed"
              label="Confirm Delivery"
              variant="primary"
              type="button"
              @click="showConfirmDeliveryModal = true"
            />
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
              @click="showRescheduleModal = true"
            />
          </div>
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

      <!-- Rating section: only when delivered and confirmed, not yet rated -->
      <div
        v-if="order.status === 'delivered' && order.delivery_confirmed && !existingRating"
        class="mt-8 rounded-2xl p-6 flex items-center justify-between gap-4"
        style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b;"
      >
        <div>
          <div class="font-bold" style="color: #92400e;">How was your laundry experience?</div>
          <div class="text-sm mt-0.5" style="color: #b45309;">Rate {{ order.provider?.name }} to help other customers.</div>
        </div>
        <button
          @click="showRatingModal = true"
          class="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;"
        >
          Rate Service ★
        </button>
      </div>

      <!-- Already rated banner -->
      <div
        v-else-if="order.status === 'delivered' && existingRating"
        class="mt-8 rounded-2xl p-4 flex items-center gap-3"
        style="background-color: #d1fae5; border: 1px solid #10b981;"
      >
        <Icon name="mdi:star" size="20" style="color: #f59e0b;" />
        <div>
          <span class="font-semibold text-sm" style="color: #065f46;">You rated this service</span>
          <span class="ml-2">
            <span v-for="s in 5" :key="s">
              <Icon name="mdi:star" size="14" :style="s <= existingRating.score ? 'color: #f59e0b;' : 'color: #d1fae5;'" />
            </span>
          </span>
        </div>
      </div>

      <div class="mt-8">
        <NuxtLink to="/customer/orders" class="text-brand-blue font-semibold text-sm hover:underline">
          ← Back to all orders
        </NuxtLink>
      </div>
    </template>

    <div v-else class="text-center py-16 text-muted">Order not found.</div>

    <!-- ── Reschedule Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showRescheduleModal"
          class="fixed inset-0 flex items-center justify-center z-50 p-4"
          style="background: rgba(0,0,0,0.55);"
          @click.self="showRescheduleModal = false"
        >
          <div
            class="rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            style="background-color: var(--bg-surface);"
          >
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: var(--brand-blue-light);">
                <Icon name="mdi:clock-edit-outline" size="22" style="color: var(--brand-blue);" />
              </div>
              <div>
                <h2 class="text-lg font-bold" style="color: var(--text-primary);">Reschedule Pickup</h2>
                <p class="text-xs" style="color: var(--text-muted);">Order {{ order?.id }}</p>
              </div>
            </div>
            <label class="text-sm font-semibold mb-2 block" style="color: var(--text-primary);">New pickup time</label>
            <input
              v-model="newPickupTime"
              type="time"
              class="w-full border-2 rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-brand-blue"
              style="border-color: var(--border-color); background-color: var(--bg-subtle); color: var(--text-primary);"
            />
            <div class="flex gap-3">
              <button
                :disabled="!newPickupTime || rescheduling"
                @click="confirmReschedule"
                class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                style="background-color: var(--brand-blue); color: #fff;"
              >
                {{ rescheduling ? 'Saving…' : 'Confirm' }}
              </button>
              <button
                @click="showRescheduleModal = false"
                class="flex-1 py-3 rounded-xl text-sm font-bold"
                style="background-color: var(--bg-subtle); color: var(--text-primary);"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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

    <!-- ── Rating Modal ── -->
    <RatingModal
      v-if="order"
      v-model="showRatingModal"
      :order-id="order.id"
      :provider-id="order.provider_id"
      :provider-name="order.provider?.name ?? 'Provider'"
      @submitted="onRatingSubmitted"
    />

    <!-- ── Delivery Confirmation Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showConfirmDeliveryModal"
          class="fixed inset-0 flex items-center justify-center z-50 p-4"
          style="background: rgba(0,0,0,0.55);"
          @click.self="showConfirmDeliveryModal = false"
        >
          <div
            class="rounded-2xl p-8 max-w-md w-full shadow-2xl"
            style="background-color: var(--bg-surface);"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style="background-color: #d1fae5;"
              >
                <Icon name="mdi:check-circle" size="26" style="color: #10b981;" />
              </div>
              <div>
                <h2 class="text-xl font-bold" style="color: var(--text-primary);">Confirm Delivery</h2>
                <p class="text-sm mt-0.5" style="color: var(--text-muted);">Order {{ order?.id }}</p>
              </div>
            </div>

            <p class="text-sm mb-8 leading-relaxed" style="color: var(--text-muted);">
              Have you received your laundry from {{ order?.provider?.name }}? Please confirm only after you have received your items.
            </p>

            <div class="flex gap-3">
              <button
                :disabled="confirmingDelivery"
                @click="confirmDeliveryAction"
                class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                style="background-color: #10b981; color: #fff;"
              >
                {{ confirmingDelivery ? 'Confirming…' : 'Yes, I Received It' }}
              </button>
              <button
                @click="showConfirmDeliveryModal = false"
                class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style="background-color: var(--bg-subtle); color: var(--text-primary);"
              >
                Not Yet
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Receipt Modal ── -->
    <ReceiptModal
      v-if="order"
      v-model="showReceiptModal"
      :order-id="order.id"
      :provider-name="order.provider?.name ?? 'Provider'"
      :services="order.order_services || []"
      :total="order.total_estimate"
      :date="order.created_at"
    />
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types/supabase'

const route = useRoute()
const { userName } = useAuth()
const { getOrderById, getFlowStepIndex, cancelOrder, rescheduleOrder, confirmDelivery, recentActivities, loadAll, getRatingForOrder } = useCustomerOrders()
const { success, error } = useToast()

const loading = ref(true)
const showCancelModal = ref(false)
const showRescheduleModal = ref(false)
const showRatingModal = ref(false)
const showConfirmDeliveryModal = ref(false)
const showReceiptModal = ref(false)
const cancelling = ref(false)
const rescheduling = ref(false)
const confirmingDelivery = ref(false)
const newPickupTime = ref('')

const routeId = computed(() => String(route.params.id ?? ''))

onMounted(async () => {
  await loadAll()
  loading.value = false
})

const order = computed(() => getOrderById(routeId.value))
const flowIndex = computed(() => order.value ? getFlowStepIndex(order.value.status) : -1)
const existingRating = computed(() => order.value ? getRatingForOrder(order.value.id) : null)

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

const confirmReschedule = async () => {
  if (!order.value || !newPickupTime.value) return
  rescheduling.value = true
  try {
    await rescheduleOrder(order.value.id, newPickupTime.value)
    showRescheduleModal.value = false
    success(`Pickup rescheduled to ${newPickupTime.value}.`)
    newPickupTime.value = ''
  } catch {
    error('Failed to reschedule. Please try again.')
  } finally {
    rescheduling.value = false
  }
}

const confirmDeliveryAction = async () => {
  if (!order.value) return
  confirmingDelivery.value = true
  try {
    const ok = await confirmDelivery(order.value.id, userName.value)
    if (ok) {
      showConfirmDeliveryModal.value = false
      // Show rating modal after successful delivery confirmation
      setTimeout(() => {
        showRatingModal.value = true
      }, 500)
    } else {
      error('Failed to confirm delivery. Please try again.')
    }
  } catch {
    error('Failed to confirm delivery. Please try again.')
  } finally {
    confirmingDelivery.value = false
  }
}

const onRatingSubmitted = () => {
  loadAll(true)
  // Show receipt after rating
  showReceiptModal.value = true
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.95); }
</style>
