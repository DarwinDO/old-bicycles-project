import { useCallback, useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { notificationsApi } from '@/api/notifications.api'
import { Button } from '@/components/ui/button'
import { formatNotificationRelativeTime } from '@/lib/notification-time'
import { emitNotificationsUpdated } from '@/lib/notification-unread'
import type { PageResult } from '@/types/api'
import type { NotificationItem } from '@/types/notification'

export default function NotificationsPage() {
  const [page, setPage] = useState<PageResult<NotificationItem> | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await notificationsApi.getMine(currentPage, 15)
      setPage(result)
    } catch {
      setError('Không thể tải thông báo.')
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  const handleMarkRead = async (notification: NotificationItem) => {
    if (notification.isRead) {
      return
    }

    try {
      await notificationsApi.markAsRead(notification.id)
      setPage((prevPage) =>
        prevPage
          ? {
              ...prevPage,
              content: prevPage.content.map((item) =>
                item.id === notification.id ? { ...item, isRead: true } : item,
              ),
            }
          : prevPage,
      )
      emitNotificationsUpdated()
    } catch {
      // Ignore optimistic failure for now.
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)

    try {
      await notificationsApi.markAllAsRead()
      setPage((prevPage) =>
        prevPage
          ? {
              ...prevPage,
              content: prevPage.content.map((item) => ({ ...item, isRead: true })),
            }
          : prevPage,
      )
      emitNotificationsUpdated()
    } catch {
      // Ignore optimistic failure for now.
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = page?.content.filter((notification) => !notification.isRead).length ?? 0

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thông báo</h1>
            {!loading && unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} chưa đọc</p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markingAll}>
            <CheckCheck className="mr-1 h-4 w-4" />
            {markingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {!page || page.content.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Bell className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Chưa có thông báo nào.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {page.content.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => void handleMarkRead(notification)}
                  className={`flex cursor-pointer items-start gap-3 border-b p-4 transition-colors last:border-b-0 hover:bg-muted/40 ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    {notification.isRead ? (
                      <Check className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.content}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatNotificationRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {page && page.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((prevPage) => prevPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {currentPage + 1} / {page.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= page.totalPages - 1}
                onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
