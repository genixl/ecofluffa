<template>
  <div
    class="rounded-2xl overflow-hidden transition-all duration-200 group cursor-pointer"
    style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    :style="hovered ? `background-color: var(--bg-surface); box-shadow: var(--shadow-lg); transform: translateY(-3px); border-color: var(--brand-blue);` : ''"
  >
    <!-- Avatar strip -->
    <div class="h-1.5 w-full" style="background: var(--brand-blue);"></div>

    <div class="p-5">
      <!-- Header row -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <ProviderAvatar :photoUrl="photoUrl" :name="name" :size="44" rounded="0.75rem" />
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-base leading-tight truncate" style="color: var(--text-primary);">{{ name }}</h3>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-xs" style="color: var(--text-muted);">{{ location }}</span>
            </div>
          </div>
        </div>
        <!-- Rating badge -->
        <div
          class="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold"
          style="background-color: var(--brand-blue-light); color: var(--brand-blue);"
        >
          <Icon name="mdi:star" size="16" style="color: #fbbf24;" />
          <span>{{ rating }}</span>
        </div>
      </div>

      <!-- Star display -->
      <div class="flex gap-0.5 mb-4">
      </div>

      <!-- Services -->
      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="service in services"
          :key="service"
          class="text-xs px-2.5 py-1 rounded-full font-medium"
          style="background-color: var(--bg-subtle); color: var(--text-muted); border: 1px solid var(--border-color);"
        >{{ service }}</span>
      </div>

      <!-- CTA -->
      <NuxtLink
        :to="to || '/browse'"
        class="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
        style="background: var(--brand-orange);"
      >
        View Provider
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  location: string
  rating: number
  services: string[]
  to?: string
  photoUrl?: string | null
}>()

const hovered = ref(false)
</script>
