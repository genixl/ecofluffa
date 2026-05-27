<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    :style="buttonStyle"
    :class="sizeClass"
    @click="$emit('click')"
  >
    <span v-if="loading" class="loader"></span>
    <span v-if="!loading && icon" class="text-base">{{ icon }}</span>
    <span>{{ loading ? loadingLabel || label : label }}</span>
  </button>
</template>

<script setup lang="ts">
defineEmits(['click'])
const props = defineProps<{
  label: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const buttonStyle = computed(() => {
  const v = props.variant ?? 'primary'
  if (v === 'primary')   return 'background-color: var(--brand-blue); color: #fff; box-shadow: 0 2px 8px rgba(15,76,129,0.25);'
  if (v === 'secondary') return 'background-color: var(--brand-orange); color: #fff; box-shadow: 0 2px 8px rgba(255,107,53,0.25);'
  if (v === 'outline')   return 'background-color: transparent; color: var(--brand-blue); border: 2px solid var(--brand-blue);'
  if (v === 'ghost')     return 'background-color: var(--bg-subtle); color: var(--text-primary);'
  if (v === 'danger')    return 'background-color: #ef4444; color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,0.25);'
  return ''
})

const sizeClass = computed(() => {
  const s = props.size ?? 'md'
  if (s === 'sm') return 'px-3 py-1.5 text-xs'
  if (s === 'lg') return 'px-8 py-4 text-base'
  return 'px-5 py-2.5'
})
</script>

<style scoped>
.loader {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
