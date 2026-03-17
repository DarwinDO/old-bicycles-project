import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PackageOpen, CheckCircle2, Star, Loader2, RefreshCw } from 'lucide-react'
import { ordersApi } from '@/api/orders.api'
import { reviewsApi } from '@/api/reviews.api'
import { useAuth } from '@/contexts/AuthContext'
import type { Order, OrderStatus } from '@/types/order'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(dateStr))
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  deposited: 'Đã nhận cọc - Chờ giao xe',
  completed: 'Đã hoàn tất',
  cancelled: 'Đã hủy',
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: 'text-orange-600 dark:text-orange-400',
  deposited: 'text-blue-600 dark:text-blue-400',
  completed: 'text-green-600 dark:text-green-400',
  cancelled: 'text-gray-500 dark:text-gray-400',
}

// ── inline review form ────────────────────────────────────────────────────────

interface ReviewFormProps {
  orderId: string
  sellerName: string
  onDone: () => void
}

function ReviewForm({ orderId, sellerName, onDone }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!comment.trim()) { setError('Vui lòng nhập nhận xét.'); return }
    setLoading(true)
    setError(null)
    try {
      await reviewsApi.submit(orderId, { rating, comment })
      onDone()
    } catch {
      setError('Gửi đánh giá thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 p-4 rounded-lg border bg-muted/30 space-y-3">
      <p className="text-sm font-medium">Đánh giá người bán: <span className="text-foreground">{sellerName}</span></p>
      {/* Star selector */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            className="focus:outline-none"
          >
            <Star className={`h-6 w-6 transition-colors ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground self-center">{rating}/5</span>
      </div>
      <textarea
        className="w-full text-sm min-h-[80px] rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Chia sẻ trải nghiệm của bạn về người bán..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onDone} disabled={loading}>Hủy</Button>
        <Button size="sm" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Gửi đánh giá
        </Button>
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export function BuyerOrdersView() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null)
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set())

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const all = await ordersApi.getMine()
      // Only buyer's orders
      const buyerOrders = all.filter((o) => o.buyerId === user?.id)
      setOrders(buyerOrders)
    } catch {
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleReviewDone = (orderId: string) => {
    setReviewedOrderIds((prev) => new Set(prev).add(orderId))
    setReviewingOrderId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Đơn mua của tôi</h2>
          <p className="text-muted-foreground text-sm">Theo dõi trạng thái giao hàng và đánh giá người bán.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border bg-destructive/10 text-destructive p-4 text-sm">{error}</div>
      )}

      {orders.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center text-muted-foreground border-2 border-dashed rounded-xl">
          <PackageOpen className="h-10 w-10 opacity-40" />
          <p className="font-medium">Chưa có đơn hàng nào</p>
          <p className="text-sm">Khi bạn đặt mua hoặc đặt cọc xe, đơn hàng sẽ hiển thị ở đây.</p>
        </div>
      )}

      <div className="grid gap-4">
        {orders.map((order) => {
          const isCompleted = order.status === 'completed'
          const canReview = isCompleted && !reviewedOrderIds.has(order.id)
          const isReviewing = reviewingOrderId === order.id

          return (
            <div
              key={order.id}
              className={`flex flex-col p-5 rounded-xl border bg-card text-card-foreground shadow-sm transition-all ${
                order.status === 'pending' ? 'border-orange-400/50' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Left */}
                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                    <PackageOpen className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{order.productTitle}</h3>
                      <Badge variant="outline" className="text-xs font-normal">#{order.id.slice(0, 8)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      <span>Người bán: <span className="font-medium text-foreground">{order.sellerName}</span></span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <span className={`text-sm font-medium ${STATUS_CLASS[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-border">
                  <div className="text-lg font-bold text-primary">{formatPrice(order.totalAmount)}</div>
                  {canReview && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950/30"
                      onClick={() => setReviewingOrderId(order.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Đánh giá người bán
                    </Button>
                  )}
                  {reviewedOrderIds.has(order.id) && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      Đã đánh giá
                    </span>
                  )}
                </div>
              </div>

              {/* Inline review form */}
              {isReviewing && (
                <ReviewForm
                  orderId={order.id}
                  sellerName={order.sellerName}
                  onDone={() => handleReviewDone(order.id)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
