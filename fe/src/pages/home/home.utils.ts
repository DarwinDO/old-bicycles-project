import { formatPriceDisplay } from '@/lib/currency-input'
import type { Product } from '@/types/product'

const PRODUCT_CONDITION_LABELS: Record<NonNullable<Product['condition']>, string> = {
  new_90: 'Như mới',
  used: 'Đã qua sử dụng',
  needs_repair: 'Cần sửa chữa',
}

export function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

export function getPrimaryImage(product: Product): string {
  const primaryImage = product.images.find((image) => image.isPrimary)
  return primaryImage?.url ?? product.images[0]?.url ?? ''
}

export function getProductConditionLabel(condition?: Product['condition']) {
  if (!condition) {
    return null
  }

  return PRODUCT_CONDITION_LABELS[condition]
}

export function getProductLocation(product: Product): string {
  return [product.district, product.province].filter(Boolean).join(', ') || 'Chưa cập nhật địa điểm'
}
