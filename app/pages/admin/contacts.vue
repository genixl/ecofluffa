<template>
  <div>
    <SectionHeader
      title="Support Messages"
      subtitle="View and respond to customer inquiries and complaints"
    />

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <CustomerStatCard label="New Messages" :value="newCount" hint="Awaiting response" />
      <CustomerStatCard label="Responded" :value="respondedCount" hint="Waiting for followup" />
      <CustomerStatCard label="Resolved" :value="resolvedCount" hint="Case closed" />
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 mb-6 border-b" style="border-color: var(--border-color);">
      <button
        @click="activeTab = 'new'"
        class="px-4 py-3 font-semibold text-sm transition-all duration-200 border-b-2"
        :style="{
          color: activeTab === 'new' ? 'var(--brand-blue)' : 'var(--text-muted)',
          borderColor: activeTab === 'new' ? 'var(--brand-blue)' : 'transparent',
        }"
      >
        New ({{ newCount }})
      </button>
      <button
        @click="activeTab = 'responded'"
        class="px-4 py-3 font-semibold text-sm transition-all duration-200 border-b-2"
        :style="{
          color: activeTab === 'responded' ? 'var(--brand-blue)' : 'var(--text-muted)',
          borderColor: activeTab === 'responded' ? 'var(--brand-blue)' : 'transparent',
        }"
      >
        Responded ({{ respondedCount }})
      </button>
      <button
        @click="activeTab = 'resolved'"
        class="px-4 py-3 font-semibold text-sm transition-all duration-200 border-b-2"
        :style="{
          color: activeTab === 'resolved' ? 'var(--brand-blue)' : 'var(--text-muted)',
          borderColor: activeTab === 'resolved' ? 'var(--brand-blue)' : 'transparent',
        }"
      >
        Resolved ({{ resolvedCount }})
      </button>
    </div>

    <!-- Content -->
    <div v-if="activeTab === 'new'" class="mb-8">
      <ContactSubmissionList
        :submissions="newSubmissions"
        @respond-click="openResponseModal"
        @resolve-click="resolveSubmission"
      />
    </div>

    <div v-if="activeTab === 'responded'" class="mb-8">
      <ContactSubmissionList
        :submissions="respondedSubmissions"
        @respond-click="openResponseModal"
        @resolve-click="resolveSubmission"
      />
    </div>

    <div v-if="activeTab === 'resolved'" class="mb-8">
      <ContactSubmissionList :submissions="resolvedSubmissions" />
    </div>

    <!-- Response Modal -->
    <div v-if="showResponseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        class="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
        style="background-color: var(--bg-surface);"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold" style="color: var(--text-primary);">Respond to {{ currentSubmission?.name }}</h2>
          <button @click="showResponseModal = false" class="text-2xl">✕</button>
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
            class="flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
            style="background-color: var(--brand-blue); color: white;"
          >
            Send Response
          </button>
          <button
            @click="showResponseModal = false"
            class="flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
            style="background-color: var(--bg-subtle); color: var(--text-primary);"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useContactSubmissions } from '~/composables/useContactSubmissions';

const {
  submissions,
  respondToSubmission,
  resolveSubmission: markResolved,
  getNewSubmissions,
  getRespondedSubmissions,
  getResolvedSubmissions,
  getSubmissionById,
} = useContactSubmissions();

const activeTab = ref<'new' | 'responded' | 'resolved'>('new');
const showResponseModal = ref(false);
const currentSubmissionId = ref<string | null>(null);
const responseText = ref('');

const newSubmissions = computed(() => getNewSubmissions.value);
const respondedSubmissions = computed(() => getRespondedSubmissions.value);
const resolvedSubmissions = computed(() => getResolvedSubmissions.value);

const newCount = computed(() => newSubmissions.value.length);
const respondedCount = computed(() => respondedSubmissions.value.length);
const resolvedCount = computed(() => resolvedSubmissions.value.length);

const currentSubmission = computed(() =>
  currentSubmissionId.value ? getSubmissionById(currentSubmissionId.value) : null
);

const openResponseModal = (id: string) => {
  currentSubmissionId.value = id;
  responseText.value = '';
  showResponseModal.value = true;
};

const submitResponse = () => {
  if (!currentSubmissionId.value || !responseText.value.trim()) return;
  respondToSubmission(currentSubmissionId.value, responseText.value);
  showResponseModal.value = false;
  responseText.value = '';
};

const resolveSubmission = (id: string) => {
  markResolved(id);
};

definePageMeta({ layout: 'dashboard' });
</script>
