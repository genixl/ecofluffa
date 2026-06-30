<template>
  <div>
    <SectionHeader
      title="Admin Overview"
      subtitle="Platform order counts and account summary"
    />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading dashboard…</div>

    <template v-else-if="stats">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
        <div class="lg:col-span-2">
          <SectionHeader title="Order Counts" subtitle="Orders placed over time" class="mb-6" />
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <CustomerStatCard label="Today" :value="stats.orders.today" />
            <CustomerStatCard label="Last 7 Days" :value="stats.orders.last7Days" />
            <CustomerStatCard label="Last 30 Days" :value="stats.orders.last30Days" />
            <CustomerStatCard label="All Time" :value="stats.orders.total" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CustomerStatCard label="Active Now" :value="stats.orders.active" hint="Pending, washing, or ready" />
            <CustomerStatCard label="Pending" :value="stats.orders.pending" />
            <CustomerStatCard label="Delivered" :value="stats.orders.delivered" />
            <CustomerStatCard label="Cancelled" :value="stats.orders.cancelled" />
          </div>
        </div>

        <div>
          <SectionHeader title="Accounts" subtitle="Registered on the platform" class="mb-6" />
          <div class="grid grid-cols-1 gap-4">
            <CustomerStatCard label="Providers" :value="stats.totalProviders" hint="Total registered" />
            <CustomerStatCard label="Listed Providers" :value="stats.listedProviders" hint="Visible to customers" />
            <CustomerStatCard label="Customers" :value="stats.totalCustomers" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="theme-card rounded-2xl p-8 flex flex-col justify-between bg-surface border border-theme shadow-sm">
          <div>
            <div class="font-bold text-2xl mb-4" style="color: var(--brand-blue);">Manage Support Inquiries</div>
            <p class="text-base mb-8 leading-relaxed" style="color: var(--text-muted);">
              Review and respond to customer feedback, support tickets, and contact form submissions.
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

        <div class="bg-surface border border-theme rounded-2xl p-6 shadow-theme-sm">
          <div class="font-bold text-lg mb-4 flex items-center gap-2" style="color: var(--brand-blue);">
            <Icon name="mdi:chart-line" size="20" />
            Quick Links
          </div>
          <div class="flex flex-col gap-3">
            <NuxtLink to="/admin/providers" class="flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
              <Icon name="mdi:store" size="18" /> View Providers
            </NuxtLink>
            <NuxtLink to="/admin/custom-services" class="flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
              <Icon name="mdi:clipboard-check-outline" size="18" /> Review Custom Services
            </NuxtLink>
            <NuxtLink to="/admin/customers" class="flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
              <Icon name="mdi:account-group" size="18" /> View Customers
            </NuxtLink>
            <NuxtLink to="/admin/reports" class="flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
              <Icon name="mdi:chart-box" size="18" /> View Reports
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { stats, loadStats } = useAdminPlatform()
const loading = ref(true)

onMounted(async () => {
  await loadStats(true)
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
