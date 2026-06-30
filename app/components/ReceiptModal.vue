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
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style="background-color: #d1fae5;"
            >
              <Icon name="mdi:receipt" size="32" style="color: #10b981;" />
            </div>
            <h2 class="text-2xl font-bold" style="color: var(--text-primary);">Order Complete!</h2>
            <p class="text-sm mt-1" style="color: var(--text-muted);">Thank you for using EcoFluffa</p>
          </div>

          <!-- Receipt Content -->
          <div
            class="rounded-xl p-5 mb-6"
            style="background-color: var(--bg-subtle); border: 1px dashed var(--border-color);"
          >
            <div class="flex justify-between items-center mb-4 pb-3" style="border-bottom: 1px solid var(--border-color);">
              <div>
                <div class="text-xs font-semibold" style="color: var(--text-muted);">Order ID</div>
                <div class="font-bold" style="color: var(--text-primary);">{{ orderId }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-semibold" style="color: var(--text-muted);">Date</div>
                <div class="text-sm" style="color: var(--text-primary);">{{ formattedDate }}</div>
              </div>
            </div>

            <div class="mb-4">
              <div class="text-xs font-semibold mb-2" style="color: var(--text-muted);">Provider</div>
              <div class="font-semibold" style="color: var(--text-primary);">{{ providerName }}</div>
            </div>

            <div class="mb-4">
              <div class="text-xs font-semibold mb-2" style="color: var(--text-muted);">Services</div>
              <div
                v-for="(service, idx) in services"
                :key="idx"
                class="flex justify-between items-center py-1"
                style="color: var(--text-primary);"
              >
                <span class="text-sm">{{ service.title }}</span>
                <span class="text-sm font-semibold">{{ service.price }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center pt-3" style="border-top: 1px solid var(--border-color);">
              <span class="font-bold" style="color: var(--text-primary);">Total</span>
              <span class="font-bold text-lg" style="color: var(--brand-blue);">{{ total }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="printReceipt"
              class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style="background-color: var(--bg-subtle); color: var(--text-primary);"
            >
              <Icon name="mdi:printer" size="18" />
              Print
            </button>
            <button
              @click="$emit('update:modelValue', false)"
              class="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style="background-color: var(--brand-blue); color: #fff;"
            >
              Done
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
  providerName: string
  services: Array<{ title: string; price: string }>
  total: string
  date?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const formattedDate = computed(() => {
  if (props.date) {
    return new Date(props.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

const printReceipt = () => {
  window.print()
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.95); }
</style>
