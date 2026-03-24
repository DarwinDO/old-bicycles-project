import { describe, expect, it } from 'vitest'
import {
  canBuyerConfirmReceived,
  canBuyerRequestPayment,
  canBuyerRequestRefund,
  canBuyerSubmitReview,
  canCancelOpenOrder,
  canSellerAcceptOrder,
  canSellerCompleteOrder,
  canSellerConfirmCashDeposit,
  getOrderStatusMeta,
  getPaymentCountdownText,
  getPaymentMethodLabel,
  getPaymentOptionLabel,
  isPaymentDeadlineExpired,
} from '@/lib/order-display'
import type { Order } from '@/types/order'

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    productId: 'product-1',
    productTitle: 'Giant Defy',
    buyerId: 'buyer-1',
    buyerName: 'Buyer One',
    sellerId: 'seller-1',
    sellerName: 'Seller One',
    totalAmount: 30000000,
    depositAmount: 3000000,
    requiredUpfrontAmount: 3000000,
    paidAmount: 0,
    remainingAmount: 30000000,
    serviceFee: 0,
    paymentOption: 'partial',
    status: 'pending',
    fundingStatus: 'unpaid',
    paymentMethod: 'transfer',
    buyerReviewSubmitted: false,
    sellerHandoverEvidence: null,
    buyerReceiptEvidence: null,
    acceptedAt: null,
    paymentDeadline: null,
    cancelReason: null,
    cancelledAt: null,
    createdAt: '2026-03-17T12:00:00Z',
    updatedAt: '2026-03-17T12:00:00Z',
    ...overrides,
  }
}

