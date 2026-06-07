<template>
  <div class="animate-pulse space-y-3">
    <div
      v-for="i in rows"
      :key="i"
      class="rounded-xl"
      :style="`height: ${rowHeight}px; background-color: var(--bg-subtle); width: ${i === rows ? '70%' : '100%'};`"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number
  rowHeight?: number
}>(), {
  rows: 3,
  rowHeight: 20,
})
</script>

<style scoped>
@keyframes shimmer {
  0%   { opacity: 1; }
  50%  { opacity: 0.4; }
  100% { opacity: 1; }
}
.animate-pulse div {
  animation: shimmer 1.6s ease-in-out infinite;
}
</style>
