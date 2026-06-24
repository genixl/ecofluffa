// Global toast notification state
interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export function useToast() {
  const toasts = useState<Toast[]>('app-toasts', () => [])
  const _nextId = useState<number>('toast-next-id', () => 0)

  const show = (message: string, type: Toast['type'] = 'success', durationMs = 4000) => {
    const id = ++_nextId.value
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, durationMs)
  }

  const success = (msg: string) => show(msg, 'success')
  const error = (msg: string) => show(msg, 'error')
  const info = (msg: string) => show(msg, 'info')
  const warn = (msg: string) => show(msg, 'warning')
  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, show, success, error, info, warn, dismiss }
}