describe('order-display', () => {
  it('maps pending unpaid orders to waiting for seller confirmation', () => {
    const order = buildOrder()
    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Chờ người bán xác nhận')
    expect(canSellerAcceptOrder(order)).toBe(true)
    expect(canBuyerRequestPayment(order)).toBe(false)
  })

  it('allows buyer payment after seller acceptance', () => {
    const order = buildOrder({
      fundingStatus: 'awaiting_payment',
      paymentMethod: 'transfer',
      acceptedAt: '2026-03-17T12:30:00Z',
      paymentDeadline: '2026-03-17T14:00:00Z',
    })

    const statusMeta = getOrderStatusMeta(order, new Date('2026-03-17T13:00:00Z').getTime())

    expect(statusMeta.label).toBe('Chờ thanh toán')
    expect(canBuyerRequestPayment(order, new Date('2026-03-17T13:00:00Z').getTime())).toBe(true)
    expect(canSellerConfirmCashDeposit(order)).toBe(false)
  })

  it('allows seller to confirm direct cash payment only for cash orders', () => {
    const order = buildOrder({
      fundingStatus: 'awaiting_payment',
      paymentMethod: 'cash',
      acceptedAt: '2026-03-17T12:30:00Z',
      paymentDeadline: '2026-03-17T14:00:00Z',
    })

    expect(canSellerConfirmCashDeposit(order, new Date('2026-03-17T13:00:00Z').getTime())).toBe(true)
    expect(getPaymentMethodLabel(order)).toBe('Tiền mặt')
    expect(getPaymentOptionLabel(order)).toBe('Đặt cọc một phần')
  })

  it('shows expired payment state before scheduler sync completes', () => {
    const nowMs = new Date('2026-03-17T15:00:00Z').getTime()
    const order = buildOrder({
      fundingStatus: 'awaiting_payment',
      paymentDeadline: '2026-03-17T14:00:00Z',
    })

    const statusMeta = getOrderStatusMeta(order, nowMs)

    expect(statusMeta.label).toBe('Đã hết hạn thanh toán')
    expect(isPaymentDeadlineExpired(order, nowMs)).toBe(true)
    expect(canBuyerRequestPayment(order, nowMs)).toBe(false)
    expect(canSellerConfirmCashDeposit({ ...order, paymentMethod: 'cash' }, nowMs)).toBe(false)
    expect(canCancelOpenOrder(order, nowMs)).toBe(false)
  })

  it('formats payment countdown text', () => {
    const nowMs = new Date('2026-03-17T13:00:00Z').getTime()
    expect(getPaymentCountdownText('2026-03-17T14:30:00Z', nowMs)).toBe('Còn 1 giờ 30 phút')
    expect(getPaymentCountdownText('2026-03-17T12:59:00Z', nowMs)).toBe('Đã quá hạn thanh toán')
  })

  it('lets seller report delivery and lets buyer refund while money is held', () => {
    const order = buildOrder({
      status: 'deposited',
      fundingStatus: 'held',
      paidAmount: 3000000,
      remainingAmount: 27000000,
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Đã đặt cọc')
    expect(canBuyerRequestRefund(order)).toBe(true)
    expect(canSellerCompleteOrder(order)).toBe(true)
  })

  it('shows waiting for buyer confirmation after seller reports delivery', () => {
    const order = buildOrder({
      status: 'awaiting_buyer_confirmation',
      fundingStatus: 'held',
      paidAmount: 3000000,
      remainingAmount: 27000000,
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Chờ người mua xác nhận')
    expect(canBuyerConfirmReceived(order)).toBe(true)
    expect(canBuyerRequestRefund(order)).toBe(true)
  })

  it('shows refund pending while admin reviews a refund requested after handover', () => {
    const order = buildOrder({
      status: 'awaiting_buyer_confirmation',
      fundingStatus: 'refund_pending',
      paidAmount: 3000000,
      remainingAmount: 27000000,
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Chờ admin duyệt hoàn tiền')
    expect(statusMeta.helperText).toContain('admin review')
    expect(canBuyerRequestRefund(order)).toBe(false)
    expect(canBuyerConfirmReceived(order)).toBe(false)
  })

  it('shows seller payout pending after buyer confirms receipt', () => {
    const order = buildOrder({
      status: 'completed',
      fundingStatus: 'seller_payout_pending',
      paidAmount: 30000000,
      remainingAmount: 0,
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Chờ giải ngân cho người bán')
    expect(statusMeta.helperText).toContain('payout profile')
    expect(canBuyerSubmitReview(order)).toBe(true)
  })

  it('shows refund pending transfer after admin approves refund', () => {
    const order = buildOrder({
      status: 'deposited',
      fundingStatus: 'refund_pending_transfer',
      paidAmount: 3000000,
      remainingAmount: 27000000,
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Chờ chuyển khoản hoàn tiền')
    expect(canBuyerRequestRefund(order)).toBe(false)
  })

  it('maps late payment after cancellation to manual refund transfer state', () => {
    const order = buildOrder({
      status: 'cancelled',
      fundingStatus: 'refund_pending_transfer',
      cancelReason: 'payment_expired',
      cancelledAt: '2026-03-17T14:05:00Z',
      paidAmount: 3000000,
      remainingAmount: 27000000,
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Chờ chuyển khoản hoàn tiền')
    expect(statusMeta.helperText).toContain('thanh toán sau khi đơn bị hủy')
  })

  it('maps cancelled expired orders to payment expired state', () => {
    const order = buildOrder({
      status: 'cancelled',
      fundingStatus: 'unpaid',
      cancelReason: 'payment_expired',
      cancelledAt: '2026-03-17T14:05:00Z',
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Đã hết hạn thanh toán')
    expect(statusMeta.helperText).toContain('đã tự hủy')
  })

  it('maps refunded cancelled orders to refunded state', () => {
    const order = buildOrder({
      status: 'cancelled',
      fundingStatus: 'refunded',
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Đã hoàn tiền')
    expect(canBuyerRequestRefund(order)).toBe(false)
    expect(canSellerCompleteOrder(order)).toBe(false)
  })

  it('hides the review action after the buyer already reviewed the order', () => {
    const order = buildOrder({
      status: 'completed',
      fundingStatus: 'released',
      paidAmount: 30000000,
      remainingAmount: 0,
      buyerReviewSubmitted: true,
    })

    expect(canBuyerSubmitReview(order)).toBe(false)
  })
})
