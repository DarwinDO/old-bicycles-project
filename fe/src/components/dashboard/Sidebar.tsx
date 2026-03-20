import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Flag,
  History,
  LayoutDashboard,
  Package,
  Scale,
  ShoppingBag,
  Tags,
  Users,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

interface SidebarProps {
  items: NavItem[]
  title?: string
}

export function Sidebar({ items, title = 'Dashboard' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && <span className="truncate text-lg font-semibold text-foreground">{title}</span>}

        <Button variant="ghost" size="icon" onClick={() => setCollapsed((current) => !current)} className="ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {items.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted',
                    isActive && 'bg-primary/10 font-medium text-primary',
                    collapsed && 'justify-center',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/admin' },
  { icon: Users, label: 'Người dùng', href: '/admin/users' },
  { icon: FileText, label: 'Tin đăng', href: '/admin/listings' },
  { icon: Flag, label: 'Báo cáo', href: '/admin/reports' },
  { icon: Tags, label: 'Danh mục', href: '/admin/categories' },
  { icon: Scale, label: 'Tranh chấp', href: '/admin/disputes' },
  { icon: Wallet, label: 'Giải ngân', href: '/admin/payouts' },
]

export const inspectorNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/inspector' },
  { icon: ClipboardCheck, label: 'Yêu cầu kiểm định', href: '/inspector/requests' },
  { icon: History, label: 'Lịch sử', href: '/inspector/history' },
]

export const sellerNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/seller' },
  { icon: Package, label: 'Quản lý tin đăng', href: '/seller/listings' },
  { icon: ShoppingBag, label: 'Quản lý đơn cọc', href: '/seller/orders' },
]
