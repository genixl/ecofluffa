<template>
  <div
    class="rounded-2xl p-6"
    style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);"
  >
    <div class="text-xs font-bold uppercase tracking-widest mb-6" style="color: var(--text-muted);">
      Order Progress
    </div>

    <!-- Cancelled state -->
    <div v-if="status === 'cancelled'" class="flex items-center gap-4 py-2">
      <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style="background-color: #fee2e2; border: 2px solid #ef4444;">
        <Icon name="mdi:close" size="20" style="color: #ef4444;" />
      </div>
      <div>
        <div class="font-bold text-sm" style="color: #ef4444;">Order Cancelled</div>
        <div class="text-xs mt-0.5" style="color: var(--text-muted);">This order will not be processed.</div>
      </div>
    </div>

    <!-- Active flow -->
    <ol v-else class="flex flex-col md:flex-row md:items-start gap-0">
      <li
        v-for="(step, index) in flow"
        :key="step"
        class="flex md:flex-col md:items-center md:flex-1 relative"
      >
        <!-- Connector line (horizontal on md, vertical on mobile) -->
        <div
          v-if="index < flow.length - 1"
          class="hidden md:block absolute top-5 left-[calc(50%+20px)] h-0.5 transition-all duration-700"
          :style="`
            width: calc(100% - 40px);
            background-color: ${index < currentIndex ? 'var(--brand-blue)' : 'var(--border-color)'};
          `"
        />
        <!-- Mobile vertical connector -->
        <div
          v-if="index < flow.length - 1"
          class="block md:hidden w-0.5 h-6 mt-1 mb-1 ml-5 transition-all duration-700"
          :style="`background-color: ${index < currentIndex ? 'var(--brand-blue)' : 'var(--border-color)'};`"
        />

        <div class="flex md:flex-col md:items-center gap-4 md:gap-2 pb-4 md:pb-0 relative z-10">
          <!-- Step circle -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500"
            :class="index === currentIndex ? 'step-pulse' : ''"
            :style="stepCircleStyle(index)"
          >
            <Icon :name="stepIcon(step)" size="18" style="color: #fff;" />
          </div>

          <!-- Label -->
          <div class="md:text-center">
            <div
              class="text-sm font-bold transition-colors duration-300"
              :style="index <= currentIndex
                ? 'color: var(--text-primary);'
                : 'color: var(--text-muted);'"
            >
              {{ labels[step] }}
            </div>
            <div class="text-xs mt-0.5" style="color: var(--text-muted);">
              {{ stepHint(step, index) }}
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { ORDER_FLOW, STATUS_LABELS, type OrderStatus } from '~/types/supabase'

const props = defineProps<{
  status: OrderStatus
  currentIndex: number
}>()

const flow = ORDER_FLOW
const labels = STATUS_LABELS

const stepIcon = (step: OrderStatus) => {
  const icons: Record<OrderStatus, string> = {
    pending:   'mdi:clock-outline',
    washing:   'mdi:washing-machine',
    ready:     'mdi:package-variant-closed',
    delivered: 'mdi:check-circle',
    cancelled: 'mdi:close-circle',
  }
  return icons[step] ?? 'mdi:circle'
}

const stepCircleStyle = (index: number) => {
  if (index < props.currentIndex) {
    return 'background-color: var(--brand-blue);'
  }
  if (index === props.currentIndex) {
    return 'background-color: var(--brand-orange); box-shadow: 0 0 0 6px rgba(249,115,22,0.18);'
  }
  return 'background-color: var(--bg-subtle); border: 2px solid var(--border-color);'
}

const stepHint = (step: OrderStatus, index: number) => {
  if (index < props.currentIndex) return 'Done ✓'
  if (index === props.currentIndex) {
    const hints: Partial<Record<OrderStatus, string>> = {
      pending:   'Waiting for provider',
      washing:   'Being processed now',
      ready:     'Packed & ready',
      delivered: 'Completed',
    }
    return hints[step] ?? ''
  }
  return 'Upcoming'
}
</script>

<style scoped>
@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0.45); }
  70%  { box-shadow: 0 0 0 10px rgba(249,115,22,0); }
  100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
}
.step-pulse {
  animation: pulse-ring 1.8s ease-out infinite;
}
</style>
