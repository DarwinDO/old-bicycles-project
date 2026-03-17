import { patchResult, postResult } from '@/lib/http'
import type { Refund, RefundRequest, RefundReviewRequest } from '@/types/refund'

export const refundsApi = {
  create(orderId: string, request: RefundRequest) {
    return postResult<Refund, RefundRequest>(`/api/orders/${orderId}/refunds`, request)
  },

  review(refundId: string, request: RefundReviewRequest) {
    return patchResult<Refund, RefundReviewRequest>(`/api/admin/refunds/${refundId}/review`, request)
  },
}
