import { useEffect, useState, useCallback } from 'react';
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { reportsApi } from '@/api/reports.api';
import type { Report } from '@/types/report';
import type { PageResult } from '@/types/api';

const targetTypeLabels: Record<string, string> = {
    product: 'Tin đăng',
    user: 'Người dùng',
    PRODUCT: 'Tin đăng',
    USER: 'Người dùng',
};

export default function MyReportsPage() {
    const [page, setPage] = useState<PageResult<Report> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await reportsApi.getMine(currentPage, 10);
            setPage(result);
        } catch {
            setError('Không thể tải danh sách báo cáo.');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Flag className="h-6 w-6 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Báo cáo của tôi</h1>
                    {!loading && page && (
                        <p className="text-sm text-muted-foreground">{page.totalElements} báo cáo</p>
                    )}
                </div>
            </div>

            {error && <div className="text-destructive bg-destructive/10 rounded-lg p-4 text-sm">{error}</div>}

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <>
                    {!page || page.content.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Flag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>Bạn chưa có báo cáo nào.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
                            {page.content.map((report) => (
                                <div key={report.id} className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">
                                                {targetTypeLabels[report.targetType] || report.targetType}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-mono">{report.targetId}</span>
                                        </div>
                                        <StatusBadge status={report.status} />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{report.reason}</p>
                                    {report.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
                                    )}
                                    {report.adminNote && (
                                        <div className="bg-muted/50 rounded p-2 text-xs">
                                            <span className="font-medium text-muted-foreground">Ghi chú admin: </span>
                                            {report.adminNote}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                                        {report.processedAt && ` · Xử lý: ${new Date(report.processedAt).toLocaleDateString('vi-VN')}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {page && page.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">Trang {currentPage + 1} / {page.totalPages}</span>
                            <Button variant="outline" size="sm" disabled={currentPage >= page.totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
