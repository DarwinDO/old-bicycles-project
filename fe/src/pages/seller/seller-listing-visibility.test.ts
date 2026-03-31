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
    sellerActionLocked: false,
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

  it('explains when a listing is locked by an accepted transaction', () => {
    const presentation = getSellerListingStatusPresentation(
      buildProduct({
        status: 'inspected_passed',
        isVerified: true,
        lockedForTransaction: true,
      }),
    )

    expect(presentation.label).toBe('Tạm khóa vì đã chốt giao dịch')
    expect(presentation.isPubliclyVisible).toBe(false)
    expect(presentation.hint).toContain('không còn thấy ngoài marketplace')
  })

  it('explains when seller actions are locked by open buyer requests', () => {
    const presentation = getSellerListingStatusPresentation(
      buildProduct({
        status: 'active',
        isVerified: true,
        lockedForTransaction: false,
        sellerActionLocked: true,
      }),
    )

    expect(presentation.label).toBe('Đang có yêu cầu mua chờ phản hồi')
    expect(presentation.isPubliclyVisible).toBe(true)
    expect(presentation.hint).toContain('sửa, ẩn hoặc xóa')
  })

  it('shows an expired-inspection warning when a raw active listing is no longer public', () => {
    const presentation = getSellerListingStatusPresentation(
      buildProduct({
        status: 'active',
        isVerified: false,
        lockedForTransaction: false,
        inspection: {
          id: 'inspection-1',
          passed: true,
          validUntil: '2026-03-20T10:00:00.000Z',
          createdAt: '2026-03-19T10:00:00.000Z',
        },
      }),
    )

    expect(presentation.label).toBe('Hết hạn kiểm định')
    expect(presentation.isPubliclyVisible).toBe(false)
    expect(presentation.hint).toContain('kiểm định đã hết hạn')
  })
})
