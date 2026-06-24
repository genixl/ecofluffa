<template>
  <div>
    <SectionHeader title="Customers" subtitle="All customer accounts on EcoFluffa" />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading customers…</div>

    <div v-else-if="customers.length === 0" class="bg-surface border border-theme rounded-xl p-10 text-center text-muted">
      No customers registered yet.
    </div>

    <div v-else class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
      <table class="w-full text-left">
        <thead class="bg-subtle border-b border-theme">
          <tr>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Name</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Phone</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Member Since</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-theme">
          <tr v-for="c in customers" :key="c.id" class="hover:bg-subtle transition-colors">
            <td class="p-4 font-semibold text-primary">{{ c.full_name || 'N/A' }}</td>
            <td class="p-4 text-sm text-muted">{{ c.phone || 'N/A' }}</td>
            <td class="p-4 text-sm text-muted">{{ formatDate(c.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { customers, loadCustomers } = useAdminPlatform()
const loading = ref(true)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

onMounted(async () => {
  await loadCustomers()
  loading.value = false
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
