<template>
  <div>
    <SectionHeader
      title="All Orders"
      subtitle="Same data as customer & provider dashboards — click to manage"
    />

    <div class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
      <table class="w-full text-left">
        <thead class="bg-subtle border-b border-theme">
          <tr>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Order</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Provider</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Customer</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Status</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Pickup</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border-theme">
          <tr
            v-for="o in orders"
            :key="o.id"
            class="hover:bg-subtle transition-colors"
          >
            <td class="p-4 font-semibold text-primary">{{ o.id }}</td>
            <td class="p-4 text-sm text-primary">{{ o.provider }}</td>
            <td class="p-4 text-sm text-primary">{{ o.customerName }}</td>
            <td class="p-4">
              <OrderStatusBadge :status="o.status" />
            </td>
            <td class="p-4 text-sm text-muted">{{ o.pickupDate }}</td>
            <td class="p-4">
              <NuxtLink
                :to="`/admin/order/${o.id}`"
                class="font-semibold text-sm hover:underline"
                style="color: var(--brand-blue);"
              >
                Manage →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminPlatform } from "~/composables/useAdminPlatform";

const { orders } = useAdminPlatform();

definePageMeta({ layout: "dashboard" });
</script>