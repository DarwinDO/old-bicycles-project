import type { Product } from '@/types/product'

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

export function getPrimaryImage(product: Product): string {
  const primaryImage = product.images.find((image) => image.isPrimary)

  return (
    primaryImage?.url ??
    product.images[0]?.url ??
    'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800'
  )
}
