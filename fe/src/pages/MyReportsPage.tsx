import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { reportsApi } from '@/api/reports.api'
import { ReportEvidenceSection } from '@/components/common/ReportEvidenceSection'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import type { PageResult } from '@/types/api'
import type { Report, ReportStatus } from '@/types/report'

const targetTypeLabels: Record<string, string> = {
  product: 'Tin đăng',
  user: 'Người dùng',
  PRODUCT: 'Tin đăng',
  USER: 'Người dùng',
}

const reportStatusLabels: Record<ReportStatus, string> = {
  pending: 'Chờ xử lý',
  investigating: 'Đang điều tra',
  resolved_upheld: 'Xác nhận vi phạm',
  resolved_dismissed: 'Bác bỏ báo cáo',
}

export default function MyReportsPage() {
  const [page, setPage] = useState<PageResult<Report> | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await reportsApi.getMine(currentPage, 10)
      setPage(result)
    } catch {
      setError('Không thể tải danh sách báo cáo.')
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    void fetchReports()
  }, [fetchReports])

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <Flag className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Báo cáo của tôi</h1>
          {!loading && page && <p className="text-sm text-muted-foreground">{page.totalElements} báo cáo</p>}
        </div>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {!page || page.content.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Flag className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Bạn chưa có báo cáo nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {page.content.map((report) => (
                <div key={report.id} className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                        {targetTypeLabels[report.targetType] || report.targetType}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{report.targetId}</span>
                    </div>
                    <StatusBadge
                      status={report.status}
                      labelOverride={reportStatusLabels[report.status]}
                    />
                  </div>

                  <p className="text-sm font-medium text-foreground">{report.reason}</p>

                  {report.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{report.description}</p>
                  )}

                  <ReportEvidenceSection title="Ảnh bạn đã gửi" files={report.evidenceFiles} />

                  {report.adminNote && (
                    <div className="rounded bg-muted/50 p-2 text-xs">
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
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((value) => value - 1)}
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
                onClick={() => setCurrentPage((value) => value + 1)}
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
