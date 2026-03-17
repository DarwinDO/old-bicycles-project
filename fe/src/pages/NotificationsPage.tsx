import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationsApi } from '@/api/notifications.api';
import type { NotificationItem } from '@/types/notification';
import type { PageResult } from '@/types/api';

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function NotificationsPage() {
    const [page, setPage] = useState<PageResult<NotificationItem> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await notificationsApi.getMine(currentPage, 15);
            setPage(result);
        } catch {
            setError('Không thể tải thông báo.');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkRead = async (notification: NotificationItem) => {
        if (notification.isRead) return;
        try {
            await notificationsApi.markAsRead(notification.id);
            setPage((prev) =>
                prev
                    ? {
                          ...prev,
                          content: prev.content.map((n) =>
                              n.id === notification.id ? { ...n, isRead: true } : n
                          ),
                      }
                    : prev
            );
        } catch {
            // ignore
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            await notificationsApi.markAllAsRead();
            setPage((prev) =>
                prev
                    ? { ...prev, content: prev.content.map((n) => ({ ...n, isRead: true })) }
                    : prev
            );
        } catch {
            // ignore
        } finally {
            setMarkingAll(false);
        }
    };

    const unreadCount = page?.content.filter((n) => !n.isRead).length ?? 0;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
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
                        <CheckCheck className="h-4 w-4 mr-1" />
                        {markingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
                    </Button>
                )}
            </div>

            {/* Error */}
            {error && <div className="text-destructive bg-destructive/10 rounded-lg p-4 text-sm">{error}</div>}

            {/* Loading skeleton */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <>
                    {!page || page.content.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>Chưa có thông báo nào.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
                            {page.content.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleMarkRead(notification)}
                                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/40 ${
                                        !notification.isRead ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    {/* Unread dot */}
                                    <div className="mt-1 flex-shrink-0">
                                        {notification.isRead ? (
                                            <Check className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <div className="h-2.5 w-2.5 rounded-full bg-primary mt-0.5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.content}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {relativeTime(notification.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {page && page.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage((p) => p - 1)}
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
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
