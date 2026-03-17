import { getResult, postResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { Review, ReviewRequest } from '@/types/review'

export const reviewsApi = {
  submit(orderId: string, request: ReviewRequest) {
    return postResult<Review, ReviewRequest>(`/api/reviews/${orderId}`, request)
  },

  getSellerReviews(sellerId: string, page = 0, size = 15) {
    return getResult<PageResult<Review>>(`/api/users/${sellerId}/reviews`, {
      params: { page, size },
    })
  },
}
