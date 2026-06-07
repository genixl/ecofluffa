<template>
  <div
    class="rounded-2xl p-5 transition-all duration-200 relative overflow-hidden"
    style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
  >
    <!-- Decorative accent -->
    <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-6 translate-x-6" style="background-color: var(--brand-blue);"></div>

    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--text-muted);">{{ label }}</p>
        <p class="text-2xl sm:text-3xl font-black leading-none" style="color: var(--text-primary);">{{ value }}</p>
        <p v-if="hint" class="text-xs mt-2" style="color: var(--text-faint);">{{ hint }}</p>
      </div>
      <div v-if="icon" class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style="background-color: var(--brand-blue-light);">{{ icon }}</div>
    </div>

    <!-- Bottom accent bar -->
<div class="mt-4 h-1 rounded-full" style="background: var(--brand-orange); opacity: 0.5;"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  hint?: string
  icon?: string
}>()
</script>
