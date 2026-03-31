import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SellerDashboardPage from './SellerDashboardPage'
import type { Order } from '@/types/order'
import type { Product } from '@/types/product'

const { getMineOrdersMock, getMineProductsMock } = vi.hoisted(() => ({
  getMineOrdersMock: vi.fn(),
  getMineProductsMock: vi.fn(),
}))

vi.mock('@/api/orders.api', () => ({
  ordersApi: {
    getMine: getMineOrdersMock,
  },
}))

vi.mock('@/api/products.api', () => ({
  productsApi: {
    getMine: getMineProductsMock,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'seller-1',
      role: 'seller',
    },
  }),
}))

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    title: 'Bianchi Sprint',
    description: 'Demo product',
    price: 20_000_000,
    status: 'active',
    createdAt: '2026-03-31T08:00:00Z',
    images: [],
    isVerified: true,
    lockedForTransaction: false,
    sellerActionLocked: false,
    ...overrides,
  }
}

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    productId: 'product-1',
    productTitle: 'Bianchi Sprint',
    buyerId: 'buyer-1',
    buyerName: 'Buyer Incoming',
    sellerId: 'seller-1',
    sellerName: 'Seller One',
    totalAmount: 10_000_000,
    requiredUpfrontAmount: 2_000_000,
    paidAmount: 0,
    remainingAmount: 2_000_000,
    buyerChargeAmount: 2_000_000,
    sellerNetPayoutAmount: 0,
    paymentOption: 'partial',
    status: 'pending',
    fundingStatus: 'unpaid',
    paymentMethod: 'transfer',
    buyerReviewSubmitted: false,
    createdAt: '2026-03-31T08:00:00Z',
    updatedAt: '2026-03-31T08:00:00Z',
    ...overrides,
  }
}

describe('SellerDashboardPage', () => {
  beforeEach(() => {
    getMineOrdersMock.mockReset()
    getMineProductsMock.mockReset()
  })

  it('renders seller metrics from products and seller-owned orders only', async () => {
    getMineProductsMock.mockResolvedValue({
      content: [
        buildProduct({ id: 'product-1', title: 'Bianchi Sprint', status: 'active', isVerified: true }),
        buildProduct({
          id: 'product-2',
          title: 'Trek Madone',
          status: 'inspected_passed',
          isVerified: true,
        }),
        buildProduct({ id: 'product-3', title: 'Cannondale CAAD', status: 'pending', isVerified: false }),
        buildProduct({ id: 'product-4', title: 'Hidden Listing', status: 'hidden', isVerified: false }),
      ],
    })

    getMineOrdersMock.mockResolvedValue([
      buildOrder(),
      buildOrder({
        id: 'order-2',
        productId: 'product-2',
        productTitle: 'Trek Madone',
        buyerId: 'buyer-2',
        buyerName: 'Buyer Released',
        totalAmount: 10_000_000,
        requiredUpfrontAmount: 10_000_000,
        paidAmount: 10_000_000,
        remainingAmount: 0,
        buyerChargeAmount: 10_000_000,
        sellerNetPayoutAmount: 9_800_000,
        status: 'completed',
        fundingStatus: 'released',
      }),
      buildOrder({
        id: 'order-3',
        productId: 'product-3',
        productTitle: 'Cannondale CAAD',
        buyerId: 'buyer-3',
        buyerName: 'Buyer Pending Payout',
        totalAmount: 12_000_000,
        requiredUpfrontAmount: 12_000_000,
        paidAmount: 12_000_000,
        remainingAmount: 0,
        buyerChargeAmount: 12_000_000,
        sellerNetPayoutAmount: 11_500_000,
        status: 'completed',
        fundingStatus: 'seller_payout_pending',
      }),
      buildOrder({
        id: 'order-4',
        productId: 'product-4',
        productTitle: 'Waiting Payment Bike',
        buyerId: 'buyer-4',
        buyerName: 'Buyer Waiting',
        totalAmount: 6_000_000,
        requiredUpfrontAmount: 2_000_000,
        paidAmount: 0,
        remainingAmount: 2_000_000,
        buyerChargeAmount: 2_000_000,
        sellerNetPayoutAmount: 0,
        status: 'pending',
        fundingStatus: 'awaiting_payment',
      }),
      buildOrder({
        id: 'order-foreign',
        productId: 'product-x',
        productTitle: 'Other Seller Bike',
        sellerId: 'seller-2',
        sellerName: 'Seller Two',
        buyerId: 'buyer-x',
        buyerName: 'Buyer Foreign',
        totalAmount: 99_000_000,
        requiredUpfrontAmount: 99_000_000,
        paidAmount: 99_000_000,
        remainingAmount: 0,
        buyerChargeAmount: 99_000_000,
        sellerNetPayoutAmount: 98_000_000,
        status: 'completed',
        fundingStatus: 'released',
      }),
    ])

    render(
      <MemoryRouter>
        <SellerDashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(getMineProductsMock).toHaveBeenCalledWith(0, 50)
      expect(getMineOrdersMock).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText(/Tổng quan cửa hàng/i)).toBeInTheDocument()
    expect(screen.getByText('Bianchi Sprint')).toBeInTheDocument()
    expect(screen.getByText('Trek Madone')).toBeInTheDocument()
    expect(screen.getByText('Buyer Incoming muốn mua Bianchi Sprint')).toBeInTheDocument()
    expect(screen.queryByText(/Buyer Waiting muốn mua/i)).not.toBeInTheDocument()

    expect(document.body).toHaveTextContent('Yêu cầu cần phản hồi')
    expect(document.body).toHaveTextContent('1')
    expect(document.body).toHaveTextContent('Tin đang bật')
    expect(document.body).toHaveTextContent('2')
    expect(document.body).toHaveTextContent('Đơn hoàn thành')
    expect(document.body).toHaveTextContent('2')
    expect(document.body.textContent).toMatch(/22\.000\.000\s₫/)
    expect(document.body.textContent).toMatch(/9\.800\.000\s₫/)
    expect(document.body.textContent).toMatch(/11\.500\.000\s₫/)
    expect(document.body).toHaveTextContent('1 tin đăng chờ duyệt')
    expect(document.body).toHaveTextContent('1 đơn đang chờ admin chuyển khoản')
    expect(document.body).not.toHaveTextContent('99.000.000')
  })
})
