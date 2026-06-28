<template>
  <div>
    <SectionHeader
      title="Custom Service Approvals"
      subtitle="Review custom services submitted by providers before they go live"
    />

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading pending services…</div>

    <div
      v-else-if="pendingCustomServices.length === 0"
      class="bg-surface border border-theme rounded-xl p-10 text-center text-muted"
    >
      <Icon name="mdi:check-decagram" size="40" class="mb-3" style="color: var(--brand-blue);" />
      <div class="font-semibold text-primary">All caught up</div>
      <div class="text-sm mt-1">No custom services awaiting approval.</div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="svc in pendingCustomServices"
        :key="svc.id"
        class="bg-surface border border-theme rounded-xl p-6 shadow-theme-sm"
      >
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="font-bold text-lg" style="color: var(--brand-blue);">{{ svc.title }}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange">
                Pending review
              </span>
            </div>
            <div class="text-sm text-muted mb-2">{{ svc.category }} · {{ svc.price_label }}</div>
            <p class="text-sm text-primary">{{ svc.description }}</p>
            <div class="text-xs text-muted mt-2">
              Turnaround: {{ svc.turnaround }}
              <span v-if="providerName(svc)"> · Submitted by {{ providerName(svc) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 shrink-0">
            <AppButton
              label="Approve"
              variant="primary"
              type="button"
              :loading="actingId === svc.id"
              :disabled="!!actingId"
              @click="handleApprove(svc.id)"
            />
            <AppButton
              label="Reject"
              variant="outline"
              type="button"
              :loading="actingId === svc.id"
              :disabled="!!actingId"
              @click="handleReject(svc.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Service } from '~/types/supabase'

const {
  pendingCustomServices,
  loadPendingCustomServices,
  approveCustomService,
  rejectCustomService,
} = useAdminPlatform()
const { success, error: toastError } = useToast()

const loading = ref(true)
const actingId = ref<string | null>(null)

const providerName = (svc: Service & { provider?: { name: string } }) =>
  svc.provider?.name ?? ''

onMounted(async () => {
  await loadPendingCustomServices()
  loading.value = false
})

const handleApprove = async (id: string) => {
  actingId.value = id
  const result = await approveCustomService(id)
  actingId.value = null
  if (result.error) toastError(result.error)
  else success('Custom service approved. It is now visible on the provider listing.')
}

const handleReject = async (id: string) => {
  actingId.value = id
  const result = await rejectCustomService(id)
  actingId.value = null
  if (result.error) toastError(result.error)
  else success('Custom service rejected.')
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
