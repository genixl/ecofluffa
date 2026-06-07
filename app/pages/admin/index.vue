<template>
  <div>
    <SectionHeader
      title="Admin Overview"
      subtitle="Monitor orders, messages, and activity across the whole platform"
    />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading dashboard…</div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomerStatCard label="Total Orders" :value="adminStats.totalOrders" hint="On platform" />
            <CustomerStatCard label="Active Now" :value="adminStats.activeOrders" hint="Pending to ready" />
            <CustomerStatCard label="Providers" :value="adminStats.totalProviders" hint="Active on platform" />
            <CustomerStatCard label="Customers" :value="adminStats.totalCustomers" hint="Placed orders" />
            <CustomerStatCard label="Pending" :value="adminStats.pending" hint="Need action" />
            <CustomerStatCard label="Messages" :value="adminStats.messageCount" hint="Conversations" />
          </div>
        </div>
        <div class="lg:col-span-2">
          <SectionHeader title="Support" subtitle="Contact support for platform assistance" />
          <div class="theme-card rounded-xl p-6 h-full flex flex-col justify-between">
            <div>
              <div class="font-bold text-lg mb-3" style="color: var(--brand-blue);">Manage Support Messages</div>
              <p class="text-sm mb-5" style="color: var(--text-muted);">
                View all customer inquiries, complaints, and feedback. Respond to messages and track support cases.
              </p>
            </div>
            <div class="flex gap-3">
              <NuxtLink
                to="/admin/contacts"
                class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
                style="background-color: var(--brand-blue); color: white;"
              >
                <Icon name="mdi:message-multiple" size="18" /> View Messages
              </NuxtLink>
              <NuxtLink
                to="/contact"
                class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
                style="background-color: var(--brand-blue); color: white; opacity: 0.8;"
              >
                <Icon name="mdi:headset" size="18" /> Contact Support
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-theme rounded-xl p-5 mb-8 shadow-theme-sm">
        <div class="font-bold mb-2" style="color: var(--brand-blue);">Unified workflow</div>
        <ol class="text-sm text-muted space-y-2 list-decimal list-inside">
          <li>Customer books a service → order appears for provider & admin.</li>
          <li>Provider accepts & updates status → customer timeline & admin feed update instantly.</li>
          <li>Customer & provider message on the order → all roles see activity.</li>
          <li>Admin can view any order, its timeline, messages, and activity.</li>
        </ol>
      </div>

      <SectionHeader title="Recent Activity" subtitle="Live feed from customers, providers, and admin" />
      <ActivityFeed :items="recentActivities.slice(0, 8)" order-link-prefix="/admin/order" />
    </template>
  </div>
</template>

<script setup lang="ts">
const { adminStats, recentActivities, loadAll } = useAdminPlatform()
const loading = ref(true)

onMounted(async () => {
  await loadAll(true)
  loading.value = false
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>

<style scoped>
.theme-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}
</style>