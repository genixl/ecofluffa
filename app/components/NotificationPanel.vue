<template>
  <Transition name="panel">
    <div
      v-if="open"
      class="absolute left-full mt-2 ml-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-[200]"
      style="
        background-color: var(--bg-surface);
        border: 1px solid var(--border-color);
        top: calc(100% + 8px);
      "
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3"
        style="border-bottom: 1px solid var(--border-color);"
      >
        <div class="flex items-center gap-2">
          <Icon name="mdi:bell" size="18" style="color: var(--brand-blue);" />
          <span class="font-bold text-sm" style="color: var(--text-primary);">Notifications</span>
          <span
            v-if="unreadCount > 0"
            class="text-xs font-bold px-1.5 py-0.5 rounded-full"
            style="background-color: #ef4444; color: #fff;"
          >{{ unreadCount }}</span>
        </div>
        <button
          v-if="unreadCount > 0"
          @click="markAllRead"
          class="text-xs font-semibold hover:underline transition-opacity"
          style="color: var(--brand-blue);"
        >
          Mark all read
        </button>
      </div>

      <!-- Notification list -->
      <div class="max-h-80 overflow-y-auto">
        <div v-if="notifications.length === 0" class="py-10 text-center">
          <Icon name="mdi:bell-off-outline" size="32" style="color: var(--text-muted);" />
          <div class="text-sm mt-2" style="color: var(--text-muted);">No notifications yet</div>
        </div>

        <div
          v-for="n in notifications"
          :key="n.id"
          class="flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-subtle)]"
          :style="!n.read ? 'background-color: var(--brand-blue-light);' : ''"
          @click="handleClick(n)"
        >
          <!-- Icon -->
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            :style="n.type === 'new_message'
              ? 'background-color: #fef3c7; color: #92400e;'
              : 'background-color: var(--brand-blue-light); color: var(--brand-blue);'"
          >
            <Icon
              :name="n.type === 'new_message' ? 'mdi:chat-outline' : 'mdi:refresh'"
              size="16"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-1">
              <span
                class="text-xs font-bold leading-tight"
                style="color: var(--text-primary);"
              >{{ n.title }}</span>
              <span
                v-if="!n.read"
                class="w-2 h-2 rounded-full shrink-0 mt-1"
                style="background-color: var(--brand-blue);"
              />
            </div>
            <p class="text-xs mt-0.5 leading-relaxed" style="color: var(--text-muted);">
              {{ n.body }}
            </p>
            <span class="text-xs" style="color: var(--text-faint);">
              {{ formatTime(n.createdAt) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        v-if="notifications.length > 0"
        class="px-4 py-2.5 text-center"
        style="border-top: 1px solid var(--border-color);"
      >
        <button
          @click="markAllRead"
          class="text-xs font-semibold hover:underline"
          style="color: var(--text-muted);"
        >
          Clear all
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { InAppNotification } from '~/composables/useInAppNotifications'

const props = defineProps<{
  open: boolean
  linkPrefix?: string
}>()

const emit = defineEmits<{ close: [] }>()
const router = useRouter()
const { notifications, unreadCount, markAllRead, markRead } = useInAppNotifications()

const handleClick = (n: InAppNotification) => {
  markRead(n.id)
  if (n.orderId && props.linkPrefix) {
    router.push(`${props.linkPrefix}/${n.orderId}`)
    emit('close')
  }
}

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}
</script>

<style scoped>
.panel-enter-active { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.panel-leave-active { transition: all 0.15s ease-in; }
.panel-enter-from { opacity: 0; transform: translateY(-8px) scale(0.97); }
.panel-leave-to  { opacity: 0; transform: translateY(-8px) scale(0.97); }
</style>
