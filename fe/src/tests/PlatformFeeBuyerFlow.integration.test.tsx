import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BikeDetailPage from '@/pages/BikeDetailPage'
import { BuyerOrdersView } from '@/components/profile/BuyerOrdersView'
import type { Order } from '@/types/order'
import type { PaymentRequestResponse } from '@/types/payment'
import type { Product } from '@/types/product'

interface MockLocationState {
  pathname: string
  search: string
  hash: string
  state: unknown
  key: string
}

const {
  getProductByIdMock,
  getAdminProductByIdMock,
  getInspectionByProductMock,
  getWishlistMineMock,
  getSellerReviewsMock,
  getSizeChartByCategoryMock,
  createOrderMock,
  getMineOrdersMock,
  createPaymentRequestMock,
  getMyProfileMock,
  createRefundMock,
  submitReviewMock,
  navigateMock,
  locationRef,
} = vi.hoisted(() => ({
  getProductByIdMock: vi.fn(),
  getAdminProductByIdMock: vi.fn(),
  getInspectionByProductMock: vi.fn(),
  getWishlistMineMock: vi.fn(),
  getSellerReviewsMock: vi.fn(),
  getSizeChartByCategoryMock: vi.fn(),
  createOrderMock: vi.fn(),
  getMineOrdersMock: vi.fn(),
  createPaymentRequestMock: vi.fn(),
  getMyProfileMock: vi.fn(),
  createRefundMock: vi.fn(),
  submitReviewMock: vi.fn(),
  navigateMock: vi.fn(),
  locationRef: {
    value: {
      pathname: '/market/product-1',
      search: '',
      hash: '',
      state: null,
      key: 'platform-fee-buyer-flow',
    } as MockLocationState,
  },
}))

vi.mock('@/api/products.api', () => ({
  productsApi: {
    getById: getProductByIdMock,
  },
}))

vi.mock('@/api/admin-products.api', () => ({
  adminProductsApi: {
    getById: getAdminProductByIdMock,
  },
}))

vi.mock('@/api/inspections.api', () => ({
  inspectionsApi: {
    getByProduct: getInspectionByProductMock,
  },
}))

vi.mock('@/api/wishlist.api', () => ({
  wishlistApi: {
    getMine: getWishlistMineMock,
  },
}))

vi.mock('@/api/reviews.api', () => ({
  reviewsApi: {
    getSellerReviews: getSellerReviewsMock,
    submit: submitReviewMock,
  },
}))

vi.mock('@/api/reference-data.api', () => ({
  referenceDataApi: {
    getSizeChartByCategory: getSizeChartByCategoryMock,
  },
}))

vi.mock('@/api/orders.api', () => ({
  ordersApi: {
    create: createOrderMock,
    getMine: getMineOrdersMock,
    cancel: vi.fn(),
    confirmReceived: vi.fn(),
  },
}))

vi.mock('@/api/payments.api', () => ({
  paymentsApi: {
    createRequest: createPaymentRequestMock,
  },
}))

vi.mock('@/api/payouts.api', () => ({
  payoutsApi: {
    getMyProfile: getMyProfileMock,
  },
}))

vi.mock('@/api/refunds.api', () => ({
  refundsApi: {
    create: createRefundMock,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: 'buyer-1',
      role: 'buyer',
    },
  }),
}))

vi.mock('@/components/profile/DisputeModal', () => ({
  DisputeModal: ({
    isOpen,
    refundAmount,
    onSubmit,
  }: {
    isOpen: boolean
    refundAmount: number
    onSubmit: (values: { reason: string; evidenceNote?: string }) => Promise<void> | void
  }) =>
    isOpen ? (
      <div>
        <p>RefundAmount:{refundAmount}</p>
        <button onClick={() => void onSubmit({ reason: 'Xe không giống mô tả', evidenceNote: 'Ảnh mở thùng' })}>
          Submit refund
        </button>
      </div>
    ) : null,
}))

vi.mock('@/components/profile/OrderEvidenceDialog', () => ({
  OrderEvidenceDialog: () => null,
}))

