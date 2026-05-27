<template>
  <span :class="badgeClass">
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
type Status = "pending" | "washing" | "ready" | "delivered" | "cancelled";

const props = defineProps<{
  status: Status;
}>();

const statusLabel = computed(() => {
  const s = props.status;
  return s.charAt(0).toUpperCase() + s.slice(1);
});

const badgeClass = computed(() => {
  const base = "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold";

  if (props.status === "pending") {
    return `${base} bg-yellow-100 text-yellow-800`;
  }

  if (props.status === "cancelled") {
    return `${base} bg-red-100 text-red-700`;
  }

  if (props.status === "washing") {
    return `${base} bg-blue-100  text-blue-800`;
  }

  if (props.status === "ready") {
    return `${base} bg-orange-100  text-orange-800`;
  }

  return `${base} bg-gray-100  text-gray-800`;
});
</script>

