<template>
  <!-- Circular provider avatar: shows photo if available, otherwise a styled initial/icon fallback -->
  <div
    class="provider-avatar shrink-0 rounded-2xl overflow-hidden flex items-center justify-center"
    :style="containerStyle"
  >
    <img
      v-if="photoUrl"
      :src="photoUrl"
      :alt="`${name} photo`"
      class="w-full h-full object-cover"
      @error="imgError = true"
    />
    <template v-else>
      <span v-if="initial" class="font-bold select-none" :style="initialStyle">
        {{ initial }}
      </span>
      <Icon v-else name="mdi:store" :size="iconSize" style="color: var(--brand-blue);" />
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    photoUrl?: string | null
    name: string
    /** px — diameter of the avatar */
    size?: number
    /** Override border-radius (default 'rounded-2xl' = 1rem) */
    rounded?: string
  }>(),
  { size: 56, rounded: '1rem' }
)

const imgError = ref(false)

const containerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  minWidth: `${props.size}px`,
  borderRadius: props.rounded,
  backgroundColor: 'var(--brand-blue-light)',
}))

const initial = computed(() => {
  if (props.photoUrl && !imgError.value) return ''
  return props.name?.trim()?.[0]?.toUpperCase() ?? ''
})

const initialStyle = computed(() => ({
  fontSize: `${Math.round(props.size * 0.38)}px`,
  color: 'var(--brand-blue)',
}))

const iconSize = computed(() => Math.round(props.size * 0.55))

// Reset error flag whenever photoUrl changes
watch(() => props.photoUrl, () => { imgError.value = false })
</script>
