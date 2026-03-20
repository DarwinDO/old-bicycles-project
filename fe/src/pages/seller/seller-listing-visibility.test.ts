import { describe, expect, it } from 'vitest'
import type { Product } from '@/types/product'
import { getSellerListingStatusPresentation } from './seller-listing-visibility'

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    title: 'Trek Domane',
    price: 25_000_000,
    status: 'active',
    createdAt: '2026-03-19T10:00:00.000Z',
    images: [],
    isVerified: true,
    lockedForTransaction: false,
    ...overrides,
  }
}

describe('seller-listing-visibility', () => {
  it('marks a verified active product as publicly visible', () => {
    const presentation = getSellerListingStatusPresentation(
      buildProduct({
        status: 'active',
        isVerified: true,
        lockedForTransaction: false,
      }),
    )

    expect(presentation.label).toBe('Đang hiển thị công khai')
    expect(presentation.isPubliclyVisible).toBe(true)
    expect(presentation.hint).toBeNull()
  })

  it('explains when a listing is locked by an active transaction', () => {
    const presentation = getSellerListingStatusPresentation(
      buildProduct({
        status: 'inspected_passed',
        isVerified: true,
        lockedForTransaction: true,
      }),
    )

    expect(presentation.label).toBe('Tạm khóa do đang có giao dịch')
    expect(presentation.isPubliclyVisible).toBe(false)
    expect(presentation.hint).toContain('buyer khác sẽ không thấy')
  })

  it('explains when a raw active listing is not yet eligible for marketplace visibility', () => {
    const presentation = getSellerListingStatusPresentation(
      buildProduct({
        status: 'active',
        isVerified: false,
        lockedForTransaction: false,
      }),
    )

    expect(presentation.label).toBe('Chưa đủ điều kiện hiển thị công khai')
    expect(presentation.isPubliclyVisible).toBe(false)
    expect(presentation.hint).toContain('seller vẫn thấy nhưng buyer chưa thấy')
  })
})
