<template>
  <div class="space-y-4">
    <div
      v-for="submission in submissions"
      :key="submission.id"
      class="rounded-xl border transition-all duration-200"
      :style="{
        backgroundColor: 'var(--bg-surface)',
        borderColor: submission.status === 'new' ? 'var(--brand-blue)' : 'var(--border-color)',
      }"
    >
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <div class="font-bold" style="color: var(--text-primary);">{{ submission.name }}</div>
              <div
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :style="{
                  backgroundColor:
                    submission.status === 'new'
                      ? 'var(--brand-blue-light)'
                      : submission.status === 'responded'
                      ? 'var(--brand-green-light)'
                      : 'var(--bg-subtle)',
                  color:
                    submission.status === 'new'
                      ? 'var(--brand-blue)'
                      : submission.status === 'responded'
                      ? 'var(--brand-green)'
                      : 'var(--text-muted)',
                }"
              >
                {{ submission.status === 'new' ? 'New' : submission.status === 'responded' ? 'Responded' : 'Resolved' }}
              </div>
            </div>
            <div class="text-sm" style="color: var(--text-muted);">{{ submission.email }}</div>
          </div>
          <div class="text-xs" style="color: var(--text-muted);">{{ formatDate(submission.created_at) }}</div>
        </div>

        <!-- Subject and Message -->
        <div class="mb-4">
          <div class="font-semibold text-sm mb-2" style="color: var(--brand-blue);">{{ submission.subject }}</div>
          <div class="text-sm leading-relaxed" style="color: var(--text-primary);">{{ submission.message }}</div>
        </div>

        <!-- Admin Response (if exists) -->
        <div v-if="submission.admin_response" class="mb-4 p-4 rounded-lg" style="background-color: var(--bg-subtle);">
          <div class="text-xs font-semibold mb-2" style="color: var(--text-muted);">Admin Response</div>
          <div class="text-sm leading-relaxed" style="color: var(--text-primary);">{{ submission.admin_response }}</div>
          <div class="text-xs mt-2" style="color: var(--text-muted);">{{ formatDate(submission.responded_at ?? undefined) }}</div>
        </div>

        <!-- Actions -->
        <div v-if="submission.status !== 'resolved'" class="flex gap-2 pt-4 border-t" style="border-color: var(--border-color);">
          <button
            v-if="submission.status === 'new'"
            @click="$emit('respond-click', submission.id)"
            class="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
            style="background-color: var(--brand-blue); color: white;"
          >
            <Icon name="mdi:reply" size="16" class="inline mr-2" />
            Respond
          </button>
          <button
            @click="$emit('resolve-click', submission.id)"
            class="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
            style="background-color: var(--bg-subtle); color: var(--text-primary);"
          >
            <Icon name="mdi:check" size="16" class="inline mr-2" />
            Mark Resolved
          </button>
        </div>
      </div>
    </div>

    <div v-if="submissions.length === 0" class="text-center py-12">
      <Icon name="mdi:inbox-multiple-outline" size="48" style="color: var(--text-muted);" class="mx-auto mb-3" />
      <div class="text-sm" style="color: var(--text-muted);">No submissions to display</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContactSubmission } from '~/types/supabase';

defineProps<{
  submissions: ContactSubmission[];
}>();

defineEmits<{
  'respond-click': [id: string];
  'resolve-click': [id: string];
}>();

const formatDate = (isoString: string | undefined) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
</script>
