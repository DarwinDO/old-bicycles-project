import { ROUTES } from '@/constants/routes'
import type { AppRole } from '@/types/auth'

export interface AppHeaderNavigationItem {
  name: string
  href: string
}

const baseNavigation: AppHeaderNavigationItem[] = [
  { name: 'Trang chủ', href: ROUTES.HOME },
  { name: 'Mua xe', href: ROUTES.MARKET },
  { name: 'Bán xe', href: ROUTES.SELL },
  { name: 'Tin nhắn', href: ROUTES.MESSAGES },
  { name: 'Hướng dẫn', href: ROUTES.GUIDE },
]

export function canAccessSellerEntry(role?: AppRole | null, isAuthenticated = false) {
  return !isAuthenticated || role === 'seller'
}

export function getAppHeaderNavigation(role?: AppRole | null, isAuthenticated = false) {
  if (canAccessSellerEntry(role, isAuthenticated)) {
    return baseNavigation
  }

  return baseNavigation.filter((item) => item.href !== ROUTES.SELL)
}
