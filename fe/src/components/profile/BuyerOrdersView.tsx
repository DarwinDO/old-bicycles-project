import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CreditCard,
  Loader2,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { ordersApi } from '@/api/orders.api'
import { paymentsApi } from '@/api/payments.api'
import { refundsApi } from '@/api/refunds.api'
import { DisputeModal, type RefundFormValues } from '@/components/profile/DisputeModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  canBuyerConfirmReceived,
  canBuyerRequestPayment,
  canBuyerRequestRefund,
  canCancelOpenOrder,
  formatOrderCurrency,
  formatOrderDate,
  getOrderStatusMeta,
  getOrderToneClass,
  getPaymentMethodLabel,
  getPaymentOptionLabel,
} from '@/lib/order-display'
import type { Order } from '@/types/order'
import type { PaymentRequestResponse } from '@/types/payment'

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

export function BuyerOrdersView() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null)
  const [paymentRequests, setPaymentRequests] = useState<Record<string, PaymentRequestResponse>>({})
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null)
  const [refundError, setRefundError] = useState<string | null>(null)
  const buyerOrders = user ? orders.filter((order) => order.buyerId === user.id) : []

  useEffect(() => {
    const state = location.state as { orderCreatedNotice?: string } | null

    if (!state?.orderCreatedNotice) {
      return
    }

    setNotice(state.orderCreatedNotice)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location.pathname, location.search, location.state, navigate])

  useEffect(() => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadOrders(showLoading = false) {
      if (showLoading) {
        setLoading(true)
      }

      try {
        const result = await ordersApi.getMine()

        if (!cancelled) {
          setOrders(result)
          setError(null)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getErrorMessage(requestError, 'Không thể tải danh sách đơn mua.'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOrders(true)

    const intervalId = window.setInterval(() => {
      void loadOrders(false)
    }, 15000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [user])

  function replaceOrder(updatedOrder: Order) {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
    )
  }

  async function handleCancelOrder(order: Order) {
    setActionLoadingKey(`cancel:${order.id}`)

    try {
      const updatedOrder = await ordersApi.cancel(order.id)
      replaceOrder(updatedOrder)
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể hủy đơn hàng lúc này.'))
    } finally {
      setActionLoadingKey(null)
    }
  }

  async function handleCreatePaymentRequest(order: Order) {
    setActionLoadingKey(`payment:${order.id}`)

    try {
      const paymentRequest = await paymentsApi.createRequest(order.id)
      setPaymentRequests((current) => ({ ...current, [order.id]: paymentRequest }))
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể tạo yêu cầu thanh toán lúc này.'))
    } finally {
      setActionLoadingKey(null)
    }
  }

  async function handleConfirmReceived(order: Order) {
    setActionLoadingKey(`confirmReceived:${order.id}`)

    try {
      const updatedOrder = await ordersApi.confirmReceived(order.id)
      replaceOrder(updatedOrder)
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể xác nhận đã nhận xe lúc này.'))
    } finally {
      setActionLoadingKey(null)
    }
  }

  async function handleSubmitRefund(values: RefundFormValues) {
    if (!selectedOrderForRefund) {
      return
    }

    setActionLoadingKey(`refund:${selectedOrderForRefund.id}`)

    try {
      await refundsApi.create(selectedOrderForRefund.id, {
        amount: selectedOrderForRefund.paidAmount,
        reason: values.reason,
        evidenceNote: values.evidenceNote,
      })

      const refreshedOrders = await ordersApi.getMine()
      setOrders(refreshedOrders)
      setRefundError(null)
      setSelectedOrderForRefund(null)
      setError(null)
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Không thể gửi yêu cầu hoàn tiền lúc này.')
      setRefundError(message)
      setError(message)
    } finally {
      setActionLoadingKey(null)
    }
  }

  async function refreshOrdersSilently() {
    if (!user) {
      return
    }

    try {
      const refreshedOrders = await ordersApi.getMine()
      setOrders(refreshedOrders)
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể tải lại trạng thái đơn hàng.'))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Đơn mua của tôi</h2>
        <p className="text-sm text-muted-foreground">
          Theo dõi đơn hàng, lấy thông tin thanh toán, xác nhận đã nhận xe và gửi yêu cầu hoàn tiền khi đủ điều kiện.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải danh sách đơn mua...
          </div>
        </div>
      ) : buyerOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <p className="text-base font-medium text-foreground">Bạn chưa có đơn mua nào.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Khi tạo order từ trang chi tiết xe, đơn hàng sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {buyerOrders.map((order) => {
            const statusMeta = getOrderStatusMeta(order)
            const paymentRequest = paymentRequests[order.id]
            const paymentActionLoading = actionLoadingKey === `payment:${order.id}`
            const cancelActionLoading = actionLoadingKey === `cancel:${order.id}`
            const refundActionLoading = actionLoadingKey === `refund:${order.id}`
            const confirmReceivedLoading = actionLoadingKey === `confirmReceived:${order.id}`

            return (
              <div key={order.id} className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
                      <PackageOpen className="h-5 w-5" />
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
                          Người bán: <span className="font-medium text-foreground">{order.sellerName}</span>
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
                          Đã thanh toán:{' '}
                          <span className="font-medium text-foreground">{formatOrderCurrency(order.paidAmount)}</span>
                        </p>
                        <p>
                          Còn lại:{' '}
                          <span className="font-medium text-foreground">{formatOrderCurrency(order.remainingAmount)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-start gap-3 border-t border-border pt-4 lg:w-auto lg:items-end lg:border-0 lg:pt-0">
                    <div className="text-lg font-bold text-primary">{formatOrderCurrency(order.totalAmount)}</div>

                    <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                      {canBuyerRequestPayment(order) && (
                        <Button
                          className="gap-1.5"
                          onClick={() => void handleCreatePaymentRequest(order)}
                          disabled={paymentActionLoading}
                        >
                          {paymentActionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          {paymentRequest ? 'Làm mới hướng dẫn thanh toán' : 'Lấy thông tin thanh toán'}
                        </Button>
                      )}

                      {canBuyerRequestRefund(order) && (
                        <Button
                          variant="outline"
                          className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                          onClick={() => {
                            setSelectedOrderForRefund(order)
                            setRefundError(null)
                          }}
                          disabled={refundActionLoading}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Yêu cầu hoàn tiền
                        </Button>
                      )}

                      {canBuyerConfirmReceived(order) && (
                        <Button
                          className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
                          onClick={() => void handleConfirmReceived(order)}
                          disabled={confirmReceivedLoading}
                        >
                          {confirmReceivedLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                          Xác nhận đã nhận xe
                        </Button>
                      )}

                      {canCancelOpenOrder(order) && (
                        <Button variant="outline" onClick={() => void handleCancelOrder(order)} disabled={cancelActionLoading}>
                          {cancelActionLoading ? 'Đang hủy...' : 'Hủy đơn'}
                        </Button>
                      )}

                      {order.paymentMethod === 'cash' && order.fundingStatus === 'awaiting_payment' && (
                        <Button variant="ghost" className="cursor-default hover:bg-transparent" disabled>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Thanh toán trực tiếp với người bán
                        </Button>
                      )}

                      {order.status === 'awaiting_buyer_confirmation' && !canBuyerConfirmReceived(order) && (
                        <Button variant="ghost" className="cursor-default hover:bg-transparent" disabled>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Chờ bạn xác nhận đã nhận xe
                        </Button>
                      )}

                      {order.status === 'completed' && (
                        <Button variant="ghost" className="cursor-default hover:bg-transparent" disabled>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Giao dịch đã hoàn tất
                        </Button>
                      )}

                      {order.status === 'cancelled' && (
                        <Button variant="ghost" className="cursor-default hover:bg-transparent" disabled>
                          <XCircle className="mr-2 h-4 w-4" />
                          Đơn hàng đã đóng
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {paymentRequest && (
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row">
                      {paymentRequest.qrCodeUrl && (
                        <div className="w-full max-w-[180px] shrink-0 overflow-hidden rounded-lg border bg-white p-2">
                          <img src={paymentRequest.qrCodeUrl} alt="Mã QR thanh toán" className="h-full w-full object-contain" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-foreground">Hướng dẫn thanh toán</h4>
                          {paymentRequest.mockMode && <Badge variant="secondary">Mock mode</Badge>}
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <p>
                            Số tiền:{' '}
                            <span className="font-medium text-foreground">{formatOrderCurrency(paymentRequest.amount)}</span>
                          </p>
                          <p>
                            Mã chuyển khoản:{' '}
                            <span className="font-medium text-foreground">
                              {paymentRequest.transferContent ?? paymentRequest.gatewayOrderCode ?? 'Không có'}
                            </span>
                          </p>
                          <p>
                            Số tài khoản:{' '}
                            <span className="font-medium text-foreground">
                              {paymentRequest.bankAccountNumber ?? 'Đợi backend trả về'}
                            </span>
                          </p>
                          <p>
                            Chủ tài khoản:{' '}
                            <span className="font-medium text-foreground">
                              {paymentRequest.bankAccountName ?? 'Đợi backend trả về'}
                            </span>
                          </p>
                        </div>

                        {paymentRequest.instructions && (
                          <p className="text-sm text-muted-foreground">{paymentRequest.instructions}</p>
                        )}

                        {paymentRequest.expiresAt && (
                          <p className="text-xs text-muted-foreground">
                            Hạn thanh toán: {formatOrderDate(paymentRequest.expiresAt)}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {paymentRequest.checkoutUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={paymentRequest.checkoutUrl} target="_blank" rel="noreferrer">
                                Mở trang thanh toán
                              </a>
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPaymentRequests((current) => {
                                const next = { ...current }
                                delete next[order.id]
                                return next
                              })
                            }
                          >
                            Ẩn hướng dẫn
                          </Button>

                          <Button variant="ghost" size="sm" onClick={() => void refreshOrdersSilently()}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Kiểm tra lại trạng thái
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <DisputeModal
        isOpen={Boolean(selectedOrderForRefund)}
        onClose={() => {
          setSelectedOrderForRefund(null)
          setRefundError(null)
        }}
        onSubmit={handleSubmitRefund}
        orderId={selectedOrderForRefund?.id ?? ''}
        refundAmount={selectedOrderForRefund?.paidAmount ?? 0}
        isSubmitting={Boolean(selectedOrderForRefund) && actionLoadingKey === `refund:${selectedOrderForRefund?.id}`}
        error={refundError}
      />
    </div>
  )
}
