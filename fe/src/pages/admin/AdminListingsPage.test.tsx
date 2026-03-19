import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AdminListingsPage from './AdminListingsPage'

const { getAllMock, approveMock, routeToInspectionMock, hideMock, navigateMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  approveMock: vi.fn(),
  routeToInspectionMock: vi.fn(),
  hideMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('@/api/admin-products.api', () => ({
  adminProductsApi: {
    getAll: getAllMock,
    approve: approveMock,
    routeToInspection: routeToInspectionMock,
    hide: hideMock,
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('AdminListingsPage', () => {
  beforeEach(() => {
    getAllMock.mockReset()
    approveMock.mockReset()
    routeToInspectionMock.mockReset()
    hideMock.mockReset()
    navigateMock.mockReset()

    getAllMock.mockResolvedValue({
      content: [
        {
          id: 'product-1',
          title: 'Carbon Race Build',
          description: 'Demo listing',
          price: 45000000,
          originalPrice: null,
          condition: 'used',
          status: 'pending',
          province: 'Ho Chi Minh',
          district: 'District 1',
          frameSize: 'M',
          wheelSize: '700C',
          groupset: 'Shimano 105',
          createdAt: '2026-03-17T00:00:00Z',
          expiresAt: null,
          seller: {
            id: 'seller-1',
            firstName: 'Bao',
            lastName: 'Tran',
            avatarUrl: null,
            phone: '0909000000',
          },
          brandName: 'Giant',
          categoryName: 'Road Bike',
          brakeTypeName: 'Disc',
          frameMaterialName: 'Carbon',
          images: [],
          isVerified: false,
          lockedForTransaction: false,
          inspection: null,
        },
      ],
      pageable: {
        pageNumber: 0,
        pageSize: 12,
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
      size: 12,
      number: 0,
      sort: {
        empty: false,
        sorted: true,
        unsorted: false,
      },
      first: true,
      numberOfElements: 1,
      empty: false,
    })
  })

  it('loads admin listings from the API and renders product rows', async () => {
    render(<AdminListingsPage />)

    await waitFor(() => {
      expect(getAllMock).toHaveBeenCalledWith({
        page: 0,
        size: 12,
        keyword: undefined,
        status: undefined,
      })
    })

    expect(await screen.findByText('Carbon Race Build')).toBeInTheDocument()
    expect(screen.getByText('Road Bike')).toBeInTheDocument()
    expect(screen.getByText('Bao Tran')).toBeInTheDocument()
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
  })
})
