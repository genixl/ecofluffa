<template>
  <div class="min-h-screen transition-theme flex flex-col" style="background-color: var(--bg-base); color: var(--text-primary);">
    <AppNavbar />

    <div class="flex flex-1 relative">
      <Transition name="fade">
        <div v-if="sidebarOpen" class="sidebar-overlay lg:hidden" @click="sidebarOpen = false" />
      </Transition>

      <aside
        class="fixed lg:static top-0 left-0 h-full lg:h-auto w-72 lg:w-64 z-50 lg:z-auto flex-shrink-0 transition-transform duration-300 ease-in-out flex flex-col"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        style="background-color: var(--bg-surface); border-right: 1px solid var(--border-color); box-shadow: var(--shadow-md);"
      >
        <div class="flex items-center justify-between px-5 py-4 lg:hidden" style="border-bottom: 1px solid var(--border-color);">
          <div class="flex items-center gap-2 font-bold text-lg" style="color: var(--brand-blue);"><Icon name="mdi:water" size="24" />EcoFluffa</div>
          <button @click="sidebarOpen = false" class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: var(--bg-subtle); color: var(--text-muted);">✕</button>
        </div>

        <div class="px-5 py-5">
          <div class="flex items-center gap-3 mb-1">
            <Icon :name="roleEmoji" size="24" style="color: var(--brand-blue);" />
            <div>
              <div class="font-bold text-sm" style="color: var(--brand-blue);">{{ roleLabel }}</div>
              <div class="text-xs" style="color: var(--text-muted);">Dashboard</div>
            </div>
          </div>
        </div>

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

        <!-- Enable Notifications prompt -->
        <div
          v-if="notifIsDefault"
          class="mx-3 mb-3 px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all hover:opacity-90"
          style="background: linear-gradient(135deg, #3b82f6, #2563eb);"
          @click="enableNotifications"
          title="Click to enable browser notifications"
        >
          <Icon name="mdi:bell-ring" size="18" style="color:#fff; flex-shrink:0;" />
          <div style="color:#fff;">
            <div class="text-xs font-bold leading-tight">Enable Notifications</div>
            <div class="text-xs opacity-80 leading-tight mt-0.5">Get order & message alerts</div>
          </div>
        </div>
        <div
          v-else-if="notifIsGranted"
          class="mx-3 mb-3 px-4 py-2 rounded-xl flex items-center gap-2"
          style="background-color: var(--bg-subtle);"
        >
          <Icon name="mdi:bell-check" size="16" style="color: #10b981; flex-shrink:0;" />
          <span class="text-xs font-medium" style="color: var(--text-muted);">Notifications on</span>
        </div>

        <div class="px-3 pb-5" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">

          <button
            @click="handleLogout"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full hover:bg-[var(--bg-subtle)]"
            style="color: var(--text-muted);"
          >
            <Icon name="mdi:logout" size="18" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
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
import type { UserRole } from '~/types/supabase'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const supabase = useSupabaseClient()
const { role, signOut, fetchProfile, authUserId, user } = useAuth()
const { needsOnboarding, fetchMyProvider } = useProviderProfile()
const { init: initNotifPermission, requestPermission, isDefault: notifIsDefault, isGranted: notifIsGranted } = useWebNotifications()

const sidebarOpen = ref(false)

watch(() => route.path, () => { sidebarOpen.value = false })

/** Nav matches the dashboard URL you're on (customer/provider/admin). */
const dashboardRole = computed<UserRole | null>(() => {
  if (route.path.startsWith('/customer')) return 'customer'
  if (route.path.startsWith('/provider')) return 'provider'
  if (route.path.startsWith('/admin')) return 'admin'
  return role.value
})

// Load profile in background; nav does not wait on it
onMounted(async () => {
  initNotifPermission()
  const id = user.value?.id ?? authUserId.value
  if (id) {
    await fetchProfile(id)
    return
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.id) {
    authUserId.value = session.user.id
    await fetchProfile(session.user.id)
  }
  if (route.path.startsWith('/provider')) {
    await fetchMyProvider()
  }
})

const enableNotifications = async () => {
  await requestPermission()
}

watch(
  [role, () => route.path],
  () => {
    const r = role.value
    if (!r) return
    const path = route.path
    if (r === 'customer' && (path.startsWith('/admin') || path.startsWith('/provider'))) {
      navigateTo('/customer', { replace: true })
    } else if (r === 'provider' && path.startsWith('/admin')) {
      navigateTo('/provider', { replace: true })
    } else if (r === 'admin' && path.startsWith('/customer')) {
      navigateTo('/admin', { replace: true })
    }
  }
)

type NavItem = { to: string; label: string; icon: string; active: boolean }

const roleLabel = computed(() => {
  if (dashboardRole.value === 'customer') return 'Customer'
  if (dashboardRole.value === 'provider') return 'Provider'
  if (dashboardRole.value === 'admin') return 'Admin'
  return 'Dashboard'
})

const roleEmoji = computed(() => {
  if (dashboardRole.value === 'customer') return 'mdi:washing-machine'
  if (dashboardRole.value === 'provider') return 'mdi:store'
  if (dashboardRole.value === 'admin') return 'mdi:shield-account'
  return 'mdi:view-dashboard'
})

const navItems = computed<NavItem[]>(() => {
  const items =
    dashboardRole.value === 'customer'
      ? [
          { to: '/customer', label: 'Dashboard', icon: 'mdi:home' },
          { to: '/customer/services', label: 'Find Services', icon: 'mdi:magnify' },
          { to: '/customer/browse', label: 'Browse Providers', icon: 'mdi:store-search' },
          { to: '/customer/orders', label: 'My Orders', icon: 'mdi:package' },
          { to: '/customer/profile', label: 'Profile', icon: 'mdi:account' },
        ]
      : dashboardRole.value === 'provider'
        ? needsOnboarding.value
          ? [{ to: '/provider/setup', label: 'Complete setup', icon: 'mdi:clipboard-check' }]
          : [
              { to: '/provider', label: 'Dashboard', icon: 'mdi:home' },
              { to: '/provider/orders', label: 'Incoming Orders', icon: 'mdi:inbox' },
              { to: '/provider/services', label: 'My Services', icon: 'mdi:washing-machine' },
              { to: '/provider/profile', label: 'Business Profile', icon: 'mdi:store' },
            ]
        : dashboardRole.value === 'admin'
          ? [
              { to: '/admin', label: 'Overview', icon: 'mdi:chart-box' },
              { to: '/admin/orders', label: 'All Orders', icon: 'mdi:package' },
              { to: '/admin/providers', label: 'Providers', icon: 'mdi:store' },
              { to: '/admin/customers', label: 'Customers', icon: 'mdi:account-group' },
              { to: '/admin/contacts', label: 'Support', icon: 'mdi:headset' },
              { to: '/admin/reports', label: 'Reports', icon: 'mdi:chart-line' },
            ]
          : []

  return items.map((it) => ({
    ...it,
    active:
      route.path === it.to ||
      (it.to !== '/customer' && it.to !== '/provider' && it.to !== '/admin' && route.path.startsWith(`${it.to}/`)),
  }))
})

const handleLogout = async () => {
  sidebarOpen.value = false
  await signOut()
  authUserId.value = null
  await navigateTo('/')
}
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 40;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
