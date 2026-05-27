<template>
  <div
    class="min-h-screen flex items-center justify-center py-10 px-4 transition-theme"
    style="background: linear-gradient(135deg, var(--brand-blue) 0%, #1565c0 40%, #0d47a1 100%); color: var(--text-primary);"
  >
    <!-- Decorative bubbles -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
    </div>

    <div class="w-full max-w-md relative z-10">
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-2 font-black text-3xl text-white hover:opacity-90 transition-opacity">
          <Icon name="mdi:water" size="40" />
          EcoFluffa
        </NuxtLink>
        <p class="text-blue-200 text-sm mt-2">Laundry Pickup &amp; Delivery</p>
      </div>

      <div
        class="rounded-2xl p-8 transition-theme"
        style="background-color: var(--bg-surface); box-shadow: var(--shadow-lg); border: 1px solid var(--border-color);"
      >
        <slot />
      </div>

      <p class="text-center text-blue-200 text-xs mt-6">
        © {{ new Date().getFullYear() }} EcoFluffa · All rights reserved
      </p>
    </div>
  </div>
</template>

<style scoped>
.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  animation: float 8s ease-in-out infinite;
}
.bubble-1 { width: 300px; height: 300px; top: -80px; right: -60px; animation-delay: 0s; }
.bubble-2 { width: 200px; height: 200px; bottom: 10%; left: -50px; animation-delay: 3s; }
.bubble-3 { width: 150px; height: 150px; top: 40%; right: 5%; animation-delay: 5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}
</style>
