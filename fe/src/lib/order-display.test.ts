import { describe, expect, it } from 'vitest'
import {
  canBuyerConfirmReceived,
  canBuyerRequestPayment,
  canBuyerRequestRefund,
  canSellerAcceptOrder,
  canSellerCompleteOrder,
  canSellerConfirmCashDeposit,
  getOrderStatusMeta,
  getPaymentMethodLabel,
  getPaymentOptionLabel,
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
    acceptedAt: null,
    paymentDeadline: null,
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
    })

    const statusMeta = getOrderStatusMeta(order)

    expect(statusMeta.label).toBe('Chờ thanh toán')
    expect(canBuyerRequestPayment(order)).toBe(true)
    expect(canSellerConfirmCashDeposit(order)).toBe(false)
  })

  it('allows seller to confirm direct cash payment only for cash orders', () => {
    const order = buildOrder({
      fundingStatus: 'awaiting_payment',
      paymentMethod: 'cash',
      acceptedAt: '2026-03-17T12:30:00Z',
    })

    expect(canSellerConfirmCashDeposit(order)).toBe(true)
    expect(getPaymentMethodLabel(order)).toBe('Tiền mặt')
    expect(getPaymentOptionLabel(order)).toBe('Đặt cọc một phần')
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
})
