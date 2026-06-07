<template>
  <div>
    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading order…</div>

    <template v-else-if="order">
      <div class="flex items-start justify-between gap-6 mb-8">
        <div>
          <div class="text-brand-blue font-bold text-3xl">Order {{ order.id }}</div>
          <div class="text-brand-charcoal mt-2">Provider: <span class="font-semibold">{{ order.provider?.name }}</span></div>
          <div class="text-brand-charcoal text-sm mt-1">Customer: {{ order.customer?.full_name }}</div>
          <div class="text-brand-charcoal text-sm mt-1">Pickup: {{ order.pickup_date }} at {{ order.pickup_time }}</div>
          <div class="text-brand-orange font-semibold text-sm mt-2">{{ order.total_estimate }}</div>
        </div>
        <OrderStatusBadge :status="order.status" />
      </div>

      <OrderFlowTimeline :status="order.status" :current-index="flowIndex" />

      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface border border-theme rounded-xl p-5">
          <div class="text-xs font-semibold text-muted mb-1">Pickup Address</div>
          <div class="text-primary">{{ order.pickup_address }}</div>
        </div>
        <div class="bg-surface border border-theme rounded-xl p-5">
          <div class="text-xs font-semibold text-muted mb-1">Customer Phone</div>
          <div class="text-primary">{{ order.customer?.phone || '—' }}</div>
        </div>
        <div class="bg-surface border border-theme rounded-xl p-5">
          <div class="text-xs font-semibold text-muted mb-1">Notes</div>
          <div class="text-primary text-sm">{{ order.notes || 'None' }}</div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderMessagesPanel :order-id="order.id" current-role="admin" sender-name="Ecofluffa Admin" other-party-label="customer & provider" readonly />
        <div>
          <SectionHeader title="Activity Log" subtitle="Full audit trail" />
          <ActivityFeed :items="orderActivities" order-link-prefix="/admin/order" />
        </div>
      </div>

      <div class="mt-8">
        <SectionHeader title="Services" subtitle="What was ordered" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceCard v-for="s in order.order_services" :key="s.id" :title="s.title" :price="s.price" :description="s.description" />
        </div>
      </div>
    </template>

    <div v-else class="text-center py-16 text-muted">Order not found.</div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getOrderById, getFlowStepIndex, recentActivities, loadAll } = useAdminPlatform()

const loading = ref(true)
const routeId = computed(() => String(route.params.id ?? ''))

onMounted(async () => {
  await loadAll(true)
  loading.value = false
})

const order = computed(() => getOrderById(routeId.value))
const flowIndex = computed(() => order.value ? getFlowStepIndex(order.value.status) : -1)

const orderActivities = computed(() =>
  recentActivities.value.filter((a) => a.order_id === routeId.value)
)

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
