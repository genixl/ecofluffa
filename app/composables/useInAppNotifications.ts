export interface InAppNotification {
  id: string
  type: 'order_update' | 'new_message'
  title: string
  body: string
  orderId?: string
  role: 'customer' | 'provider' | 'admin'
  read: boolean
  createdAt: string
}

export function useInAppNotifications() {
  const notifications = useState<InAppNotification[]>('inapp-notifications', () => [])

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length
  )

  const addNotification = (item: Omit<InAppNotification, 'id' | 'read'>) => {
    notifications.value.unshift({
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
    })
    // cap at 50 to avoid unbounded growth
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  const markAllRead = () => {
    notifications.value = notifications.value.map((n) => ({ ...n, read: true }))
  }

  const markRead = (id: string) => {
    const n = notifications.value.find((x) => x.id === id)
    if (n) n.read = true
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    markRead,
  }
}
