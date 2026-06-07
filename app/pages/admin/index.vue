<template>
  <div>
    <SectionHeader
      title="Admin Overview"
      subtitle="Monitor orders, messages, and activity across the whole platform"
    />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading dashboard…</div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
        <div class="lg:sticky lg:top-4">
          <SectionHeader title="Platform Stats" subtitle="Quick overview" class="mb-6" />
          <div class="grid grid-cols-2 gap-4">
            <CustomerStatCard label="Total Orders" :value="adminStats.totalOrders" />
            <CustomerStatCard label="Active Now" :value="adminStats.activeOrders" />
            <CustomerStatCard label="Providers" :value="adminStats.totalProviders" />
            <CustomerStatCard label="Customers" :value="adminStats.totalCustomers" />
            <CustomerStatCard label="Pending" :value="adminStats.pending" />
            <CustomerStatCard label="Messages" :value="adminStats.messageCount" />
          </div>
        </div>
        <div class="lg:col-span-2">
          <SectionHeader title="Support & Management" subtitle="Platform assistance" class="mb-6" />
          <div class="theme-card rounded-2xl p-8 flex flex-col justify-between bg-surface border border-theme shadow-sm">
            <div>
              <div class="font-bold text-2xl mb-4" style="color: var(--brand-blue);">Manage Support Inquiries</div>
              <p class="text-base mb-8 leading-relaxed" style="color: var(--text-muted);">
                Review and respond to all customer feedback, support tickets, and contact form submissions. 
                Keep track of pending issues to ensure high platform satisfaction.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtLink
                to="/admin/contacts"
                class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style="background-color: var(--brand-blue); color: white;"
              >
                <Icon name="mdi:message-multiple" size="20" /> View All Messages
              </NuxtLink>
              <NuxtLink
                to="/contact"
                class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-200 border-2 hover:bg-subtle"
                style="border-color: var(--brand-blue); color: var(--brand-blue);"
              >
                <Icon name="mdi:headset" size="20" /> Contact Support
              </NuxtLink>
            </div>
          </div>

          <div class="mt-8 bg-surface border border-theme rounded-2xl p-6 shadow-theme-sm">
            <div class="font-bold text-lg mb-4 flex items-center gap-2" style="color: var(--brand-blue);">
              <Icon name="mdi:workflow" size="20" />
              Unified Platform Workflow
            </div>
            <ul class="text-sm space-y-3">
              <li class="flex gap-3">
                <span class="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span style="color: var(--text-muted);">Customer books a service → order appears for provider & admin.</span>
              </li>
              <li class="flex gap-3">
                <span class="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span style="color: var(--text-muted);">Provider accepts & updates status → customer timeline updates instantly.</span>
              </li>
              <li class="flex gap-3">
                <span class="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span style="color: var(--text-muted);">Real-time messaging allows all parties to communicate seamlessly.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mb-12">
        <SectionHeader title="Recent Orders" subtitle="The last 10 orders across the platform" />
        <div class="bg-surface border border-theme rounded-2xl shadow-theme-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead class="bg-subtle border-b border-theme">
                <tr>
                  <th class="p-4 text-xs font-bold text-muted uppercase tracking-wider">ID</th>
                  <th class="p-4 text-xs font-bold text-muted uppercase tracking-wider">Customer</th>
                  <th class="p-4 text-xs font-bold text-muted uppercase tracking-wider">Provider</th>
                  <th class="p-4 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                  <th class="p-4 text-xs font-bold text-muted uppercase tracking-wider">Total</th>
                  <th class="p-4 text-xs font-bold text-muted uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-theme">
                <tr v-for="o in orders.slice(0, 10)" :key="o.id" class="hover:bg-subtle transition-colors group">
                  <td class="p-4 text-sm font-bold text-primary">{{ o.id }}</td>
                  <td class="p-4 text-sm text-primary">{{ o.customer?.full_name ?? '—' }}</td>
                  <td class="p-4 text-sm text-primary">{{ o.provider?.name ?? '—' }}</td>
                  <td class="p-4"><OrderStatusBadge :status="o.status" /></td>
                  <td class="p-4 text-sm font-medium" style="color: var(--text-muted);">{{ o.total_estimate }}</td>
                  <td class="p-4 text-right">
                    <NuxtLink 
                      :to="`/admin/order/${o.id}`" 
                      class="inline-flex items-center gap-1 font-bold text-sm text-brand-blue hover:underline"
                    >
                      Manage <Icon name="mdi:chevron-right" size="16" />
                    </NuxtLink>
                  </td>
                </tr>
                <tr v-if="orders.length === 0">
                  <td colspan="6" class="p-12 text-center text-muted text-sm italic">
                    <Icon name="mdi:clipboard-text-off" size="32" class="mb-2 block mx-auto opacity-20" />
                    No orders have been placed yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="mt-6 text-center">
          <NuxtLink to="/admin/orders" class="inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-theme text-sm font-bold text-brand-blue hover:bg-subtle transition-all">
            View All Platform Orders <Icon name="mdi:arrow-right" size="18" />
          </NuxtLink>
        </div>
      </div>

      <SectionHeader title="Recent Activity" subtitle="Live feed from customers, providers, and admin" />
      <ActivityFeed :items="recentActivities.slice(0, 8)" order-link-prefix="/admin/order" />
    </template>
  </div>
</template>

<script setup lang="ts">
const { adminStats, recentActivities, orders, loadAll } = useAdminPlatform()
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