import { compactParams, getResult, patchResult, postResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { AdminRefund, AdminRefundFilters, Refund, RefundRequest, RefundReviewRequest } from '@/types/refund'

export const refundsApi = {
  create(orderId: string, request: RefundRequest) {
    return postResult<Refund, RefundRequest>(`/api/orders/${orderId}/refunds`, request)
  },

  getAll(filters: AdminRefundFilters = {}) {
    return getResult<PageResult<AdminRefund>>('/api/admin/refunds', {
      params: compactParams(filters),
    })
  },

  review(refundId: string, request: RefundReviewRequest) {
    return patchResult<Refund, RefundReviewRequest>(`/api/admin/refunds/${refundId}/review`, request)
  },
}
