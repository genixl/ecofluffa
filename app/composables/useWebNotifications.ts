export function useWebNotifications() {
  const permission = useState<NotificationPermission | 'unsupported'>(
    'web-notif-permission',
    () => 'default'
  )

  const init = () => {
    if (!import.meta.client || !('Notification' in window)) {
      permission.value = 'unsupported'
      return
    }
    permission.value = Notification.permission
  }

  const requestPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
    if (!import.meta.client || !('Notification' in window)) {
      permission.value = 'unsupported'
      return 'unsupported'
    }
    const result = await Notification.requestPermission()
    permission.value = result
    return result
  }

  const notify = (
    title: string,
    options?: {
      body?: string
      icon?: string
      tag?: string
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
