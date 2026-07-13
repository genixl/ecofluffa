/**
 * useCloudinaryUpload
 * 
 * A composable for uploading images to Cloudinary via the unsigned upload API.
 * 
 * Required .env vars:
 *   NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
 */
export function useCloudinaryUpload() {
  const config = useRuntimeConfig()
  const uploading = ref(false)

  /**
   * Upload a File to Cloudinary and return the secure URL.
   * The upload preset must be unsigned (configured in your Cloudinary dashboard).
   */
  const uploadPhoto = async (
    file: File
  ): Promise<{ url: string | null; error: string | null }> => {
    const cloudName = config.public.cloudinaryCloudName as string
    const uploadPreset = config.public.cloudinaryUploadPreset as string

    if (!cloudName || !uploadPreset) {
      return {
        url: null,
        error:
          'Cloudinary is not configured. Add NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env file.',
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'Image must be smaller than 5 MB.' }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return { url: null, error: 'Please upload a JPEG, PNG, WebP, or GIF image.' }
    }

    uploading.value = true

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', 'ecofluffa/providers')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        return { url: null, error: body?.error?.message ?? 'Upload failed.' }
      }

      const data = await res.json()
      return { url: data.secure_url as string, error: null }
    } catch (err: unknown) {
      return { url: null, error: err instanceof Error ? err.message : 'Network error during upload.' }
    } finally {
      uploading.value = false
    }
  }

  return { uploading, uploadPhoto }
}
