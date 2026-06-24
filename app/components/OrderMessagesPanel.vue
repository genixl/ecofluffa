<template>
  <div class="messages-panel bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <div>
        <div class="text-brand-blue font-bold">Messages</div>
        <div class="text-gray-500 text-xs mt-0.5">
          {{ readonly ? `Conversation between ${otherPartyLabel}` : `Chat with ${otherPartyLabel}` }}
        </div>
      </div>
      <div v-if="thread.length > 0" class="text-xs text-gray-400">
        {{ thread.length }} message{{ thread.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Message Thread -->
    <div ref="scrollEl" class="flex-1 max-h-80 overflow-y-auto p-4 space-y-1 scroll-smooth">
      <!-- Empty state -->
      <div
        v-if="thread.length === 0"
        class="flex flex-col items-center justify-center py-10 text-center gap-2"
      >
        <div class="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
          <Icon name="mdi:chat-outline" size="24" class="text-gray-400" />
        </div>
        <div class="text-gray-400 text-sm font-medium">No messages yet</div>
        <div v-if="!readonly" class="text-gray-400 text-xs">
          Start the conversation below
        </div>
      </div>

      <!-- Message groups with date dividers -->
      <template v-for="(group, gi) in groupedThread" :key="gi">
        <!-- Date divider -->
        <div class="flex items-center gap-3 py-2">
          <div class="flex-1 h-px bg-gray-100" />
          <span class="text-xs text-gray-400 font-medium px-2">{{ group.dateLabel }}</span>
          <div class="flex-1 h-px bg-gray-100" />
        </div>

        <!-- Messages in this date group -->
        <div
          v-for="(msg, mi) in group.messages"
          :key="msg.id"
          class="flex mb-1"
          :class="isSelf(msg) ? 'justify-end' : 'justify-start'"
        >
          <!-- Other party avatar -->
          <div
            v-if="!isSelf(msg)"
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto mb-0.5 mr-1.5"
            style="background-color: var(--brand-blue-light); color: var(--brand-blue);"
          >
            {{ msg.sender_name?.charAt(0)?.toUpperCase() ?? '?' }}
          </div>

          <div class="flex flex-col max-w-[80%]" :class="isSelf(msg) ? 'items-end' : 'items-start'">
            <!-- Sender name — only show at top of each group of consecutive messages from same person -->
            <div
              v-if="shouldShowSenderName(group.messages, mi)"
              class="text-xs font-semibold mb-1 px-1"
              :class="isSelf(msg) ? 'text-right text-gray-400' : 'text-left'"
              :style="!isSelf(msg) ? 'color: var(--brand-blue);' : ''"
            >
              {{ isSelf(msg) ? 'You' : msg.sender_name }}
            </div>

            <!-- Bubble -->
            <div
              class="relative px-4 py-2.5 text-sm shadow-sm"
              :class="[
                isSelf(msg) ? 'text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm' : 'text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-sm',
                msg.id.startsWith('temp-') ? 'opacity-70' : ''
              ]"
              :style="isSelf(msg)
                ? 'background: linear-gradient(135deg, #0f4c81, #1d6fb8);'
                : 'background-color: #f3f4f6; border: 1px solid #e5e7eb;'"
            >
              {{ msg.body }}
              <!-- Sending indicator -->
              <span v-if="msg.id.startsWith('temp-')" class="ml-1.5 text-xs opacity-60">•••</span>
            </div>

            <!-- Timestamp -->
            <div
              class="text-xs mt-0.5 px-1 select-none"
              :class="isSelf(msg) ? 'text-right text-gray-400' : 'text-left text-gray-400'"
            >
              {{ formatTime(msg.created_at) }}
            </div>
          </div>

          <!-- Self avatar spacer -->
          <div v-if="isSelf(msg)" class="w-6 ml-1.5 shrink-0" />
        </div>
      </template>
    </div>

    <!-- Compose -->
    <form
      v-if="!readonly"
      class="p-3 border-t border-gray-100 flex gap-2 items-end"
      style="background-color: #f9fafb;"
      @submit.prevent="send"
    >
      <input
        v-model="draft"
        type="text"
        :placeholder="`Message ${otherPartyLabel}…`"
        :disabled="sending"
        maxlength="1000"
        class="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue disabled:opacity-50 transition-colors"
        style="background-color: #fff; resize: none;"
        @keydown.enter.prevent="send"
      />
      <button
        type="submit"
        :disabled="sending || !draft.trim()"
        class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style="background: linear-gradient(135deg, #0f4c81, #1d6fb8);"
        :title="sending ? 'Sending...' : 'Send message'"
      >
        <Icon v-if="!sending" name="mdi:send" size="18" style="color: #fff;" />
        <Icon v-else name="mdi:loading" size="18" style="color: #fff;" class="animate-spin" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { usePlatform } from "~/composables/usePlatform";
import { useAuth } from "~/composables/useAuth";
import type { UserRole, OrderMessage } from "~/types/supabase";

const props = defineProps<{
  orderId: string;
  currentRole?: UserRole;
  senderName: string;
  otherPartyLabel: string;
  readonly?: boolean;
}>();

const { getMessagesForOrder, addMessage } = usePlatform();
const { profile } = useAuth();
const draft = ref("");
const sending = ref(false);
const scrollEl = ref<HTMLElement | null>(null);

// effectiveRole is a computed — in the template it is auto-unwrapped (no .value needed)
const effectiveRole = computed(() => props.currentRole ?? profile.value?.role ?? "customer");

const thread = computed(() => getMessagesForOrder(props.orderId));

/** Returns true when this message was sent by the current user's role */
const isSelf = (msg: OrderMessage) => msg.from_role === effectiveRole.value;

/** Group messages by calendar date */
const groupedThread = computed(() => {
  const groups: { dateLabel: string; messages: OrderMessage[] }[] = [];
  for (const msg of thread.value) {
    const dateLabel = formatDateLabel(msg.created_at);
    const last = groups[groups.length - 1];
    if (last && last.dateLabel === dateLabel) {
      last.messages.push(msg);
    } else {
      groups.push({ dateLabel, messages: [msg] });
    }
  }
  return groups;
});

/** Show sender name only when the role changes from the previous message */
const shouldShowSenderName = (messages: OrderMessage[], index: number): boolean => {
  if (index === 0) return true;
  return messages[index]!.from_role !== messages[index - 1]!.from_role;
};

const formatDateLabel = (iso: string): string => {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Earlier";
  }
};

const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollEl.value) {
      scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
    }
  });
};

const send = async () => {
  if (!draft.value.trim() || sending.value) return;
  const body = draft.value;
  draft.value = "";
  sending.value = true;
  try {
    await addMessage(props.orderId, effectiveRole.value, props.senderName, body);
  } finally {
    sending.value = false;
  }
};

// Scroll to bottom when new messages arrive
watch(
  () => thread.value.length,
  () => scrollToBottom()
);

// Scroll to bottom on initial mount
onMounted(() => scrollToBottom());
</script>

<style scoped>
.messages-panel {
  min-height: 350px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
