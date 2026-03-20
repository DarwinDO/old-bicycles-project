import { getResult, patchResult, postResult } from '@/lib/http'
import type { Order, OrderCreateRequest } from '@/types/order'

export const ordersApi = {
  create(request: OrderCreateRequest) {
    return postResult<Order, OrderCreateRequest>('/api/orders', request)
  },

  getMine() {
    return getResult<Order[]>('/api/orders/me')
  },

  accept(orderId: string) {
    return patchResult<Order>(`/api/orders/${orderId}/accept`)
  },

  confirmDeposit(orderId: string) {
    return patchResult<Order>(`/api/orders/${orderId}/confirm-deposit`)
  },

  complete(orderId: string) {
    return patchResult<Order>(`/api/orders/${orderId}/complete`)
  },

  confirmReceived(orderId: string) {
    return patchResult<Order>(`/api/orders/${orderId}/confirm-received`)
  },

  cancel(orderId: string) {
    return patchResult<Order>(`/api/orders/${orderId}/cancel`)
  },
}
