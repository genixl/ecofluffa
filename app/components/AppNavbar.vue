<template>
  <header
    class="sticky top-0 z-50 transition-theme"
    style="background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

      <!-- Logo → dashboard when logged in, marketing home when guest -->
      <NuxtLink :to="logoTo" class="flex items-center gap-2 font-black text-xl shrink-0" style="color: var(--brand-blue);">
        <Icon name="mdi:water" size="28" />
        <span>EcoFluffa</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-1 flex-1 justify-center">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
          :style="isActive(link.to)
            ? 'background-color: var(--brand-blue-light); color: var(--brand-blue); font-weight:600;'
            : 'color: var(--text-muted);'"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Desktop Right -->
      <div class="hidden md:flex items-center gap-2">
        <button
          @click="toggleTheme"
          class="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80"
          style="background-color: var(--bg-subtle); color: var(--text-primary);"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:moon-waning-crescent'" size="20" />
        </button>

        <template v-if="isLoggedIn">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold"
            style="background-color: var(--brand-blue-light); color: var(--brand-blue);">
            <Icon :name="roleIcon" size="18" />
            <span>{{ userName || roleLabel }}</span>
          </div>
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 hover:opacity-80"
            style="border-color: var(--border-color); color: var(--text-muted);"
          >
            Log Out
          </button>
        </template>

        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 hover:opacity-80"
            style="border-color: var(--brand-blue); color: var(--brand-blue);"
          >
            Log In
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90"
            style="background-color: var(--brand-orange);"
          >
            Register
          </NuxtLink>
        </template>
      </div>

      <!-- Mobile Right -->
      <div class="flex md:hidden items-center gap-2">
        <button
          @click="toggleTheme"
          class="w-9 h-9 rounded-lg flex items-center justify-center"
          style="background-color: var(--bg-subtle);"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:moon-waning-crescent'" size="20" />
        </button>
        <button
          @click="mobileOpen = !mobileOpen"
          class="w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all"
          style="background-color: var(--bg-subtle); color: var(--text-primary);"
          aria-label="Toggle menu"
        >
          <span class="block w-5 h-0.5 transition-all duration-300" :class="mobileOpen ? 'rotate-45 translate-y-2' : ''" style="background-color: currentColor;"></span>
          <span class="block w-5 h-0.5 transition-all duration-300" :class="mobileOpen ? 'opacity-0' : ''" style="background-color: currentColor;"></span>
          <span class="block w-5 h-0.5 transition-all duration-300" :class="mobileOpen ? '-rotate-45 -translate-y-2' : ''" style="background-color: currentColor;"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <Transition name="slide-down">
      <div
        v-if="mobileOpen"
        class="md:hidden border-t transition-theme"
        style="background-color: var(--bg-surface); border-color: var(--border-color);"
      >
        <div class="px-4 py-4 flex flex-col gap-1">

          <div v-if="isLoggedIn" class="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-1"
            style="background-color: var(--brand-blue-light);">
            <Icon :name="roleIcon" size="18" style="color: var(--brand-blue);" />
            <span class="text-sm font-bold" style="color: var(--brand-blue);">{{ userName || roleLabel }}</span>
            <span class="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style="background-color: var(--brand-blue); color: #fff;">{{ roleLabel }}</span>
          </div>

          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            @click="mobileOpen = false"
            class="px-4 py-3 rounded-lg text-sm font-medium transition-all"
            :style="isActive(link.to)
              ? 'background-color: var(--brand-blue-light); color: var(--brand-blue); font-weight:600;'
              : 'color: var(--text-primary);'"
          >
            {{ link.label }}
          </NuxtLink>

          <div class="flex gap-2 mt-3 pt-3" style="border-top: 1px solid var(--border-color);">
            <template v-if="isLoggedIn">
              <button
                @click="handleLogout"
                class="flex-1 text-center px-4 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all"
                style="border-color: var(--border-color); color: var(--text-muted);"
              >
                Log Out
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/auth/login"
                @click="mobileOpen = false"
                class="flex-1 text-center px-4 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all"
                style="border-color: var(--brand-blue); color: var(--brand-blue);"
              >Log In</NuxtLink>
              <NuxtLink
                to="/auth/register"
                @click="mobileOpen = false"
                class="flex-1 text-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-all"
                style="background-color: var(--brand-orange);"
              >Register</NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()
const { role, userName, isLoggedIn, signOut, getRedirectPath } = useAuth()

const mobileOpen = ref(false)

watch(() => route.path, () => { mobileOpen.value = false })

const roleLabel = computed(() => {
  if (role.value === 'customer') return 'Customer'
  if (role.value === 'provider') return 'Provider'
  if (role.value === 'admin') return 'Admin'
  return ''
})

const roleIcon = computed(() => {
  if (role.value === 'customer') return 'mdi:account'
  if (role.value === 'provider') return 'mdi:store'
  if (role.value === 'admin') return 'mdi:shield-account'
  return 'mdi:account'
})

const logoTo = computed(() => (isLoggedIn.value ? getRedirectPath() : '/'))

// No "Home" link when logged in — dashboard is the default via sidebar / logo
const navLinks = computed(() => {
  if (!isLoggedIn.value) {
    return [
      { to: '/', label: 'Home' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Support' },
    ]
  }
  if (role.value === 'customer') {
    return [
      { to: '/customer/services', label: 'Find Services' },
      { to: '/browse', label: 'Browse Providers' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Support' },
    ]
  }
  if (role.value === 'provider') {
    return [
      { to: '/provider/services', label: 'My Services' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Support' },
    ]
  }
  if (role.value === 'admin') {
    return [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/orders', label: 'Orders' },
    ]
  }
  return [
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact Support' },
  ]
})

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

const handleLogout = async () => {
  mobileOpen.value = false
  await signOut()
  await navigateTo('/')
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
