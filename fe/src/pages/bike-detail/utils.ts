import type { ProductImage, ProductSeller } from '@/types/product'
import type { Review } from '@/types/review'

export const CONDITION_LABELS: Record<string, string> = {
  new_90: 'Như mới (90%+)',
  used: 'Đã qua sử dụng',
  needs_repair: 'Cần sửa chữa',
}

export const ORDER_CREATED_NOTICE =
  'Đơn mua đã được tạo. Sau khi người bán chấp nhận đơn, bạn mới có thể lấy mã QR hoặc thông tin chuyển khoản ở mục Đơn mua.'

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(dateStr))
}

export function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return 'Hôm nay'
  if (days === 1) return '1 ngày trước'
  if (days < 30) return `${days} ngày trước`

  const months = Math.floor(days / 30)
  return `${months} tháng trước`
}

export function parseCurrencyInput(rawValue: string): number | null {
  const normalizedDigits = rawValue.replace(/[^\d]/g, '')

  if (!normalizedDigits) {
    return null
  }

  const parsedValue = Number(normalizedDigits)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

export function getAverageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) {
    return null
  }

  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
}

export function getSellerFullName(seller?: ProductSeller | null): string {
  if (!seller) {
    return 'Người bán'
  }

  return `${seller.firstName} ${seller.lastName}`.trim()
}

export function getSortedImages(images: ProductImage[]): ProductImage[] {
  const primaryImage = images.find((image) => image.isPrimary)

  if (!primaryImage) {
    return images
  }

  return [primaryImage, ...images.filter((image) => image.id !== primaryImage.id)]
}
