<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="text-xs font-semibold text-gray-500 mb-4">Order Flow</div>
    <div v-if="status === 'cancelled'" class="text-sm text-red-700 font-medium">
      This order was cancelled and will not continue through the flow.
    </div>
    <ol v-else class="flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
      <li
        v-for="(step, index) in flow"
        :key="step"
        class="flex md:flex-1 md:flex-col md:items-center gap-3 md:gap-2 relative"
      >
        <div class="flex items-center gap-3 md:flex-col">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            :class="stepClass(index)"
          >
            {{ index + 1 }}
          </div>
          <div class="md:text-center">
            <div class="text-sm font-semibold text-brand-charcoal">
              {{ labels[step] }}
            </div>
            <div class="text-xs text-gray-500">
              {{ stepHint(step, index) }}
            </div>
          </div>
        </div>
        <div
          v-if="index < flow.length - 1"
          class="hidden md:block absolute top-4 left-[calc(50%+1rem)] w-[calc(100%-2rem)] h-0.5"
          :class="index < currentIndex ? 'bg-brand-blue' : 'bg-gray-200'"
        />
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import {
  ORDER_FLOW,
  STATUS_LABELS,
  type OrderStatus,
} from "~/types/supabase";

const props = defineProps<{
  status: OrderStatus;
  currentIndex: number;
}>();

const flow = ORDER_FLOW;
const labels = STATUS_LABELS;

const stepClass = (index: number) => {
  if (index < props.currentIndex) return "bg-brand-blue text-white";
  if (index === props.currentIndex) return "bg-brand-orange text-white ring-4 ring-brand-orange/20";
  return "bg-gray-100 text-gray-500";
};

const stepHint = (step: OrderStatus, index: number) => {
  if (index < props.currentIndex) return "Completed";
  if (index === props.currentIndex) {
    if (step === "pending") return "Waiting for provider to accept";
    if (step === "washing") return "Currently being processed";
    if (step === "ready") return "Ready for delivery";
    return "Delivered to customer";
  }
  return "Upcoming";
};
</script>
