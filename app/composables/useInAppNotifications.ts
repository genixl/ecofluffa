/**
 * useInAppNotifications
 * Tracks in-app notifications (order updates, messages) for the bell-badge.
 * Separate from useWebNotifications (OS-level browser popups).
 */

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

  /** Unread count — drives the bell badge */
  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length
  )

  /** Add a new notification (called from usePlatform realtime handlers) */
  const addNotification = (item: Omit<InAppNotification, 'id' | 'read'>) => {
    notifications.value.unshift({
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
    })
    // Keep at most 50 notifications to avoid memory bloat
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  /** Mark every notification as read */
  const markAllRead = () => {
    notifications.value = notifications.value.map((n) => ({ ...n, read: true }))
  }

  /** Mark one notification as read */
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
