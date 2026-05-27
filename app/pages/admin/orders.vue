<template>
  <div>
    <SectionHeader
      title="All Orders"
      subtitle="Same data as customer & provider dashboards — click to manage"
    />

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Order</th>
            <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Provider</th>
            <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
            <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Pickup</th>
            <th class="p-4 text-xs font-semibold text-gray-500 uppercase" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="o in orders"
            :key="o.id"
            class="hover:bg-gray-50/80"
          >
            <td class="p-4 font-semibold text-brand-charcoal">{{ o.id }}</td>
            <td class="p-4 text-sm">{{ o.provider }}</td>
            <td class="p-4 text-sm">{{ o.customerName }}</td>
            <td class="p-4">
              <OrderStatusBadge :status="o.status" />
            </td>
            <td class="p-4 text-sm text-gray-600">{{ o.pickupDate }}</td>
            <td class="p-4">
              <NuxtLink
                :to="`/admin/order/${o.id}`"
                class="text-brand-blue font-semibold text-sm hover:underline"
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
