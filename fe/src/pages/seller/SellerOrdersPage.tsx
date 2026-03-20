import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Loader2, ShoppingBag, Truck, Wallet, XCircle } from 'lucide-react'
import { ordersApi } from '@/api/orders.api'
import { OrderEvidenceDialog } from '@/components/profile/OrderEvidenceDialog'
import { OrderEvidenceSection } from '@/components/profile/OrderEvidenceSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  canCancelOpenOrder,
  canSellerAcceptOrder,
  canSellerCompleteOrder,
  canSellerConfirmCashDeposit,
  formatOrderCurrency,
  formatOrderDate,
  getOrderStatusMeta,
  getOrderToneClass,
  getPaymentMethodLabel,
  getPaymentOptionLabel,
} from '@/lib/order-display'
import type { Order, OrderEvidenceInput } from '@/types/order'

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const sellerId = user?.id ?? null
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveryError, setDeliveryError] = useState<string | null>(null)
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null)
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null)

  useEffect(() => {
    if (!sellerId) {
      setOrders([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadOrders() {
      setLoading(true)

      try {
        const result = await ordersApi.getMine()

        if (!cancelled) {
          setOrders(result.filter((order) => order.sellerId === sellerId))
          setError(null)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getErrorMessage(requestError, 'Không thể tải danh sách đơn bán.'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [sellerId])

  function replaceOrder(updatedOrder: Order) {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
    )
  }

  async function runOrderAction(order: Order, action: 'accept' | 'confirmDeposit' | 'cancel') {
    setActionLoadingKey(`${action}:${order.id}`)

    try {
      const updatedOrder =
        action === 'accept'
          ? await ordersApi.accept(order.id)
          : action === 'confirmDeposit'
            ? await ordersApi.confirmDeposit(order.id)
            : await ordersApi.cancel(order.id)

      replaceOrder(updatedOrder)
      setError(null)
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          action === 'accept'
            ? 'Không thể chấp nhận đơn hàng lúc này.'
            : action === 'confirmDeposit'
              ? 'Không thể xác nhận thanh toán trực tiếp lúc này.'
              : 'Không thể hủy đơn hàng lúc này.',
        ),
      )
    } finally {
      setActionLoadingKey(null)
    }
  }

  async function handleSubmitDeliveryEvidence(order: Order, values: OrderEvidenceInput) {
    setActionLoadingKey(`complete:${order.id}`)

    try {
      const updatedOrder = await ordersApi.complete(order.id, values)
      replaceOrder(updatedOrder)
      setSelectedOrderForDelivery(null)
      setDeliveryError(null)
      setError(null)
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Không thể báo đã giao xe lúc này.')
      setDeliveryError(message)
      setError(message)
    } finally {
      setActionLoadingKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quản lý đơn cọc / mua</h2>
        <p className="text-muted-foreground">
          Theo dõi đơn hàng của người mua, chấp nhận giao dịch, xác nhận thanh toán trực tiếp và báo đã giao xe để
          người mua xác nhận nhận hàng.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải danh sách đơn bán...
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <p className="text-base font-medium text-foreground">Bạn chưa có đơn bán nào.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Khi người mua tạo order cho sản phẩm của bạn, đơn hàng sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const statusMeta = getOrderStatusMeta(order)

            return (
              <div key={order.id} className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
                      <ShoppingBag className="h-5 w-5" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{order.productTitle}</h3>
                        <Badge variant="outline" className="text-xs font-normal">
                          Mã: {order.id}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          Người mua: <span className="font-medium text-foreground">{order.buyerName}</span>
                        </span>
                        <span>•</span>
                        <span>{formatOrderDate(order.createdAt)}</span>
                      </div>

                      <div className={`inline-flex items-center text-sm font-medium ${getOrderToneClass(statusMeta.tone)}`}>
                        Trạng thái: {statusMeta.label}
                      </div>
                      <p className="text-sm text-muted-foreground">{statusMeta.helperText}</p>

                      <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                        <p>
                          Phương thức: <span className="font-medium text-foreground">{getPaymentMethodLabel(order)}</span>
                        </p>
                        <p>
                          Hình thức: <span className="font-medium text-foreground">{getPaymentOptionLabel(order)}</span>
                        </p>
                        <p>
                          Ứng trước:{' '}
                          <span className="font-medium text-foreground">{formatOrderCurrency(order.requiredUpfrontAmount)}</span>
                        </p>
                        <p>
                          Đã thanh toán:{' '}
                          <span className="font-medium text-foreground">{formatOrderCurrency(order.paidAmount)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-start gap-3 border-t border-border pt-4 lg:w-auto lg:items-end lg:border-0 lg:pt-0">
                    <div className="text-lg font-bold text-primary">{formatOrderCurrency(order.totalAmount)}</div>

                    <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                      {canSellerAcceptOrder(order) && (
                        <Button
                          className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
                          onClick={() => void runOrderAction(order, 'accept')}
                          disabled={actionLoadingKey === `accept:${order.id}`}
                        >
                          {actionLoadingKey === `accept:${order.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Chấp nhận đơn
                        </Button>
                      )}

                      {canSellerConfirmCashDeposit(order) && (
                        <Button
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => void runOrderAction(order, 'confirmDeposit')}
                          disabled={actionLoadingKey === `confirmDeposit:${order.id}`}
                        >
                          {actionLoadingKey === `confirmDeposit:${order.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wallet className="h-4 w-4" />
                          )}
                          Xác nhận đã nhận tiền
                        </Button>
                      )}

                      {canSellerCompleteOrder(order) && (
                        <Button
                          variant="outline"
                          className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-950/30"
                          onClick={() => {
                            setSelectedOrderForDelivery(order)
                            setDeliveryError(null)
                          }}
                          disabled={actionLoadingKey === `complete:${order.id}`}
                        >
                          {actionLoadingKey === `complete:${order.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Truck className="h-4 w-4" />
                          )}
                          Báo đã giao xe
                        </Button>
                      )}

                      {canCancelOpenOrder(order) && (
                        <Button
                          variant="outline"
                          className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                          onClick={() => void runOrderAction(order, 'cancel')}
                          disabled={actionLoadingKey === `cancel:${order.id}`}
                        >
                          {actionLoadingKey === `cancel:${order.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Từ chối / hủy đơn
                        </Button>
                      )}

                      {!canSellerAcceptOrder(order) &&
                        !canSellerConfirmCashDeposit(order) &&
                        !canSellerCompleteOrder(order) &&
                        !canCancelOpenOrder(order) && (
                          <Button variant="ghost" className="cursor-default hover:bg-transparent" disabled>
                            Không có thao tác thêm
                          </Button>
                        )}

                      {order.fundingStatus === 'seller_payout_pending' && (
                        <Button variant="outline" asChild>
                          <Link to="/profile?tab=payout">Cập nhật tài khoản nhận tiền</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <OrderEvidenceSection
                    title="Chứng cứ bàn giao từ người bán"
                    evidence={order.sellerHandoverEvidence}
                  />
                  <OrderEvidenceSection
                    title="Chứng cứ đã nhận xe từ người mua"
                    evidence={order.buyerReceiptEvidence}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <OrderEvidenceDialog
        open={Boolean(selectedOrderForDelivery)}
        title="Xác nhận đã bàn giao xe"
        description="Tải ảnh bàn giao để buyer và admin có thể đối chiếu lại tình trạng xe cho đơn hàng"
        noteLabel="Ghi chú bàn giao"
        notePlaceholder="Ví dụ: đã bàn giao xe và phụ kiện tại cửa hàng, buyer đã kiểm tra ngoại quan."
        submitLabel="Báo đã giao xe"
        orderTitle={selectedOrderForDelivery?.productTitle ?? ''}
        requireFiles
        helperText="Vui lòng chụp rõ xe, phụ kiện đi kèm hoặc tình trạng đóng gói. Không chụp thông tin cá nhân không cần thiết."
        loading={Boolean(selectedOrderForDelivery) && actionLoadingKey === `complete:${selectedOrderForDelivery?.id}`}
        error={deliveryError}
        onClose={() => {
          setSelectedOrderForDelivery(null)
          setDeliveryError(null)
        }}
        onSubmit={(values) =>
          selectedOrderForDelivery ? handleSubmitDeliveryEvidence(selectedOrderForDelivery, values) : undefined
        }
      />
    </div>
  )
}
