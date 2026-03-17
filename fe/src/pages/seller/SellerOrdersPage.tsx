import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, CheckCircle, XCircle, PackageCheck, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ordersApi } from '@/api/orders.api'
import { useAuth } from '@/contexts/AuthContext'
import type { Order, OrderStatus } from '@/types/order'

// ── helpers ────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateStr))
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  deposited: 'Đã nhận cọc',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  deposited: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const PAYMENT_LABEL: Record<string, string> = {
  partial: 'Đặt cọc',
  full: 'Mua đứt',
  transfer: 'Chuyển khoản',
  cash: 'Tiền mặt',
  online: 'Online',
}

// ── component ──────────────────────────────────────────────────────────────

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null) // orderId being acted on

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const all = await ordersApi.getMine()
      // Only show orders where current user is the seller
      const sellerOrders = all.filter((o) => o.sellerId === user?.id)
      setOrders(sellerOrders)
    } catch {
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const withActionLoading = async (orderId: string, fn: () => Promise<Order>) => {
    setActionLoading(orderId)
    try {
      const updated = await fn()
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    } catch {
      // silent — keep existing state
    } finally {
      setActionLoading(null)
    }
  }

  const handleAccept = (orderId: string) =>
    withActionLoading(orderId, () => ordersApi.accept(orderId))

  const handleConfirmDeposit = (orderId: string) =>
    withActionLoading(orderId, () => ordersApi.confirmDeposit(orderId))

  const handleComplete = (orderId: string) =>
    withActionLoading(orderId, () => ordersApi.complete(orderId))

  const handleCancel = (orderId: string) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return Promise.resolve()
    return withActionLoading(orderId, () => ordersApi.cancel(orderId))
  }

  // ── render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Đơn hàng</h2>
          <p className="text-muted-foreground">Xác nhận và xử lý các yêu cầu từ người mua.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border bg-destructive/10 text-destructive p-4 text-sm">{error}</div>
      )}

      {orders.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center text-muted-foreground border-2 border-dashed rounded-xl">
          <ShoppingBag className="h-10 w-10 opacity-40" />
          <p className="font-medium">Chưa có đơn hàng nào</p>
          <p className="text-sm">Các yêu cầu đặt cọc hoặc mua xe sẽ hiển thị ở đây.</p>
        </div>
      )}

      <div className="grid gap-4">
        {orders.map((order) => {
          const isActing = actionLoading === order.id
          const isPending = order.status === 'pending'
          const isDeposited = order.status === 'deposited'
          const isCompleted = order.status === 'completed'
          const isCancelled = order.status === 'cancelled'

          return (
            <div
              key={order.id}
              className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl border bg-card text-card-foreground shadow-sm transition-all ${
                isPending ? 'border-orange-400/50 shadow-orange-500/10' : ''
              }`}
            >
              {/* Left: Info */}
              <div className="flex gap-4">
                <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center
                  ${isPending ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-secondary/50 text-muted-foreground'}`}
                >
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{order.productTitle}</h3>
                    <Badge variant="outline" className="text-xs font-normal">#{order.id.slice(0, 8)}</Badge>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    <span>Người mua: <span className="font-medium text-foreground">{order.buyerName}</span></span>
                    <span>•</span>
                    <span>Hình thức: {PAYMENT_LABEL[order.paymentOption]} - {PAYMENT_LABEL[order.paymentMethod]}</span>
                    <span>•</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  {order.depositAmount && (
                    <p className="text-xs text-muted-foreground">
                      Cọc: {formatPrice(order.depositAmount)} / Tổng: {formatPrice(order.totalAmount)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Amount + Actions */}
              <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-border">
                <div className="text-lg font-bold">{formatPrice(order.requiredUpfrontAmount)}</div>

                {isActing ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50"
                          onClick={() => handleCancel(order.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Từ chối
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleAccept(order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Chấp nhận
                        </Button>
                      </>
                    )}
                    {isDeposited && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfirmDeposit(order.id)}
                        >
                          Xác nhận đã nhận cọc
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary"
                          onClick={() => handleComplete(order.id)}
                        >
                          <PackageCheck className="h-4 w-4 mr-1.5" />
                          Hoàn tất giao dịch
                        </Button>
                      </>
                    )}
                    {isCompleted && (
                      <Button variant="ghost" size="sm" disabled className="text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Giao dịch xong
                      </Button>
                    )}
                    {isCancelled && (
                      <Badge variant="outline" className="text-xs text-gray-500">Đã hủy</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
