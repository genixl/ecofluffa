<template>
  <div>
    <!-- Toolbar: period filter + export button -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 no-print">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wide mr-1" style="color: var(--text-muted);">Period:</span>
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          @click="selectedPeriod = opt.value"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          :style="selectedPeriod === opt.value
            ? 'background-color: var(--brand-blue); color: #fff; box-shadow: var(--shadow-sm);'
            : 'background-color: var(--bg-subtle); color: var(--text-muted);'"
        >
          {{ opt.label }}
        </button>
      </div>

      <button
        id="report-export-btn"
        @click="handleExport"
        :disabled="exporting"
        class="no-print flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60"
        style="background-color: var(--brand-blue); color: #fff; box-shadow: var(--shadow-sm);"
      >
        <Icon :name="exporting ? 'mdi:loading' : 'mdi:file-download-outline'" size="18" :class="exporting ? 'animate-spin' : ''" />
        {{ exporting ? 'Preparing...' : 'Export PDF' }}
      </button>
    </div>

    <!-- Print-only header (hidden on screen) -->
    <div class="print-only-header" style="display: none;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="font-size: 22px; font-weight: 900; color: #0F4C81;">EcoFluffa</div>
        <div style="width: 1px; height: 20px; background: #e5e7eb;"></div>
        <div style="font-size: 15px; font-weight: 700; color: #1A1D20;">{{ title }}</div>
      </div>
      <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">{{ subtitle }}</div>
      <div style="font-size: 11px; color: #9CA3AF;">
        Period: {{ currentPeriodLabel }} / Generated: {{ generatedAt }}
      </div>
      <div style="height: 1px; background: #e5e7eb; margin: 12px 0 20px;"></div>
    </div>

    <!-- Report content zone -->
    <div id="report-print-zone" ref="printZone">
      <slot :period="selectedPeriod" :since="sinceDate" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface PeriodOption { label: string; value: string }

defineProps<{
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{
  (e: 'period-change', value: string): void
}>()

const periodOptions: PeriodOption[] = [
  { label: '7 Days',   value: '7d' },
  { label: '30 Days',  value: '30d' },
  { label: '90 Days',  value: '90d' },
  { label: 'All Time', value: 'all' },
]

const selectedPeriod = ref('30d')
const exporting = ref(false)

watch(selectedPeriod, (v) => emit('period-change', v))

const sinceDate = computed(() => {
  const d = new Date()
  if (selectedPeriod.value === '7d')  { d.setDate(d.getDate() - 7);  return d.toISOString() }
  if (selectedPeriod.value === '30d') { d.setDate(d.getDate() - 30); return d.toISOString() }
  if (selectedPeriod.value === '90d') { d.setDate(d.getDate() - 90); return d.toISOString() }
  return null
})

const currentPeriodLabel = computed(() =>
  periodOptions.find(o => o.value === selectedPeriod.value)?.label ?? 'All Time'
)

const generatedAt = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date())
)

const handleExport = async () => {
  exporting.value = true
  await new Promise(r => setTimeout(r, 300))
  window.print()
  setTimeout(() => { exporting.value = false }, 800)
}
</script>

<style>
@media print {
  body > * { display: none !important; }

  body > div,
  body > div > div,
  body > div > div > div,
  body > div > div > div > div,
  body > div > div > div > div > main,
  body > div > div > div > div > main > div { display: block !important; }

  aside,
  nav,
  header,
  .no-print,
  [aria-label="Open sidebar"],
  button:not(.print-keep) { display: none !important; }

  .lg\:ml-64 { margin-left: 0 !important; }

  .print-only-header { display: block !important; }

  @page {
    size: A4 portrait;
    margin: 18mm 15mm 18mm 15mm;
  }

  body {
    background: #fff !important;
    color: #1A1D20 !important;
    font-size: 11pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  table { border-collapse: collapse; width: 100%; page-break-inside: auto; }
  tr    { page-break-inside: avoid; page-break-after: auto; }
  thead { display: table-header-group; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 10px; font-size: 10pt; }
  thead th { background: #f0f4f8 !important; font-weight: 700; }

  .rounded-xl, .rounded-2xl, .rounded-lg { border-radius: 8px !important; }
  h2, h3 { page-break-after: avoid; }
}
</style>