vi.mock('@/components/profile/OrderEvidenceSection', () => ({
  OrderEvidenceSection: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('@/components/profile/ReviewOrderDialog', () => ({
  ReviewOrderDialog: () => null,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: 'product-1' }),
    useLocation: () => locationRef.value,
  }
})

function buildProduct(): Product {
  return {
    id: 'product-1',
    title: 'Trek Domane AL 4',
    description: 'Road bike for buyer flow regression',
    price: 20_000_000,
    status: 'active',
    createdAt: '2026-03-25T08:00:00Z',
    seller: {
      id: 'seller-1',
      firstName: 'Road',
      lastName: 'Seller',
    },
    images: [],
    isVerified: true,
    lockedForTransaction: false,
  }
}

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    productId: 'product-1',
    productTitle: 'Trek Domane AL 4',
    buyerId: 'buyer-1',
    buyerName: 'Buyer One',
    sellerId: 'seller-1',
    sellerName: 'Seller One',
    totalAmount: 20_000_000,
    depositAmount: 4_000_000,
    requiredUpfrontAmount: 4_000_000,
    paidAmount: 0,
    remainingAmount: 16_000_000,
    serviceFee: 400_000,
    feeBaseAmount: 20_000_000,
    platformFeeRate: 0.02,
    platformFeeTotal: 400_000,
    buyerFeeAmount: 200_000,
    sellerFeeAmount: 200_000,
    buyerChargeAmount: 4_200_000,
    sellerGrossPayoutAmount: 4_000_000,
    sellerNetPayoutAmount: 3_800_000,
    platformFeeStatus: 'pending',
    platformFeeRecognizedAt: null,
    platformFeeReversedAt: null,
    paymentOption: 'partial',
    status: 'pending',
    fundingStatus: 'awaiting_payment',
    paymentMethod: 'transfer',
    buyerReviewSubmitted: false,
    sellerHandoverEvidence: null,
    buyerReceiptEvidence: null,
    acceptedAt: '2026-03-25T08:05:00Z',
    paymentDeadline: '2099-03-25T10:00:00Z',
    cancelReason: null,
    cancelledAt: null,
    createdAt: '2026-03-25T08:00:00Z',
    updatedAt: '2026-03-25T08:05:00Z',
    ...overrides,
  }
}

function buildPaymentRequest(orderId: string): PaymentRequestResponse {
  return {
    paymentId: 'payment-1',
    orderId,
    gateway: 'sepay',
    phase: 'upfront',
    status: 'pending',
    amount: 4_200_000,
    protectedAmount: 4_000_000,
    buyerFeeAmount: 200_000,
    gatewayOrderCode: 'OB-ORDER-1',
    checkoutUrl: null,
    qrCodeUrl: 'https://example.com/qr.png',
    transferContent: 'OB-ORDER-1',
    bankBin: '970423',
    bankAccountNumber: '00000645722',
    bankAccountName: 'OLD BICYCLE SYSTEM',
    mockMode: true,
    instructions: 'Transfer by VietQR',
    expiresAt: '2099-03-25T10:00:00Z',
  }
}

