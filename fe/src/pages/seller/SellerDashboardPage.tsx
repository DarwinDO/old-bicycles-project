import { useState, useEffect } from 'react'
import { StatCard } from '@/components/dashboard/StatCard'
import { Package, ShoppingBag, Eye, TrendingUp, Clock, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { productsApi } from '@/api/products.api'
import { ordersApi } from '@/api/orders.api'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import type { Order } from '@/types/order'
import type { Product } from '@/types/product'
import { getSellerListingStatusPresentation } from './seller-listing-visibility'

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000) // minutes
  if (diff < 60) return `${diff} phút trước`
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`
  return `${Math.floor(diff / 1440)} ngày trước`
}

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sellerId = user?.id
    Promise.all([
      productsApi.getMine(0, 50),
      ordersApi.getMine(),
    ])
      .then(([productsPage, allOrders]) => {
        setProducts(productsPage.content)
        // Only seller's orders
        setOrders(allOrders.filter((o) => o.sellerId === sellerId))
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user?.id])

  // Derived stats
  const activeListings = products.filter((p) => getSellerListingStatusPresentation(p).isPubliclyVisible).length
  const pendingListings = products.filter((p) => p.status === 'pending').length
  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const completedOrders = orders.filter((o) => o.status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tổng quan cửa hàng</h2>
        <p className="text-muted-foreground">
          Theo dõi hoạt động kinh doanh và tương tác với tin đăng của bạn.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Đơn chờ xử lý"
          value={String(pendingOrders.length)}
          icon={ShoppingBag}
          description={pendingOrders.length > 0 ? 'Cần xác nhận ngay' : 'Không có đơn mới'}
          trend={pendingOrders.length > 0 ? { value: pendingOrders.length, isPositive: false } : undefined}
        />
        <StatCard
          title="Tin đang bật"
          value={String(activeListings)}
          icon={Package}
          description={`${pendingListings} tin đang chờ duyệt`}
        />
        <StatCard
          title="Đơn hoàn thành"
          value={String(completedOrders.length)}
          icon={Eye}
          description="Tổng giao dịch thành công"
          trend={completedOrders.length > 0 ? { value: completedOrders.length, isPositive: true } : undefined}
        />
        <StatCard
          title="Doanh thu"
          value={totalRevenue > 0 ? formatPrice(totalRevenue) : '—'}
          icon={TrendingUp}
          description="Từ các đơn hoàn tất"
        />
      </div>

      {/* Detail panels */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent listings */}
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-lg font-medium">Tin đăng gần đây</h3>
            <Link to={ROUTES.SELLER_LISTINGS} className="text-sm text-primary hover:underline">Xem tất cả</Link>
          </div>
          <div className="p-6 pt-2 space-y-3">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có tin đăng nào.</p>
            ) : (
              products.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  {p.images?.[0]?.url ? (
                    <img
                      src={p.images[0].url}
                      alt={p.title}
                      className="h-10 w-10 rounded-md object-cover border bg-muted shrink-0"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-xs">🚲</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    p.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    p.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {p.status === 'active' ? 'Đang bán' : p.status === 'pending' ? 'Chờ duyệt' : p.status === 'hidden' ? 'Đã ẩn' : p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending orders */}
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-lg font-medium">Việc cần làm ngay</h3>
            <Link to={ROUTES.SELLER_ORDERS} className="text-sm text-primary hover:underline">Xem đơn</Link>
          </div>
          <div className="p-6 pt-2 space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
                <Clock className="h-8 w-8 opacity-40" />
                <p className="text-sm">Không có đơn hàng chờ xử lý</p>
              </div>
            ) : (
              pendingOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 shrink-0">
                    <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {order.buyerName} muốn mua {order.productTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)} · Chờ xác nhận</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
