<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-100 bg-gray-50">
      <div class="text-brand-blue font-bold">Messages</div>
      <div class="text-gray-500 text-xs mt-0.5">
        {{ readonly ? `Conversation between ${otherPartyLabel}` : `Chat with ${otherPartyLabel}` }}
      </div>
    </div>

    <div ref="scrollEl" class="max-h-64 overflow-y-auto p-4 space-y-3">
      <div
        v-if="thread.length === 0"
        class="text-center text-gray-500 text-sm py-6"
      >
        No messages yet. Start the conversation below.
      </div>
      <div
        v-for="msg in thread"
        :key="msg.id"
        class="flex"
        :class="msg.from_role === currentRole ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-xl px-4 py-2.5 text-sm"
          :class="
            msg.from_role === currentRole
              ? 'bg-brand-blue text-white'
              : 'bg-gray-100 text-brand-charcoal'
          "
        >
          <div class="text-xs font-semibold opacity-80 mb-0.5">
            {{ msg.sender_name }}
          </div>
          <div>{{ msg.body }}</div>
          <div class="text-xs opacity-60 mt-1">{{ formatTime(msg.created_at) }}</div>
        </div>
      </div>
    </div>

    <form v-if="!readonly" class="p-4 border-t border-gray-100 flex gap-2" @submit.prevent="send">
      <input
        v-model="draft"
        type="text"
        :placeholder="`Message as ${senderName}…`"
        :disabled="sending"
        class="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue disabled:opacity-50"
      />
      <AppButton :label="sending ? 'Sending...' : 'Send'" variant="primary" type="submit" :disabled="sending" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { usePlatform } from "~/composables/usePlatform";
import type { UserRole } from "~/types/supabase";

const props = defineProps<{
  orderId: string;
  currentRole: UserRole;
  senderName: string;
  otherPartyLabel: string;
  readonly?: boolean;
}>();

const { getMessagesForOrder, addMessage } = usePlatform();
const draft = ref("");
const sending = ref(false);
const scrollEl = ref<HTMLElement | null>(null);

const thread = computed(() => getMessagesForOrder(props.orderId));

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const send = async () => {
  if (!draft.value.trim() || sending.value) return;
  const body = draft.value;
  draft.value = "";
  sending.value = true;
  try {
    await addMessage(props.orderId, props.currentRole, props.senderName, body);
  } finally {
    sending.value = false;
  }
};

watch(
  () => thread.value.length,
  () => {
    nextTick(() => {
      if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
    });
  },
);
</script>
