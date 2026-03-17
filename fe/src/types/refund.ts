export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface RefundRequest {
  amount: number
  reason: string
  evidenceNote?: string
}

export interface RefundReviewRequest {
  status: RefundStatus
  adminNote?: string
  refundReference?: string
}

export interface Refund {
  id: string
  orderId: string
  paymentId: string
  requesterId: string
  requesterName: string
  amount: number
  reason: string
  evidenceNote?: string | null
  status: RefundStatus
  adminNote?: string | null
  refundReference?: string | null
  reviewedBy?: string | null
  reviewedByName?: string | null
  reviewedAt?: string | null
  processedAt?: string | null
  createdAt: string
}
