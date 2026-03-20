import type { Order } from '@/types/order'

export type OrderTone = 'muted' | 'info' | 'warning' | 'success' | 'danger'

interface OrderStatusMeta {
  label: string
  helperText: string
  tone: OrderTone
}

const toneClassMap: Record<OrderTone, string> = {
  muted: 'text-muted-foreground',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-orange-600 dark:text-orange-400',
  success: 'text-green-600 dark:text-green-400',
  danger: 'text-red-600 dark:text-red-400',
}

export function formatOrderCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function getOrderToneClass(tone: OrderTone) {
  return toneClassMap[tone]
}

export function getPaymentMethodLabel(order: Order) {
  return order.paymentMethod === 'cash'
    ? 'Tiền mặt'
    : order.paymentMethod === 'transfer'
      ? 'Chuyển khoản'
      : 'Online'
}

export function getPaymentOptionLabel(order: Order) {
  return order.paymentOption === 'full' ? 'Thanh toán toàn bộ' : 'Đặt cọc một phần'
}

export function getOrderStatusMeta(order: Order): OrderStatusMeta {
  if (order.status === 'completed' && order.fundingStatus === 'seller_payout_pending') {
    return {
      label: 'Chờ giải ngân cho người bán',
      helperText:
        'Người mua đã xác nhận nhận xe. Hệ thống đang chờ admin chuyển khoản thủ công tiền cọc cho người bán. Nếu người bán chưa khai tài khoản nhận tiền, họ cần cập nhật payout profile.',
      tone: 'warning',
    }
  }

  if (order.status === 'completed') {
    return {
      label: 'Hoàn tất',
      helperText: 'Giao dịch đã hoàn tất và tiền cọc đã được giải ngân cho người bán.',
      tone: 'success',
    }
  }

  if (order.status === 'awaiting_buyer_confirmation' && order.fundingStatus === 'held') {
    return {
      label: 'Chờ người mua xác nhận',
      helperText: 'Người bán đã báo giao xe. Người mua cần xác nhận đã nhận xe để hệ thống chuyển sang bước giải ngân.',
      tone: 'warning',
    }
  }

  if (
    (order.status === 'deposited' || order.status === 'awaiting_buyer_confirmation') &&
    order.fundingStatus === 'refund_pending_transfer'
  ) {
    return {
      label: 'Chờ chuyển khoản hoàn tiền',
      helperText:
        'Admin đã duyệt yêu cầu hoàn tiền. Hệ thống đang chờ chuyển khoản thủ công lại cho người mua. Nếu chưa khai tài khoản nhận hoàn tiền, hãy cập nhật payout profile.',
      tone: 'warning',
    }
  }

  if (order.status === 'cancelled' && order.fundingStatus === 'refund_pending') {
    return {
      label: 'Đang chờ hoàn tiền',
      helperText: 'Admin đang xem xét yêu cầu hoàn tiền của đơn hàng này.',
      tone: 'warning',
    }
  }

  if (order.status === 'cancelled' && order.fundingStatus === 'refunded') {
    return {
      label: 'Đã hoàn tiền',
      helperText: 'Khoản đặt cọc đã được hoàn lại và đơn hàng đã đóng.',
      tone: 'success',
    }
  }

  if (order.status === 'cancelled') {
    return {
      label: 'Đã hủy',
      helperText: 'Đơn hàng đã bị hủy trước khi hoàn tất.',
      tone: 'danger',
    }
  }

  if (order.status === 'deposited' && order.fundingStatus === 'held') {
    return {
      label: 'Đã đặt cọc',
      helperText: 'Hệ thống đã giữ tiền đặt cọc và chờ người bán hoàn tất giao dịch.',
      tone: 'info',
    }
  }

  if (order.status === 'pending' && order.fundingStatus === 'awaiting_payment') {
    return {
      label: order.paymentMethod === 'cash' ? 'Chờ thanh toán trực tiếp' : 'Chờ thanh toán',
      helperText:
        order.paymentMethod === 'cash'
          ? 'Người bán đã duyệt đơn, hai bên cần thanh toán trực tiếp để tiếp tục.'
          : 'Người bán đã duyệt đơn, người mua cần hoàn tất khoản thanh toán ứng trước.',
      tone: 'warning',
    }
  }

  if (order.status === 'pending' && order.fundingStatus === 'unpaid') {
    return {
      label: 'Chờ người bán xác nhận',
      helperText: 'Đơn hàng đã được tạo nhưng người bán chưa chấp nhận.',
      tone: 'muted',
    }
  }

  return {
    label: 'Đang xử lý',
    helperText: 'Đơn hàng đang ở trạng thái trung gian.',
    tone: 'muted',
  }
}

export function canSellerAcceptOrder(order: Order) {
  return order.status === 'pending' && order.fundingStatus === 'unpaid'
}

export function canSellerConfirmCashDeposit(order: Order) {
  return order.status === 'pending' && order.fundingStatus === 'awaiting_payment' && order.paymentMethod === 'cash'
}

export function canSellerCompleteOrder(order: Order) {
  return order.status === 'deposited' && order.fundingStatus === 'held'
}

export function canBuyerConfirmReceived(order: Order) {
  return order.status === 'awaiting_buyer_confirmation' && order.fundingStatus === 'held'
}

export function canCancelOpenOrder(order: Order) {
  return order.status === 'pending' && (order.fundingStatus === 'unpaid' || order.fundingStatus === 'awaiting_payment')
}

export function canBuyerRequestPayment(order: Order) {
  return order.status === 'pending' && order.fundingStatus === 'awaiting_payment' && order.paymentMethod !== 'cash'
}

export function canBuyerRequestRefund(order: Order) {
  return (
    (order.status === 'deposited' || order.status === 'awaiting_buyer_confirmation') &&
    order.fundingStatus === 'held' &&
    order.paidAmount > 0
  )
}
