<template>
  <div>
    <SectionHeader title="Providers" subtitle="All registered laundry providers on the platform" />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading providers…</div>

    <div v-else-if="providers.length === 0" class="bg-surface border border-theme rounded-xl p-10 text-center text-muted">
      No providers registered yet.
    </div>

    <div v-else class="bg-surface border border-theme rounded-xl overflow-hidden shadow-theme-sm">
      <table class="w-full text-left">
        <thead class="bg-subtle border-b border-theme">
          <tr>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Provider</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Location</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Rating</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Reviews</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Visibility</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-theme">
          <tr v-for="p in providers" :key="p.id" class="hover:bg-subtle transition-colors">
            <td class="p-4 font-semibold text-primary">{{ p.name }}</td>
            <td class="p-4 text-sm text-muted">{{ p.location || 'N/A' }}</td>
            <td class="p-4 text-sm text-primary">{{ p.rating }} / 5</td>
            <td class="p-4 text-sm text-muted">{{ p.review_count }}</td>
            <td class="p-4 text-sm">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="p.is_listed ? 'bg-green-100 text-green-700' : 'bg-brand-orange/10 text-brand-orange'"
              >
                {{ p.is_listed ? 'Listed' : 'Not listed' }}
              </span>
            </td>
            <td class="p-4 text-sm text-muted">{{ formatDate(p.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { providers, loadProviders } = useAdminPlatform()
const loading = ref(true)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

onMounted(async () => {
  await loadProviders()
  loading.value = false
})

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
