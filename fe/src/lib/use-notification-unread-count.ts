import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { notificationsApi } from '@/api/notifications.api'
import { useAuth } from '@/contexts/AuthContext'
import { NOTIFICATIONS_UPDATED_EVENT } from '@/lib/notification-unread'

const UNREAD_COUNT_POLL_INTERVAL_MS = 30_000

export function useNotificationUnreadCount() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setUnreadCount(0)
      return
    }

    let cancelled = false
    setUnreadCount(0)

    async function refreshUnreadCount() {
      try {
        const count = await notificationsApi.getUnreadCount()

        if (!cancelled) {
          setUnreadCount(Math.max(0, count))
        }
      } catch {
        if (!cancelled) {
          setUnreadCount((currentCount) => currentCount)
        }
      }
    }

    function handleFocus() {
      void refreshUnreadCount()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void refreshUnreadCount()
      }
    }

    void refreshUnreadCount()

    const intervalId = window.setInterval(() => {
      void refreshUnreadCount()
    }, UNREAD_COUNT_POLL_INTERVAL_MS)

    window.addEventListener('focus', handleFocus)
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, location.pathname, user?.id])

  return unreadCount
}
