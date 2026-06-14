<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[280px] max-w-[380px]"
          :style="toastStyle(toast.type)"
        >
          <!-- Icon -->
          <div class="shrink-0 w-6 h-6 flex items-center justify-center rounded-full mt-0.5" :style="iconBgStyle(toast.type)">
            <Icon :name="iconName(toast.type)" size="14" style="color: #fff;" />
          </div>

          <!-- Message -->
          <p class="flex-1 text-sm font-semibold leading-snug" style="color: #fff;">
            {{ toast.message }}
          </p>

          <!-- Dismiss -->
          <button
            @click="dismiss(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
            style="color: #fff;"
          >
            <Icon name="mdi:close" size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToast()

const toastStyle = (type: 'success' | 'error' | 'info' | 'warning') => {
  const map = {
    success: 'background: linear-gradient(135deg, #10b981, #059669);',
    error:   'background: linear-gradient(135deg, #ef4444, #dc2626);',
    info:    'background: linear-gradient(135deg, #3b82f6, #2563eb);',
    warning: 'background: linear-gradient(135deg, #f59e0b, #d97706);',
  }
  return map[type]
}

const iconBgStyle = (type: 'success' | 'error' | 'info' | 'warning') => {
  const map = {
    success: 'background: rgba(255,255,255,0.25);',
    error:   'background: rgba(255,255,255,0.25);',
    info:    'background: rgba(255,255,255,0.25);',
    warning: 'background: rgba(255,255,255,0.25);',
  }
  return map[type]
}

const iconName = (type: 'success' | 'error' | 'info' | 'warning') => {
  return { success: 'mdi:check', error: 'mdi:close', info: 'mdi:information', warning: 'mdi:bell-ring' }[type]
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}
</style>
