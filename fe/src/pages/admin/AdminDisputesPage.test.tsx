import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AdminDisputesPage from './AdminDisputesPage'

const { getAllMock, reviewMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  reviewMock: vi.fn(),
}))

vi.mock('@/api/refunds.api', () => ({
  refundsApi: {
    getAll: getAllMock,
    review: reviewMock,
  },
}))

function buildPageResult() {
  return {
    content: [
      {
        id: 'refund-1',
        orderId: 'order-1',
        paymentId: 'payment-1',
        requesterId: 'buyer-1',
        requesterName: 'Nguyen Buyer',
        buyerId: 'buyer-1',
        buyerName: 'Nguyen Buyer',
        sellerId: 'seller-1',
        sellerName: 'Seller Road',
        productId: 'product-1',
        productTitle: 'Trek Domane SL6',
        hasInspection: true,
        amount: 2_000_000,
        reason: 'Frame has a crack',
        evidenceNote: 'Full image evidence',
        status: 'pending' as const,
        adminNote: null,
        refundReference: null,
        reviewedBy: null,
        reviewedByName: null,
        reviewedAt: null,
        processedAt: null,
        createdAt: '2026-03-18T09:00:00Z',
        orderStatus: 'deposited' as const,
        fundingStatus: 'refund_pending' as const,
        paymentMethod: 'transfer' as const,
      },
    ],
    pageable: {
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      paged: true,
      unpaged: false,
      sort: {
        empty: false,
        sorted: true,
        unsorted: false,
      },
    },
    totalPages: 1,
    totalElements: 1,
    last: true,
    size: 10,
    number: 0,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false,
    },
    first: true,
    numberOfElements: 1,
    empty: false,
  }
}

describe('AdminDisputesPage', () => {
  beforeEach(() => {
    getAllMock.mockReset()
    reviewMock.mockReset()
  })

  it('shows loading skeleton rows while refund data is still pending', async () => {
    getAllMock.mockImplementation(() => new Promise(() => {}))

    const { container } = render(<AdminDisputesPage />)

    await waitFor(() => {
      expect(getAllMock).toHaveBeenCalledWith({
        keyword: undefined,
        status: undefined,
        page: 0,
        size: 10,
      })
    })

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    expect(screen.queryByText('Trek Domane SL6')).not.toBeInTheDocument()
  })

  it('renders refund rows after the API resolves', async () => {
    getAllMock.mockResolvedValue(buildPageResult())

    render(<AdminDisputesPage />)

    await waitFor(() => {
      expect(getAllMock).toHaveBeenCalledWith({
        keyword: undefined,
        status: undefined,
        page: 0,
        size: 10,
      })
    })

    expect(await screen.findByText('Trek Domane SL6')).toBeInTheDocument()
    expect(screen.getByText('Nguyen Buyer')).toBeInTheDocument()
    expect(screen.getByText('Seller Road')).toBeInTheDocument()
  })
})
