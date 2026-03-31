import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminPayoutsPage from './AdminPayoutsPage'

const { getAdminPayoutsMock, completeAdminPayoutMock, remindProfileRequiredPayoutMock } = vi.hoisted(() => ({
  getAdminPayoutsMock: vi.fn(),
  completeAdminPayoutMock: vi.fn(),
  remindProfileRequiredPayoutMock: vi.fn(),
}))

vi.mock('@/api/payouts.api', () => ({
  payoutsApi: {
    getAdminPayouts: getAdminPayoutsMock,
    completeAdminPayout: completeAdminPayoutMock,
    remindProfileRequiredPayout: remindProfileRequiredPayoutMock,
  },
}))

function buildPageResult(status: 'pending_transfer' | 'profile_required' = 'pending_transfer') {
  return {
    content: [
      {
        id: 'payout-1',
        type: 'refund' as const,
        status,
        provider: 'vietqr_manual' as const,
        amount: 2_000,
        grossAmount: 2_000,
        feeDeductionAmount: 0,
        netAmount: 2_000,
        recipientId: 'buyer-1',
        recipientName: 'Nguyen Buyer',
        bankCode: 'TPBank',
        bankBin: '970423',
        accountNumber: '00000645722',
        accountName: 'NGUYEN HOANG VIET DO',
        transferContent: 'REFUND-OB-0001',
        qrCodeUrl: status === 'pending_transfer' ? 'https://img.vietqr.io/image/970423-00000645722-compact2.png' : null,
        bankReference: null,
        adminNote: null,
        orderId: 'order-1',
        orderStatus: 'cancelled' as const,
        fundingStatus: 'refund_pending_transfer' as const,
        refundRequestId: 'refund-1',
        productId: 'product-1',
        productTitle: 'Trek Domane AL 4',
        buyerId: 'buyer-1',
        buyerName: 'Nguyen Buyer',
        sellerId: 'seller-1',
        sellerName: 'Road Seller',
        completedById: null,
        completedByName: null,
        completedAt: null,
        createdAt: '2026-03-19T08:00:00Z',
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

describe('AdminPayoutsPage', () => {
  beforeEach(() => {
    getAdminPayoutsMock.mockReset()
    completeAdminPayoutMock.mockReset()
    remindProfileRequiredPayoutMock.mockReset()
  })

  it('loads payouts from the API and renders rows', async () => {
    getAdminPayoutsMock.mockResolvedValue(buildPageResult())

    render(<AdminPayoutsPage />)

    await waitFor(() => {
      expect(getAdminPayoutsMock).toHaveBeenCalledWith({
        keyword: undefined,
        type: undefined,
        status: undefined,
        page: 0,
        size: 10,
      })
    })

    expect(await screen.findByText('Nguyen Buyer')).toBeInTheDocument()
    expect(screen.getByText('Trek Domane AL 4')).toBeInTheDocument()
    expect(screen.getByText('Hoàn tiền buyer')).toBeInTheDocument()
    expect(screen.getByText('Chờ chuyển khoản')).toBeInTheDocument()
    expect(document.body).toHaveTextContent('Tổng số tiền:')
    expect(document.body.textContent).toMatch(/2\.000\s₫/)
    expect(document.body).toHaveTextContent('Khoản phí khấu trừ:')
    expect(document.body.textContent).toMatch(/0\s₫/)
  })

  it('allows admin to remind payout recipients when profile is missing', async () => {
    getAdminPayoutsMock.mockResolvedValue(buildPageResult('profile_required'))
    remindProfileRequiredPayoutMock.mockResolvedValue({
      ...buildPageResult('profile_required').content[0],
    })

    render(<AdminPayoutsPage />)

    const recipient = await screen.findByText('Nguyen Buyer')
    const row = recipient.closest('tr')
    expect(row).not.toBeNull()

    const rowButtons = within(row as HTMLElement).getAllByRole('button')
    fireEvent.pointerDown(rowButtons[0])

    const remindButton = await screen.findByText('Nhắc cập nhật payout profile')
    fireEvent.click(remindButton)

    await waitFor(() => {
      expect(remindProfileRequiredPayoutMock).toHaveBeenCalledWith('payout-1')
    })

    expect(await screen.findByText('Đã nhắc Nguyen Buyer cập nhật payout profile.')).toBeInTheDocument()
  })
})
