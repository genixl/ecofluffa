<template>
  <div class="min-h-screen flex flex-col transition-theme" style="background-color: var(--bg-base); color: var(--text-primary);">
    <AppNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
