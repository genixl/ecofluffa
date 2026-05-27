<template>
  <div class="min-h-screen transition-theme flex flex-col" style="background-color: var(--bg-base); color: var(--text-primary);">
    <AppNavbar />

    <div class="flex flex-1 relative">
      <!-- Mobile overlay -->
      <Transition name="fade">
        <div v-if="sidebarOpen" class="sidebar-overlay lg:hidden" @click="sidebarOpen = false" />
      </Transition>

      <!-- Sidebar -->
      <aside
        class="fixed lg:static top-0 left-0 h-full lg:h-auto w-72 lg:w-64 z-50 lg:z-auto flex-shrink-0 transition-transform duration-300 ease-in-out flex flex-col"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        style="background-color: var(--bg-surface); border-right: 1px solid var(--border-color); box-shadow: var(--shadow-md);"
      >
        <!-- Sidebar header (mobile only) -->
        <div class="flex items-center justify-between px-5 py-4 lg:hidden" style="border-bottom: 1px solid var(--border-color);">
          <div class="flex items-center gap-2 font-bold text-lg" style="color: var(--brand-blue);"><Icon name="mdi:water" size="24" />EcoFluffa</div>
          <button @click="sidebarOpen = false" class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: var(--bg-subtle); color: var(--text-muted);">✕</button>
        </div>

        <!-- Role label -->
        <div class="px-5 py-5">
          <div class="flex items-center gap-3 mb-1">
            <Icon :name="roleEmoji" size="24" />
            <div>
              <div class="font-bold text-sm" style="color: var(--brand-blue);">{{ roleLabel }}</div>
              <div class="text-xs" style="color: var(--text-muted);">Dashboard</div>
            </div>
          </div>
        </div>

        <!-- Nav items -->
        <nav class="flex-1 px-3 pb-4 overflow-y-auto">
          <div class="flex flex-col gap-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              :style="item.active
                ? 'background-color: var(--brand-blue); color: #fff; box-shadow: 0 2px 8px rgba(15,76,129,0.3);'
                : 'color: var(--text-muted);'"
              :class="!item.active ? 'hover:bg-[var(--bg-subtle)]' : ''"
              :aria-current="item.active ? 'page' : undefined"
            >
              <Icon :name="item.icon" size="18" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>
        </nav>

        <!-- Logout -->
        <div class="px-3 pb-5" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full"
            style="color: var(--text-muted);"
          >
            <Icon name="mdi:logout" size="18" />
            <span>Exit to Home</span>
          </NuxtLink>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Mobile top bar -->
        <div
          class="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style="background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color);"
        >
          <button
            @click="sidebarOpen = true"
            class="w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-1.5"
            style="background-color: var(--bg-subtle); color: var(--text-primary);"
            aria-label="Open sidebar"
          >
            <span class="block w-4 h-0.5" style="background-color: currentColor;"></span>
            <span class="block w-4 h-0.5" style="background-color: currentColor;"></span>
            <span class="block w-4 h-0.5" style="background-color: currentColor;"></span>
          </button>
          <span class="font-semibold text-sm" style="color: var(--text-primary);">{{ roleLabel }}</span>
          <div class="ml-auto flex items-center gap-2">
            <span class="text-xs px-2 py-1 rounded-full font-medium" style="background-color: var(--brand-blue-light); color: var(--brand-blue);">{{ roleLabel }}</span>
          </div>
        </div>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebarOpen = ref(false)

// Close sidebar on route change
watch(() => route.path, () => { sidebarOpen.value = false })

type NavItem = { to: string; label: string; icon: string; active: boolean }

const role = computed(() => {
  if (route.path.startsWith('/customer')) return 'customer'
  if (route.path.startsWith('/provider')) return 'provider'
  return 'admin'
})

const roleLabel = computed(() => {
  if (role.value === 'customer') return 'Customer'
  if (role.value === 'provider') return 'Provider'
  return 'Admin'
})

const roleEmoji = computed(() => {
  if (role.value === 'customer') return 'mdi:washing-machine'
  if (role.value === 'provider') return 'mdi:store'
  return 'mdi:shield-account'
})

const navItems = computed<NavItem[]>(() => {
  const prefix = role.value === 'customer' ? '/customer'
    : role.value === 'provider' ? '/provider'
    : '/admin'

  const items = role.value === 'customer'
    ? [
        { to: `${prefix}`, label: 'Dashboard', icon: 'mdi:home' },
        { to: `${prefix}/services`, label: 'Find Services', icon: 'mdi:magnify' },
        { to: `${prefix}/orders`, label: 'My Orders', icon: 'mdi:package' },
        { to: `${prefix}/profile`, label: 'Profile', icon: 'mdi:account' },
      ]
    : role.value === 'provider'
      ? [
          { to: `${prefix}`, label: 'Dashboard', icon: 'mdi:home' },
          { to: `${prefix}/orders`, label: 'Incoming Orders', icon: 'mdi:inbox' },
          { to: `${prefix}/services`, label: 'My Services', icon: 'mdi:washing-machine' },
          { to: `${prefix}/profile`, label: 'Business Profile', icon: 'mdi:store' },
        ]
      : [
          { to: `${prefix}`, label: 'Overview', icon: 'mdi:chart-box' },
          { to: `${prefix}/orders`, label: 'All Orders', icon: 'mdi:package' },
          { to: `${prefix}/providers`, label: 'Providers', icon: 'mdi:store' },
          { to: `${prefix}/customers`, label: 'Customers', icon: 'mdi:account-group' },
          { to: `${prefix}/reports`, label: 'Reports', icon: 'mdi:chart-line' },
        ]

  return items.map(it => ({
    ...it,
    active: route.path === it.to || (it.to !== prefix && route.path.startsWith(`${it.to}/`)) || (it.to === prefix && route.path === prefix),
  }))
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
