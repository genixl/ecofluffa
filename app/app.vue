<template>
  <div class="min-h-screen transition-theme" style="background-color: var(--bg-base); color: var(--text-primary);">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>
