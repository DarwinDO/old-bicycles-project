import { deleteResult, getResult, postResult } from '@/lib/http'
import type { WishlistItem } from '@/types/wishlist'

export const wishlistApi = {
  getMine() {
    return getResult<WishlistItem[]>('/api/wishlist')
  },

  add(productId: string) {
    return postResult<WishlistItem>(`/api/wishlist/${productId}`)
  },

  remove(productId: string) {
    return deleteResult<void>(`/api/wishlist/${productId}`)
  },
}
