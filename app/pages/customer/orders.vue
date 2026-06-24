<template>
  <div>
    <SectionHeader title="My Orders" subtitle="All your laundry orders in one place" />

    <!-- Skeleton loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonCard v-for="i in 6" :key="i" :rows="3" :row-height="20" class="bg-surface border border-theme rounded-xl p-6 shadow-sm" />
    </div>

    <div v-else-if="orders.length === 0" class="bg-surface border border-theme rounded-xl p-10 text-center">
      <div class="text-primary font-semibold">No orders yet</div>
      <div class="text-muted text-sm mt-2">Book your first laundry pickup to get started.</div>
      <NuxtLink to="/customer/services" class="inline-block mt-4 bg-brand-orange text-white px-5 py-2 rounded-lg text-sm font-semibold">
        Browse Services
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <OrderCard
        v-for="o in orders"
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
  </div>
</template>

<script setup lang="ts">
const { orders, loadAll } = useCustomerOrders()
const loading = ref(true)

onMounted(async () => {
  await loadAll()
  loading.value = false
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