describe('Platform Fee buyer flow integration', () => {
  let storedOrders: Order[] = []

  beforeEach(() => {
    storedOrders = []

    getProductByIdMock.mockReset()
    getAdminProductByIdMock.mockReset()
    getInspectionByProductMock.mockReset()
    getWishlistMineMock.mockReset()
    getSellerReviewsMock.mockReset()
    getSizeChartByCategoryMock.mockReset()
    createOrderMock.mockReset()
    getMineOrdersMock.mockReset()
    createPaymentRequestMock.mockReset()
    getMyProfileMock.mockReset()
    createRefundMock.mockReset()
    submitReviewMock.mockReset()
    navigateMock.mockReset()

    locationRef.value = {
      pathname: '/market/product-1',
      search: '',
      hash: '',
      state: null,
      key: 'platform-fee-buyer-flow-bike',
    }

    getProductByIdMock.mockResolvedValue(buildProduct())
    getAdminProductByIdMock.mockResolvedValue(buildProduct())
    getInspectionByProductMock.mockResolvedValue(null)
    getWishlistMineMock.mockResolvedValue([])
    getSellerReviewsMock.mockResolvedValue({ content: [] })
    getSizeChartByCategoryMock.mockResolvedValue(null)
    getMyProfileMock.mockResolvedValue(null)
    submitReviewMock.mockResolvedValue(undefined)

    navigateMock.mockImplementation((to: string, options?: { state?: unknown }) => {
      const [pathname, rawSearch = ''] = to.split('?')

      locationRef.value = {
        pathname,
        search: rawSearch ? `?${rawSearch}` : '',
        hash: '',
        state: options?.state ?? null,
        key: `nav-${pathname}-${rawSearch}`,
      }
    })

    createOrderMock.mockImplementation(async (request: { upfrontAmount?: number }) => {
      const createdOrder = buildOrder({
        requiredUpfrontAmount: request.upfrontAmount ?? 4_000_000,
        depositAmount: request.upfrontAmount ?? 4_000_000,
        sellerGrossPayoutAmount: request.upfrontAmount ?? 4_000_000,
        sellerNetPayoutAmount: (request.upfrontAmount ?? 4_000_000) - 200_000,
      })
      storedOrders = [createdOrder]
      return createdOrder
    })

    getMineOrdersMock.mockImplementation(async () => storedOrders.map((order) => ({ ...order })))
    createPaymentRequestMock.mockImplementation(async (orderId: string) => buildPaymentRequest(orderId))
    createRefundMock.mockImplementation(async (orderId: string, request: { amount: number; reason: string; evidenceNote?: string }) => {
      storedOrders = [
        buildOrder({
          id: orderId,
          status: 'deposited',
          fundingStatus: 'refund_pending',
          paidAmount: 4_000_000,
          remainingAmount: 16_000_000,
          updatedAt: '2026-03-25T08:45:00Z',
        }),
      ]

      return {
        id: 'refund-1',
        orderId,
        amount: request.amount,
        reason: request.reason,
        evidenceNote: request.evidenceNote,
        status: 'pending',
        createdAt: '2026-03-25T08:40:00Z',
      }
    })
  })

  it('covers buyer order creation, payment instruction, and refund request across the two main FE pages', async () => {
    const bikePage = render(
      <MemoryRouter>
        <BikeDetailPage />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Trek Domane AL 4' })

    fireEvent.click(screen.getByRole('button', { name: /mua/i }))

    const orderDialog = await screen.findByRole('dialog')
    const upfrontInput = within(orderDialog).getByRole('textbox')

    fireEvent.change(upfrontInput, { target: { value: '4000000' } })

    await waitFor(() => {
      expect(orderDialog).toHaveTextContent(/400\.000/)
      expect(orderDialog).toHaveTextContent(/4\.200\.000/)
    })

    fireEvent.click(within(orderDialog).getByRole('button', { name: /mua/i }))

    await waitFor(() => {
      expect(createOrderMock).toHaveBeenCalledWith({
        productId: 'product-1',
        paymentMethod: 'transfer',
        paymentOption: 'partial',
        upfrontAmount: 4_000_000,
      })
    })

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/profile?tab=orders', {
        state: expect.objectContaining({
          createdOrderId: 'order-1',
        }),
      })
    })

    bikePage.unmount()
    navigateMock.mockClear()

    locationRef.value = {
      pathname: '/profile',
      search: '?tab=orders',
      hash: '',
      state: {
        orderCreatedNotice: 'Đã tạo yêu cầu mua thành công.',
      },
      key: 'platform-fee-buyer-flow-orders-pending',
    }

    const buyerOrdersPending = render(
      <MemoryRouter>
        <BuyerOrdersView />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Đã tạo yêu cầu mua thành công.')).toBeInTheDocument()
    expect(await screen.findByText('Trek Domane AL 4')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /thanh to/i }))

    await waitFor(() => {
      expect(createPaymentRequestMock).toHaveBeenCalledWith('order-1')
    })

    expect(await screen.findByText(/Khoản sàn giữ cho giao dịch:/i)).toBeInTheDocument()
    expect(document.body.textContent).toMatch(/4\.200\.000/)
    expect(document.body.textContent).toMatch(/4\.000\.000/)
    expect(document.body.textContent).toMatch(/200\.000/)

    buyerOrdersPending.unmount()

    storedOrders = [
      buildOrder({
        status: 'deposited',
        fundingStatus: 'held',
        paidAmount: 4_000_000,
        remainingAmount: 16_000_000,
        updatedAt: '2026-03-25T08:30:00Z',
      }),
    ]

    locationRef.value = {
      pathname: '/profile',
      search: '?tab=orders',
      hash: '',
      state: null,
      key: 'platform-fee-buyer-flow-orders-held',
    }

    render(
      <MemoryRouter>
        <BuyerOrdersView />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: /hoàn tiền/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /hoàn tiền/i }))

    expect(await screen.findByText('RefundAmount:4200000')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Submit refund' }))

    await waitFor(() => {
      expect(createRefundMock).toHaveBeenCalledWith('order-1', {
        amount: 4_200_000,
        reason: 'Xe không giống mô tả',
        evidenceNote: 'Ảnh mở thùng',
      })
    })

    await waitFor(() => {
      expect(screen.queryByText(/Đang tải danh sách đơn mua/i)).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /hoàn tiền/i })).toBeDisabled()
  })
})
