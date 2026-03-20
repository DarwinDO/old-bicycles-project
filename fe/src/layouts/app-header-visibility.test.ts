import { describe, expect, it } from 'vitest'
import { ROUTES } from '@/constants/routes'
import { canAccessSellerEntry, getAppHeaderNavigation, getSellEntryHref } from './app-header-visibility'

describe('app-header-visibility', () => {
  it('hides seller entry for authenticated buyers', () => {
    expect(canAccessSellerEntry('buyer', true)).toBe(false)
    expect(getAppHeaderNavigation('buyer', true).some((item) => item.href === ROUTES.SELL)).toBe(false)
  })

  it('keeps seller entry for guests and sellers', () => {
    expect(canAccessSellerEntry(undefined, false)).toBe(true)
    expect(canAccessSellerEntry('seller', true)).toBe(true)
    expect(getAppHeaderNavigation(undefined, false).some((item) => item.href === ROUTES.SELL)).toBe(true)
    expect(getAppHeaderNavigation('seller', true).some((item) => item.href === ROUTES.SELLER_NEW_PRODUCT)).toBe(true)
  })

  it('routes seller create CTA into seller dashboard flow', () => {
    expect(getSellEntryHref('seller', true)).toBe(ROUTES.SELLER_NEW_PRODUCT)
    expect(getSellEntryHref(undefined, false)).toBe(ROUTES.SELL)
  })
})
