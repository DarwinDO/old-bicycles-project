import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BikeDetailPage from './BikeDetailPage'
import type { Product } from '@/types/product'

const {
  getProductByIdMock,
  getAdminProductByIdMock,
  getInspectionByProductMock,
  getWishlistMineMock,
  getSellerReviewsMock,
  getSizeChartByCategoryMock,
  createOrderMock,
  navigateMock,
} = vi.hoisted(() => ({
  getProductByIdMock: vi.fn(),
  getAdminProductByIdMock: vi.fn(),
  getInspectionByProductMock: vi.fn(),
  getWishlistMineMock: vi.fn(),
  getSellerReviewsMock: vi.fn(),
  getSizeChartByCategoryMock: vi.fn(),
  createOrderMock: vi.fn(),
  navigateMock: vi.fn(),
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: 'product-1' }),
    useLocation: () => ({
      pathname: '/market/product-1',
      search: '',
      hash: '',
      state: null,
      key: 'bike-detail-test',
    }),
  }
})

function buildProduct(): Product {
  return {
    id: 'product-1',
    title: 'Trek Domane AL 4',
    description: 'Road bike for testing',
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

describe('BikeDetailPage', () => {
  beforeEach(() => {
    getProductByIdMock.mockReset()
    getAdminProductByIdMock.mockReset()
    getInspectionByProductMock.mockReset()
    getWishlistMineMock.mockReset()
    getSellerReviewsMock.mockReset()
    getSizeChartByCategoryMock.mockReset()
    createOrderMock.mockReset()
    navigateMock.mockReset()

    getProductByIdMock.mockResolvedValue(buildProduct())
    getAdminProductByIdMock.mockResolvedValue(buildProduct())
    getInspectionByProductMock.mockResolvedValue(null)
    getWishlistMineMock.mockResolvedValue([])
    getSellerReviewsMock.mockResolvedValue({ content: [] })
    getSizeChartByCategoryMock.mockResolvedValue(null)
    createOrderMock.mockResolvedValue({ id: 'order-1' })
  })

  it('shows fee preview and blocks partial upfront values below the seller fee threshold', async () => {
    render(
      <MemoryRouter>
        <BikeDetailPage />
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Trek Domane AL 4' })

    fireEvent.click(screen.getByRole('button', { name: 'Tạo yêu cầu mua' }))

    const dialog = await screen.findByRole('dialog')
    const upfrontInput = within(dialog).getByLabelText('Số tiền ứng trước')
    const submitButton = within(dialog).getByRole('button', { name: 'Tạo yêu cầu mua' })

    fireEvent.change(upfrontInput, { target: { value: '100000' } })

    expect(dialog).toHaveTextContent(/Mức ứng trước tối thiểu hiện tại/i)
    expect(dialog).toHaveTextContent(/200\.000/)
    expect(dialog).toHaveTextContent(/chưa đủ cover phần phí seller/i)
    expect(submitButton).toBeDisabled()

    fireEvent.change(upfrontInput, { target: { value: '4000000' } })

    await waitFor(() => {
      expect(dialog).toHaveTextContent(/400\.000/)
      expect(dialog).toHaveTextContent(/4\.200\.000/)
      expect(submitButton).toBeEnabled()
    })
  })
})
