import { describe, expect, it } from 'vitest'
import { ROUTES } from '@/constants/routes'
import { canAccessSellerEntry, getAppHeaderNavigation } from './app-header-visibility'

describe('app-header-visibility', () => {
  it('hides seller entry for authenticated buyers', () => {
    expect(canAccessSellerEntry('buyer', true)).toBe(false)
    expect(getAppHeaderNavigation('buyer', true).some((item) => item.href === ROUTES.SELL)).toBe(false)
  })

  it('keeps seller entry for guests and sellers', () => {
    expect(canAccessSellerEntry(undefined, false)).toBe(true)
    expect(canAccessSellerEntry('seller', true)).toBe(true)
    expect(getAppHeaderNavigation(undefined, false).some((item) => item.href === ROUTES.SELL)).toBe(true)
    expect(getAppHeaderNavigation('seller', true).some((item) => item.href === ROUTES.SELL)).toBe(true)
  })
})
