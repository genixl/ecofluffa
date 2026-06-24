<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 flex items-center justify-center z-50 p-4"
        style="background: rgba(0,0,0,0.55);"
        @click.self="$emit('update:modelValue', false)"
      >
        <div
          class="rounded-2xl p-8 max-w-md w-full shadow-2xl"
          style="background-color: var(--bg-surface);"
        >
          <!-- Header -->
          <div class="flex items-center gap-4 mb-6">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style="background-color: #fef3c7;"
            >
              <Icon name="mdi:star" size="26" style="color: #f59e0b;" />
            </div>
            <div>
              <h2 class="text-xl font-bold" style="color: var(--text-primary);">Rate Your Service</h2>
              <p class="text-sm mt-0.5" style="color: var(--text-muted);">{{ providerName }}</p>
            </div>
          </div>

          <!-- Stars -->
          <div class="mb-6">
            <div class="text-sm font-semibold mb-3" style="color: var(--text-primary);">
              How was the service?
            </div>
            <div class="flex gap-2 mb-2">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="selected = star"
                @mouseenter="hovered = star"
                @mouseleave="hovered = 0"
                class="transition-transform hover:scale-110 focus:outline-none"
              >
                <Icon
                  name="mdi:star"
                  size="36"
                  :style="(hovered || selected) >= star
                    ? 'color: #f59e0b;'
                    : 'color: var(--border-color);'"
                />
              </button>
            </div>
            <div class="text-xs h-4" style="color: var(--text-muted);">
              {{ ratingLabel }}
            </div>
          </div>

          <!-- Comment -->
          <div class="mb-6">
            <label class="text-sm font-semibold mb-2 block" style="color: var(--text-primary);">
              Comment <span style="color: var(--text-muted);">(optional)</span>
            </label>
            <textarea
              v-model="comment"
              rows="3"
              placeholder="Tell us about your experience…"
              class="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
              style="
                background-color: var(--bg-subtle);
                border: 1px solid var(--border-color);
                color: var(--text-primary);
                focus-ring-color: var(--brand-blue);
              "
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              :disabled="!selected || submitting"
              @click="submit"
              class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;"
            >
              {{ submitting ? 'Submitting…' : 'Submit Rating' }}
            </button>
            <button
              @click="$emit('update:modelValue', false)"
              class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
              style="background-color: var(--bg-subtle); color: var(--text-primary);"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  orderId: string
  providerId: string
  providerName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submitted': []
}>()

const { submitRating } = usePlatform()
const { success, error } = useToast()

const selected = ref(0)
const hovered = ref(0)
const comment = ref('')
const submitting = ref(false)

const ratingLabel = computed(() => {
  const n = hovered.value || selected.value
  return ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][n] ?? ''
})

const submit = async () => {
  if (!selected.value || submitting.value) return
  submitting.value = true
  try {
    const ok = await submitRating(props.orderId, props.providerId, selected.value, comment.value)
    if (ok) {
      success('Thank you for your rating!')
      emit('submitted')
      emit('update:modelValue', false)
    } else {
      error('Failed to submit rating. Please try again.')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.95); }
</style>
