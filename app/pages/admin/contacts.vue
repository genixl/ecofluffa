<template>
  <div>
    <SectionHeader title="Support Messages" subtitle="View and respond to customer inquiries and complaints" />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <CustomerStatCard label="New Messages" :value="getNewSubmissions.length" hint="Awaiting response" />
      <CustomerStatCard label="Responded" :value="getRespondedSubmissions.length" hint="Waiting for followup" />
      <CustomerStatCard label="Resolved" :value="getResolvedSubmissions.length" hint="Case closed" />
    </div>

    <div class="flex gap-4 mb-6 border-b" style="border-color: var(--border-color);">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-3 font-semibold text-sm transition-all duration-200 border-b-2"
        :style="{
          color: activeTab === tab.key ? 'var(--brand-blue)' : 'var(--text-muted)',
          borderColor: activeTab === tab.key ? 'var(--brand-blue)' : 'transparent',
        }"
      >
        {{ tab.label }} ({{ tab.count }})
      </button>
    </div>

    <div v-if="loading" class="text-muted text-sm py-10 text-center">Loading messages…</div>

    <template v-else>
      <div v-if="activeTab === 'new'">
        <ContactSubmissionList :submissions="getNewSubmissions" @respond-click="openModal" @resolve-click="resolve" />
      </div>
      <div v-if="activeTab === 'responded'">
        <ContactSubmissionList :submissions="getRespondedSubmissions" @respond-click="openModal" @resolve-click="resolve" />
      </div>
      <div v-if="activeTab === 'resolved'">
        <ContactSubmissionList :submissions="getResolvedSubmissions" />
      </div>
    </template>

    <!-- Response Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" style="background-color: var(--bg-surface);">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold" style="color: var(--text-primary);">Respond to {{ currentSubmission?.name }}</h2>
          <button @click="showModal = false" class="text-2xl">✕</button>
        </div>
        <div class="mb-6 p-4 rounded-lg" style="background-color: var(--bg-subtle);">
          <div class="font-semibold text-sm mb-2" style="color: var(--brand-blue);">{{ currentSubmission?.subject }}</div>
          <div class="text-sm" style="color: var(--text-primary);">{{ currentSubmission?.message }}</div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">Your Response</label>
          <textarea
            v-model="responseText"
            rows="6"
            placeholder="Type your response here..."
            class="w-full px-4 py-3 rounded-xl text-sm border transition-all duration-200 outline-none resize-none"
            style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);"
          />
        </div>
        <div class="flex gap-3">
          <button 
            @click="submitResponse" 
            :disabled="submittingResponse"
            class="flex-1 px-6 py-3 rounded-lg font-semibold text-sm disabled:opacity-50" 
            style="background-color: var(--brand-blue); color: white;"
          >
            {{ submittingResponse ? 'Sending…' : 'Send Response' }}
          </button>
          <button @click="showModal = false" class="flex-1 px-6 py-3 rounded-lg font-semibold text-sm" style="background-color: var(--bg-subtle); color: var(--text-primary);">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  fetchSubmissions,
  respondToSubmission,
  resolveSubmission,
  getSubmissionById,
  getNewSubmissions,
  getRespondedSubmissions,
  getResolvedSubmissions,
  loading,
} = useContactSubmissions()
const { success, error: toastError } = useToast()

const activeTab = ref<'new' | 'responded' | 'resolved'>('new')
const showModal = ref(false)
const submittingResponse = ref(false)
const currentId = ref<string | null>(null)
const responseText = ref('')

const tabs = computed(() => [
  { key: 'new' as const, label: 'New', count: getNewSubmissions.value.length },
  { key: 'responded' as const, label: 'Responded', count: getRespondedSubmissions.value.length },
  { key: 'resolved' as const, label: 'Resolved', count: getResolvedSubmissions.value.length },
])

onMounted(() => fetchSubmissions())

const currentSubmission = computed(() => currentId.value ? getSubmissionById(currentId.value) : null)

const openModal = (id: string) => {
  currentId.value = id
  responseText.value = ''
  showModal.value = true
}

const submitResponse = async () => {
  if (!currentId.value || !responseText.value.trim()) return
  submittingResponse.value = true
  try {
    await respondToSubmission(currentId.value, responseText.value)
    showModal.value = false
    success('Response sent successfully.')
  } catch {
    toastError('Failed to send response.')
  } finally {
    submittingResponse.value = false
  }
}

const resolve = async (id: string) => {
  try {
    await resolveSubmission(id)
    success('Message marked as resolved.')
  } catch {
    toastError('Failed to resolve message.')
  }
}

definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'] })
</script>
