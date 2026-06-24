/**
 * useWebNotifications
 * Manages the Web Notification API (OS-level browser popups).
 * Works when the browser is open — even if the tab is in the background.
 */
export function useWebNotifications() {
  const permission = useState<NotificationPermission | 'unsupported'>(
    'web-notif-permission',
    () => 'default'
  )

  /** Call once on app mount to sync the current permission state */
  const init = () => {
    if (!import.meta.client || !('Notification' in window)) {
      permission.value = 'unsupported'
      return
    }
    permission.value = Notification.permission
  }

  /** Ask the user for permission. Call this on a user gesture (button click). */
  const requestPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
    if (!import.meta.client || !('Notification' in window)) {
      permission.value = 'unsupported'
      return 'unsupported'
    }
    const result = await Notification.requestPermission()
    permission.value = result
    return result
  }

  /**
   * Send a native OS notification.
   * Silently does nothing if permission is not granted.
   */
  const notify = (
    title: string,
    options?: {
      body?: string
      icon?: string
      tag?: string // same tag = replaces previous notification of that group
      silent?: boolean
    }
  ) => {
    if (!import.meta.client || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const notif = new Notification(title, {
      body: options?.body,
      icon: options?.icon ?? '/icon.png',
      tag: options?.tag,
      silent: options?.silent ?? false,
    })

    // Auto-focus the tab when the notification is clicked
    notif.onclick = () => {
      window.focus()
      notif.close()
    }
  }

  const isGranted = computed(() => permission.value === 'granted')
  const isDenied = computed(() => permission.value === 'denied')
  const isDefault = computed(() => permission.value === 'default')
  const isSupported = computed(() => permission.value !== 'unsupported')

  return {
    permission,
    init,
    requestPermission,
    notify,
    isGranted,
    isDenied,
    isDefault,
    isSupported,
  }
}
