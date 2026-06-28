<template>
  <div>
    <SectionHeader title="Providers" subtitle="Review, approve, disable, or restore laundry providers" />

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
            <th class="p-4 text-xs font-semibold text-muted uppercase">Account Status</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Joined</th>
            <th class="p-4 text-xs font-semibold text-muted uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-theme">
          <tr v-for="p in providers" :key="p.id" class="hover:bg-subtle transition-colors">
            <td class="p-4 font-semibold text-primary">{{ p.name }}</td>
            <td class="p-4 text-sm text-muted">{{ p.location || 'N/A' }}</td>
            <td class="p-4 text-sm text-primary">{{ p.rating }} / 5 ({{ p.review_count }})</td>
            <td class="p-4 text-sm">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="statusClass(p.approval_status)"
              >
                {{ statusLabel(p.approval_status) }}
              </span>
            </td>
            <td class="p-4 text-sm text-muted">{{ formatDate(p.created_at) }}</td>
            <td class="p-4">
              <div class="flex flex-wrap gap-2">
                <AppButton
                  v-if="p.approval_status === 'pending'"
                  label="Approve"
                  variant="primary"
                  type="button"
                  :loading="actingId === p.id"
                  :disabled="!!actingId"
                  @click="handleApprove(p.id)"
                />
                <AppButton
                  v-if="p.approval_status === 'approved'"
                  label="Disable"
                  variant="outline"
                  type="button"
                  :loading="actingId === p.id"
                  :disabled="!!actingId"
                  @click="handleDisable(p.id)"
                />
                <AppButton
                  v-if="p.approval_status === 'disabled'"
                  label="Restore"
                  variant="primary"
                  type="button"
                  :loading="actingId === p.id"
                  :disabled="!!actingId"
                  @click="handleRestore(p.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApprovalStatus } from '~/types/supabase'

const { providers, loadProviders, approveProvider, disableProvider, restoreProvider } = useAdminPlatform()
const { success, error: toastError } = useToast()

const loading = ref(true)
const actingId = ref<string | null>(null)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const statusLabel = (status: ApprovalStatus) => {
  if (status === 'approved') return 'Approved & listed'
  if (status === 'disabled') return 'Disabled'
  return 'Pending approval'
}

const statusClass = (status: ApprovalStatus) => {
  if (status === 'approved') return 'bg-green-100 text-green-700'
  if (status === 'disabled') return 'bg-red-100 text-red-700'
  return 'bg-brand-orange/10 text-brand-orange'
}

onMounted(async () => {
  await loadProviders()
  loading.value = false
})

const handleApprove = async (id: string) => {
  actingId.value = id
  const result = await approveProvider(id)
  actingId.value = null
  if (result.error) toastError(result.error)
  else success('Provider approved and is now visible to customers.')
}

const handleDisable = async (id: string) => {
  actingId.value = id
  const result = await disableProvider(id)
  actingId.value = null
  if (result.error) toastError(result.error)
  else success('Provider disabled. They can contact support to request restoration.')
}

const handleRestore = async (id: string) => {
  actingId.value = id
  const result = await restoreProvider(id)
  actingId.value = null
  if (result.error) toastError(result.error)
  else success('Provider restored and listed again.')
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
