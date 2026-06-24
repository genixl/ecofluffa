<template>
  <footer class="transition-theme mt-auto" style="background-color: var(--bg-surface); border-top: 1px solid var(--border-color);">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="flex items-center gap-2 font-black text-xl mb-3" style="color: var(--brand-blue);">
            <Icon name="mdi:water" size="24" />
            EcoFluffa
          </div>
          <p class="text-sm leading-relaxed max-w-sm" style="color: var(--text-muted);">
            Connecting you with trusted local laundry providers. Book a pickup, track progress, and receive clean laundry Effortlessly
          </p>
          <div class="flex gap-3 mt-4">
            <button class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" style="background-color: var(--bg-subtle); color: var(--text-muted);" aria-label="Twitter"><Icon name="mdi:twitter" size="16" /></button>
            <button class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" style="background-color: var(--bg-subtle); color: var(--text-muted);" aria-label="LinkedIn"><Icon name="mdi:linkedin" size="16" /></button>
            <button class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" style="background-color: var(--bg-subtle); color: var(--text-muted);" aria-label="Facebook"><Icon name="mdi:facebook" size="16" /></button>
          </div>
        </div>

        <!-- Services -->
        <div>
          <div class="font-semibold text-sm mb-4" style="color: var(--text-primary);">Services</div>
          <ul class="flex flex-col gap-2">
            <li v-for="link in serviceLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm hover:opacity-80 transition-opacity" style="color: var(--text-muted);">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Company -->
        
      </div>

      <!-- Bottom bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" style="border-top: 1px solid var(--border-color);">
        <p class="text-xs" style="color: var(--text-faint);">
          © {{ new Date().getFullYear() }} EcoFluffa. All rights reserved.
        </p>
        <div class="flex gap-6">
          <span class="text-xs cursor-pointer hover:opacity-80" style="color: var(--text-faint);">Privacy Policy</span>
          <span class="text-xs cursor-pointer hover:opacity-80" style="color: var(--text-faint);">Terms of Service</span>
          <span class="text-xs cursor-pointer hover:opacity-80" style="color: var(--text-faint);">Cookie Policy</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const serviceLinks = [
  { to: '/customer/browse', label: 'Browse Providers' },
  { to: '/order/new', label: 'Book a Pickup' },
  { to: '/customer/orders', label: 'Track Orders' },
]

</script>
