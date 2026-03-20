import type { ProductStatus } from '@/types/product'

export interface WishlistItem {
  productId: string
  title: string
  price: number
  status: ProductStatus
  sellerId: string
  sellerName: string
  primaryImageUrl?: string | null
  addedAt: string
}
