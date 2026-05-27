<template>
  <div class="flex flex-col gap-1">
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-semibold"
      style="color: var(--text-primary);"
    >{{ label }}</label>
    <div class="relative">
      <span v-if="prefixIcon" class="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none" style="color: var(--text-muted);">{{ prefixIcon }}</span>
      <input
        :id="inputId"
        :type="computedType"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="w-full rounded-xl text-sm transition-all duration-200 outline-none disabled:opacity-50"
        :class="prefixIcon ? 'pl-9' : 'pl-4'"
        :style="`
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          padding-right: ${showToggle ? '2.75rem' : '1rem'};
          background-color: var(--bg-subtle);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
        `"
        @focus="focused = true"
        @blur="focused = false"
      />
      <!-- Password toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        @click="showToggle = !showToggle"
        class="absolute right-3 top-1/2 -translate-y-1/2"
        style="color: var(--text-muted); background: none; border: none; cursor: pointer;"
        :aria-label="showToggle ? 'Hide password' : 'Show password'"
      ><Icon :name="showToggle ? 'mdi:eye-off' : 'mdi:eye'" size="18" /></button>
    </div>
    <p v-if="hint" class="text-xs" style="color: var(--text-faint);">{{ hint }}</p>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label?: string
  type?: string
  placeholder?: string
  modelValue?: string
  disabled?: boolean
  required?: boolean
  hint?: string
  error?: string
  prefixIcon?: string
}>()

defineEmits(['update:modelValue'])

const inputId = `input-${Math.random().toString(36).slice(2, 8)}`
const focused = ref(false)
const showToggle = ref(false)

const computedType = computed(() => {
  if (props.type === 'password') return showToggle.value ? 'text' : 'password'
  return props.type ?? 'text'
})
</script>

<style scoped>
input:focus {
  border-color: var(--brand-blue) !important;
  background-color: var(--bg-surface) !important;
  box-shadow: 0 0 0 3px rgba(15, 76, 129, 0.12);
}
[data-theme="dark"] input:focus {
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
}
</style>
