import { useEffect, useState, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, MoreHorizontal, CheckCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { reportsApi } from '@/api/reports.api';
import type { Report, ReportStatus } from '@/types/report';

const targetTypeLabels: Record<string, string> = {
    product: 'Tin đăng',
    user: 'Người dùng',
    PRODUCT: 'Tin đăng',
    USER: 'Người dùng',
};

const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    reviewed: 'Đã xem xét',
    resolved: 'Đã giải quyết',
};

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Detail dialog
    const [detailDialog, setDetailDialog] = useState<{
        open: boolean;
        report: Report | null;
    }>({ open: false, report: null });

    // Process dialog
    const [processDialog, setProcessDialog] = useState<{
        open: boolean;
        reportId: string;
        status: ReportStatus;
        adminNote: string;
        loading: boolean;
    }>({ open: false, reportId: '', status: 'resolved', adminNote: '', loading: false });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await reportsApi.getAdminReports({
                status: statusFilter !== 'all' ? (statusFilter as ReportStatus) : undefined,
                targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
                page,
                size: 10,
            });
            // Client-side search filter
            const filtered = searchQuery
                ? result.content.filter(
                      (r) =>
                          r.reporterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.targetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.reason?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : result.content;
            setReports(filtered);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch {
            setError('Không thể tải danh sách báo cáo.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, targetTypeFilter, page, searchQuery]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleProcess = async () => {
        setProcessDialog((prev) => ({ ...prev, loading: true }));
        try {
            await reportsApi.process(processDialog.reportId, {
                status: processDialog.status,
                adminNote: processDialog.adminNote || undefined,
            });
            setProcessDialog({ open: false, reportId: '', status: 'resolved', adminNote: '', loading: false });
            fetchReports();
        } catch {
            setProcessDialog((prev) => ({ ...prev, loading: false }));
        }
    };

    const columns: ColumnDef<Report>[] = [
        {
            accessorKey: 'reporterName',
            header: 'Người báo cáo',
        },
        {
            accessorKey: 'targetType',
            header: 'Đối tượng',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-xs text-muted-foreground">
                        {targetTypeLabels[row.original.targetType] || row.original.targetType}
                    </p>
                    <p className="text-xs font-mono truncate max-w-[120px]">{row.original.targetId}</p>
                </div>
            ),
        },
        { accessorKey: 'reason', header: 'Lý do' },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: 'createdAt',
            header: 'Ngày báo cáo',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('vi-VN'),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailDialog({ open: true, report: row.original })}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        {row.original.status === 'pending' && (
                            <DropdownMenuItem
                                onClick={() =>
                                    setProcessDialog({
                                        open: true,
                                        reportId: row.original.id,
                                        status: 'resolved',
                                        adminNote: '',
                                        loading: false,
                                    })
                                }
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Xử lý báo cáo
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Báo cáo vi phạm</h2>
                <p className="text-muted-foreground">
                    Xử lý các báo cáo từ người dùng.
                    {!loading && <span className="ml-1 text-xs">({totalElements} báo cáo)</span>}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm báo cáo..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="reviewed">Đã xem xét</SelectItem>
                        <SelectItem value="resolved">Đã giải quyết</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={targetTypeFilter} onValueChange={(v) => { setTargetTypeFilter(v); setPage(0); }}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Loại" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="PRODUCT">Tin đăng</SelectItem>
                        <SelectItem value="USER">Người dùng</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && <div className="text-destructive bg-destructive/10 rounded-lg p-4 text-sm">{error}</div>}

            {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                </div>
            ) : (
                <>
                    <DataTable columns={columns} data={reports} />
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">Trang {page + 1} / {totalPages}</span>
                            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Detail dialog */}
            <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Chi tiết báo cáo</DialogTitle>
                    </DialogHeader>
                    {detailDialog.report && (
                        <>
                            <div className="space-y-3 text-sm">
                                {[
                                    ['Người báo cáo', detailDialog.report.reporterName],
                                    ['Loại đối tượng', targetTypeLabels[detailDialog.report.targetType] || detailDialog.report.targetType],
                                    ['ID đối tượng', detailDialog.report.targetId],
                                    ['Lý do', detailDialog.report.reason],
                                    ['Mô tả', detailDialog.report.description || '—'],
                                    ['Trạng thái', statusLabels[detailDialog.report.status] || detailDialog.report.status],
                                    ['Ngày báo cáo', new Date(detailDialog.report.createdAt).toLocaleString('vi-VN')],
                                    ...(detailDialog.report.adminNote ? [['Ghi chú admin', detailDialog.report.adminNote]] : []),
                                    ...(detailDialog.report.processedByName ? [['Xử lý bởi', detailDialog.report.processedByName]] : []),
                                ].map(([label, val]) => (
                                    <div key={String(label)} className="flex justify-between border-b border-border pb-1">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-medium text-right max-w-[60%]">{val}</span>
                                    </div>
                                ))}
                            </div>
                            {detailDialog.report.status === 'pending' && (
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        onClick={() => {
                                            const reportId = detailDialog.report!.id;
                                            setDetailDialog({ open: false, report: null });
                                            // Small delay to allow detail dialog to close smoothly before opening process dialog
                                            setTimeout(() => {
                                                setProcessDialog({
                                                    open: true,
                                                    reportId: reportId,
                                                    status: 'resolved',
                                                    adminNote: '',
                                                    loading: false,
                                                });
                                            }, 100);
                                        }}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Xử lý báo cáo này
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Process dialog */}
            <Dialog open={processDialog.open} onOpenChange={(open) => setProcessDialog((prev) => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xử lý báo cáo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Kết quả xử lý</label>
                            <Select
                                value={processDialog.status}
                                onValueChange={(v) => setProcessDialog((prev) => ({ ...prev, status: v as ReportStatus }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reviewed">Đã xem xét</SelectItem>
                                    <SelectItem value="resolved">Đã giải quyết</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Ghi chú admin (tuỳ chọn)</label>
                            <Textarea
                                placeholder="Nhập ghi chú..."
                                value={processDialog.adminNote}
                                onChange={(e) => setProcessDialog((prev) => ({ ...prev, adminNote: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setProcessDialog({ open: false, reportId: '', status: 'resolved', adminNote: '', loading: false })}
                            >
                                Huỷ
                            </Button>
                            <Button onClick={handleProcess} disabled={processDialog.loading}>
                                {processDialog.loading ? 'Đang lưu...' : 'Xác nhận'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
