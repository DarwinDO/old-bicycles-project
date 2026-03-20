import type { OrderFundingStatus, OrderStatus, PaymentMethod } from '@/types/order'

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

export interface AdminRefund extends Refund {
  buyerId?: string | null
  buyerName?: string | null
  sellerId?: string | null
  sellerName?: string | null
  productId?: string | null
  productTitle?: string | null
  hasInspection: boolean
  orderStatus?: OrderStatus | null
  fundingStatus?: OrderFundingStatus | null
  paymentMethod?: PaymentMethod | null
}

export interface AdminRefundFilters {
  keyword?: string
  status?: RefundStatus
  page?: number
  size?: number
}
