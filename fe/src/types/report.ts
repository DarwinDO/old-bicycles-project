export type ReportReason = 'fraud' | 'fake' | 'wrong_description' | 'spam' | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'resolved'

export interface ReportRequest {
  targetId: string
  targetType: string
  reason: ReportReason
  description?: string
}

export interface ReportProcessRequest {
  status: ReportStatus
  adminNote?: string
}

export interface Report {
  id: string
  reporterId: string
  reporterName: string
  targetId: string
  targetType: string
  reason: ReportReason
  description?: string | null
  status: ReportStatus
  adminNote?: string | null
  processedById?: string | null
  processedByName?: string | null
  createdAt: string
  processedAt?: string | null
}
