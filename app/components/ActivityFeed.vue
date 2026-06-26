<template>
  <div class="flex flex-col gap-0">
    <div
      v-for="(item, i) in items"
      :key="item.id"
      class="flex gap-3 group"
    >
      <!-- Timeline line + dot -->
      <div class="flex flex-col items-center">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          :style="dotStyle(item.type)"
        ><Icon :name="typeIcon(item.type)" size="18" /></div>
        <div
          v-if="i < items.length - 1"
          class="w-0.5 flex-1 mt-1"
          style="background-color: var(--border-color); min-height: 12px;"
        ></div>
      </div>

      <!-- Content -->
      <div class="pb-5 flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="font-semibold text-sm leading-tight" style="color: var(--text-primary);">{{ item.title }}</span>
          <span class="text-xs shrink-0" style="color: var(--text-faint);">{{ formatTime(item.at) }}</span>
        </div>
        <p class="text-xs mt-0.5 leading-relaxed" style="color: var(--text-muted);">{{ item.detail }}</p>
        <NuxtLink
          v-if="orderLinkPrefix && item.orderId"
          :to="`${orderLinkPrefix}/${item.orderId}`"
          class="text-xs font-semibold mt-1 inline-block hover:underline"
          style="color: var(--brand-blue);"
        >{{ item.orderId }} →</NuxtLink>
      </div>
    </div>

    <div v-if="items.length === 0" class="text-sm py-6 text-center" style="color: var(--text-faint);">No recent activity.</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    id: string
    orderId?: string
    type: string
    title: string
    detail: string
    at: string
    actor?: string
    actorName?: string
  }>
  orderLinkPrefix?: string
}>()

const typeIcon = (type: string) => {
  if (type === 'booking')  return 'mdi:clipboard-list-outline'
  if (type === 'status')   return 'mdi:refresh'
  if (type === 'message')  return 'mdi:chat-outline'
  if (type === 'admin')    return 'mdi:shield-account'
  return 'mdi:pin'
}

const dotStyle = (type: string) => {
  if (type === 'booking')  return 'background-color: var(--brand-blue-light); color: var(--brand-blue);'
  if (type === 'status')   return 'background-color: #d1fae5; color: #065f46; dark:bg-green-900/30 dark:text-green-400'
  if (type === 'message')  return 'background-color: #fef3c7; color: #92400e; dark:bg-yellow-900/30 dark:text-yellow-400'
  if (type === 'admin')    return 'background-color: #fce7f3; color: #9d174d; dark:bg-pink-900/30 dark:text-pink-400'
  return 'background-color: var(--bg-subtle); color: var(--text-muted);'
}

const formatTime = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
  } catch {
    return iso
  }
}
</script>
