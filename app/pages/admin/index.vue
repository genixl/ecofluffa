<template>
  <div>
    <SectionHeader
      title="Admin Overview"
      subtitle="Monitor orders, messages, and activity across the whole platform"
    />

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <CustomerStatCard label="Total Orders" :value="adminStats.totalOrders" hint="On platform" />
      <CustomerStatCard label="Active Now" :value="adminStats.activeOrders" hint="Pending to ready" />
      <CustomerStatCard label="Pending" :value="adminStats.pending" hint="Need provider action" />
      <CustomerStatCard label="Messages" :value="adminStats.messageCount" hint="Order conversations" />
    </div>

    <div class="bg-surface border border-theme rounded-xl p-5 mb-8 shadow-theme-sm">
      <div class="font-bold mb-2" style="color: var(--brand-blue);">Unified workflow</div>
      <ol class="text-sm text-muted space-y-2 list-decimal list-inside">
        <li>Customer books a service → order appears for provider & admin.</li>
        <li>Provider accepts & updates status → customer timeline & admin feed update instantly.</li>
        <li>Customer & provider message on the order → all roles see activity.</li>
        <li>Admin can override status or join the conversation on any order.</li>
      </ol>
    </div>

    <SectionHeader title="Recent Activity" subtitle="Live feed from customers, providers, and admin" />

    <ActivityFeed
      :items="recentActivities.slice(0, 8)"
      order-link-prefix="/admin/order"
    />
  </div>
</template>

<script setup lang="ts">
import { useAdminPlatform } from "~/composables/useAdminPlatform";

const { adminStats, recentActivities } = useAdminPlatform();

definePageMeta({ layout: "dashboard" });
</script>