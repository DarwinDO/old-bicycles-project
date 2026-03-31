import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminOrdersPage from './AdminOrdersPage'

const { getMineMock } = vi.hoisted(() => ({
  getMineMock: vi.fn(),
}))

vi.mock('@/api/orders.api', () => ({
  ordersApi: {
    getMine: getMineMock,
  },
}))

function buildOrder(overrides: Partial<import('@/types/order').Order> = {}): import('@/types/order').Order {
  return {
    id: 'order-1',
    productId: 'product-1',
    productTitle: 'Pinarello Dogma F',
    buyerId: 'buyer-1',
    buyerName: 'Buyer One',
    sellerId: 'seller-1',
    sellerName: 'Seller One',
    totalAmount: 5_000_000,
    requiredUpfrontAmount: 2_500_000,
    paidAmount: 0,
    remainingAmount: 2_500_000,
    buyerChargeAmount: 2_500_000,
    sellerNetPayoutAmount: 0,
    paymentOption: 'full',
    status: 'pending',
    fundingStatus: 'awaiting_payment',
    paymentMethod: 'transfer',
    buyerReviewSubmitted: false,
    createdAt: '2026-03-31T08:00:00Z',
    updatedAt: '2026-03-31T08:00:00Z',
    ...overrides,
  }
}

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    getMineMock.mockReset()
  })

  it('renders summary cards and order rows from admin order data', async () => {
    getMineMock.mockResolvedValue([
      buildOrder(),
      buildOrder({
        id: 'order-2',
        productId: 'product-2',
        productTitle: 'Trek Domane SL',
        buyerId: 'buyer-2',
        buyerName: 'Buyer Two',
        sellerId: 'seller-2',
        sellerName: 'Seller Two',
        totalAmount: 12_000_000,
        requiredUpfrontAmount: 12_000_000,
        paidAmount: 12_000_000,
        remainingAmount: 0,
        buyerChargeAmount: 12_000_000,
        sellerNetPayoutAmount: 11_400_000,
        status: 'completed',
        fundingStatus: 'seller_payout_pending',
      }),
      buildOrder({
        id: 'order-3',
        productId: 'product-3',
        productTitle: 'Giant Defy Advanced',
        buyerId: 'buyer-3',
        buyerName: 'Buyer Three',
        sellerId: 'seller-3',
        sellerName: 'Seller Three',
        totalAmount: 8_000_000,
        requiredUpfrontAmount: 8_000_000,
        paidAmount: 8_000_000,
        remainingAmount: 0,
        buyerChargeAmount: 8_000_000,
        sellerNetPayoutAmount: 7_600_000,
        status: 'completed',
        fundingStatus: 'released',
      }),
    ])

    render(
      <MemoryRouter>
        <AdminOrdersPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(getMineMock).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText('Pinarello Dogma F')).toBeInTheDocument()
    expect(screen.getByText('Trek Domane SL')).toBeInTheDocument()
    expect(screen.getByText('Giant Defy Advanced')).toBeInTheDocument()
    expect(screen.getByText('Buyer One')).toBeInTheDocument()
    expect(screen.getByText('Seller Two')).toBeInTheDocument()

    expect(document.body).toHaveTextContent('Đơn đang mở')
    expect(document.body).toHaveTextContent('1')
    expect(document.body).toHaveTextContent('Đơn hoàn tất')
    expect(document.body).toHaveTextContent('2')
    expect(document.body.textContent).toMatch(/11\.400\.000\s₫/)
    expect(document.body).toHaveTextContent('Buyer trả hiện tại:')
    expect(document.body).toHaveTextContent('Seller net:')
  })

  it('filters orders by search keyword', async () => {
    getMineMock.mockResolvedValue([
      buildOrder({ id: 'order-1', productTitle: 'Pinarello Dogma F' }),
      buildOrder({
        id: 'order-2',
        productId: 'product-2',
        productTitle: 'Trek Domane SL',
        buyerId: 'buyer-2',
        buyerName: 'Buyer Two',
        sellerId: 'seller-2',
        sellerName: 'Seller Two',
      }),
    ])

    render(
      <MemoryRouter>
        <AdminOrdersPage />
      </MemoryRouter>,
    )

    await screen.findByText('Pinarello Dogma F')

    fireEvent.change(screen.getByPlaceholderText(/Tìm theo mã đơn/i), {
      target: { value: 'trek' },
    })

    await waitFor(() => {
      expect(screen.queryByText('Pinarello Dogma F')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Trek Domane SL')).toBeInTheDocument()
  })
})
