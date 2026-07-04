<template>
  <div>
    <label class="block text-sm font-semibold mb-3" style="color: var(--text-primary);">
      Profile Photo <span class="font-normal" style="color: var(--text-muted);">(optional)</span>
    </label>

    <div class="flex items-center gap-5">
      <!-- Clickable avatar preview -->
      <button
        type="button"
        class="relative group focus:outline-none"
        :title="currentPhotoUrl ? 'Change photo' : 'Upload photo'"
        @click="triggerFileInput"
        :disabled="uploading"
      >
        <ProviderAvatar
          :photoUrl="currentPhotoUrl"
          :name="providerName"
          :size="80"
          rounded="1.25rem"
        />
        <!-- Hover overlay -->
        <div
          class="absolute inset-0 flex flex-col items-center justify-center rounded-[1.25rem] transition-all duration-200 opacity-0 group-hover:opacity-100"
          style="background-color: rgba(10, 61, 115, 0.65);"
        >
          <Icon name="mdi:camera" size="22" style="color: #fff;" />
          <span class="text-white text-[10px] font-semibold mt-0.5 leading-none">
            {{ currentPhotoUrl ? 'Change' : 'Upload' }}
          </span>
        </div>
        <!-- Uploading spinner overlay -->
        <div
          v-if="uploading"
          class="absolute inset-0 flex items-center justify-center rounded-[1.25rem]"
          style="background-color: rgba(10, 61, 115, 0.6);"
        >
          <Icon name="mdi:loading" size="28" class="animate-spin" style="color: #fff;" />
        </div>
      </button>

      <!-- Right-side copy + remove button -->
      <div class="flex flex-col gap-2">
        <p class="text-xs" style="color: var(--text-muted);">
          Accepted: JPEG, PNG, WebP, GIF · Max 5 MB
        </p>
        <button
          v-if="currentPhotoUrl"
          type="button"
          class="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
          style="color: #ef4444;"
          :disabled="uploading"
          @click="removePhoto"
        >
          <Icon name="mdi:trash-can-outline" size="14" />
          Remove photo
        </button>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="uploadError" class="mt-2 text-xs" style="color: #ef4444;">
      {{ uploadError }}
    </p>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="hidden"
      @change="onFileSelected"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** Current saved photo URL from the provider record */
  modelValue?: string | null
  /** Provider name — used as the avatar fallback initial */
  providerName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', url: string | null): void
}>()

const { uploading, uploadPhoto } = useCloudinaryUpload()
const { updateProvider } = useProviderProfile()

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadError = ref('')
const currentPhotoUrl = ref<string | null>(props.modelValue ?? null)

// Keep in sync if parent changes the value (e.g. on initial load)
watch(() => props.modelValue, (v) => { currentPhotoUrl.value = v ?? null })

const triggerFileInput = () => {
  uploadError.value = ''
  fileInputRef.value?.click()
}

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Reset input so the same file can be re-selected after removal
  input.value = ''

  uploadError.value = ''
  const { url, error } = await uploadPhoto(file)

  if (error) {
    uploadError.value = error
    return
  }

  if (url) {
    // Save to Supabase
    const { error: saveError } = await updateProvider({ photo_url: url })
    if (saveError) {
      uploadError.value = saveError
      return
    }
    currentPhotoUrl.value = url
    emit('update:modelValue', url)
  }
}

const removePhoto = async () => {
  uploadError.value = ''
  const { error } = await updateProvider({ photo_url: null })
  if (error) {
    uploadError.value = error
    return
  }
  currentPhotoUrl.value = null
  emit('update:modelValue', null)
}
</script>
