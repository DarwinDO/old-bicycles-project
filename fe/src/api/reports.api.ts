import { getResult, postResult, putResult, compactParams } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { Report, ReportProcessRequest, ReportRequest, ReportStatus } from '@/types/report'

export interface AdminReportFilters {
  status?: ReportStatus
  targetType?: string
  page?: number
  size?: number
}

export const reportsApi = {
  submit(request: ReportRequest) {
    return postResult<Report, ReportRequest>('/api/reports', request)
  },

  getMine(page = 0, size = 15) {
    return getResult<PageResult<Report>>('/api/reports/me', {
      params: { page, size },
    })
  },

  getAdminReports(filters: AdminReportFilters = {}) {
    return getResult<PageResult<Report>>('/api/admin/reports', {
      params: compactParams(filters),
    })
  },

  process(reportId: string, request: ReportProcessRequest) {
    return putResult<Report, ReportProcessRequest>(`/api/admin/reports/${reportId}/process`, request)
  },
}
