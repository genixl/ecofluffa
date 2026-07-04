<template>
  <NuxtLink
    :to="to"
    class="block rounded-2xl p-5 transition-all duration-200 group relative"
    style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
    :style="{ '--hover-shadow': 'var(--shadow-md)' }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    :class="hovered ? 'card-hovered' : ''"
  >
    <!-- Urgency badge -->
    <div
      v-if="urgency"
      class="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
      :style="urgency === 'overdue'
        ? 'background-color: #fee2e2; color: #ef4444;'
        : 'background-color: #ffedd5; color: #ea580c;'"
    >
      {{ urgency === 'overdue' ? '⚠ Overdue' : '📅 Today' }}
    </div>

    <!-- Top row -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <span class="text-xs font-bold tracking-wide px-2 py-1 rounded-lg" style="background-color: var(--bg-subtle); color: var(--text-muted);">{{ orderId }}</span>
      <OrderStatusBadge :status="status" />
    </div>

    <!-- Provider / Customer -->
    <div class="font-semibold text-sm mb-1 truncate" style="color: var(--text-primary);">
      <div class="flex items-center gap-2">
        <ProviderAvatar
          v-if="role === 'customer' && providerPhotoUrl"
          :photoUrl="providerPhotoUrl"
          :name="provider"
          :size="24"
          rounded="0.375rem"
        />
        <Icon v-else :name="role === 'customer' ? 'mdi:store' : 'mdi:account'" size="16" />
        <span>{{ role === 'customer' ? provider : (customerName || 'Customer') }}</span>
      </div>
    </div>

    <!-- Date -->
    <div class="flex items-center gap-1 text-xs mb-3" style="color: var(--text-muted);">
      <Icon name="mdi:calendar" size="14" />
      <span>{{ date }}</span>
    </div>

    <!-- Address -->
    <div v-if="pickupAddress" class="flex items-start gap-1 text-xs mb-4" style="color: var(--text-muted);">
      <Icon name="mdi:map-marker" size="16" class="shrink-0 mt-0.5" />
      <span class="leading-relaxed">{{ pickupAddress }}</span>
    </div>

    <!-- Footer -->
    <div
      class="flex items-center justify-between pt-3"
      style="border-top: 1px solid var(--border-color);"
    >
      <span class="text-xs font-medium" style="color: var(--text-faint);">
        {{ role === 'customer' ? 'Tap to track' : 'Tap to manage' }}
      </span>
      <span class="text-xs font-bold" style="color: var(--brand-blue);">→</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  orderId: string
  provider: string
  status: string
  date: string
  role: 'customer' | 'provider' | 'admin'
  to: string
  pickupAddress?: string
  customerName?: string
  urgency?: 'today' | 'overdue' | null
  providerPhotoUrl?: string | null
}>()

const hovered = ref(false)
</script>

<style scoped>
.card-hovered {
  box-shadow: var(--shadow-md) !important;
  transform: translateY(-2px);
  border-color: var(--brand-blue) !important;
}
</style>
