import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  })

  it('shows transaction-lock badge while keeping inspection timeline under the product title', async () => {
    getAllMock.mockResolvedValue({
      content: [
        {
          id: 'product-1',
          title: 'Locked Carbon Build',
          description: 'Demo listing',
          price: 45_000_000,
          originalPrice: null,
          condition: 'used',
          status: 'inspected_passed',
          province: 'Ho Chi Minh',
          district: 'District 1',
          frameSize: 'M',
          wheelSize: '700C',
          groupset: 'Shimano 105',
          createdAt: '2026-03-17T00:00:00Z',
          expiresAt: '2026-04-17T00:00:00Z',
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
          lockedForTransaction: true,
          inspection: {
            id: 'inspection-1',
            overallScore: 90,
            passed: true,
            validUntil: '2026-03-20T10:00:00Z',
            createdAt: '2026-03-19T10:00:00Z',
          },
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

    render(<AdminListingsPage />)

    await waitFor(() => {
      expect(getAllMock).toHaveBeenCalledWith({
        page: 0,
        size: 12,
        keyword: undefined,
        status: undefined,
      })
    })

    expect(await screen.findByText('Locked Carbon Build')).toBeInTheDocument()
    expect(screen.getByText('Đang bị khóa bởi giao dịch mở')).toBeInTheDocument()
    expect(screen.getByText(/Kiểm định hết hạn:/i)).toBeInTheDocument()
    expect(screen.getByText(/Hạn tin:/i)).toBeInTheDocument()
    expect(screen.queryByText(/Buyer không còn thấy tin này ngoài marketplace/i)).not.toBeInTheDocument()

    const actionTrigger = document.querySelector('button[aria-haspopup="menu"]')
    expect(actionTrigger).not.toBeNull()

    fireEvent.pointerDown(actionTrigger as HTMLButtonElement)
    expect(screen.queryByText('Đưa qua kiểm định')).not.toBeInTheDocument()
  })

  it('still allows routing to inspection for an expired inspection when the listing is not transaction-locked', async () => {
    getAllMock.mockResolvedValue({
      content: [
        {
          id: 'product-2',
          title: 'Carbon Race Build',
          description: 'Demo listing',
          price: 45_000_000,
          originalPrice: null,
          condition: 'used',
          status: 'inspected_passed',
          province: 'Ho Chi Minh',
          district: 'District 1',
          frameSize: 'M',
          wheelSize: '700C',
          groupset: 'Shimano 105',
          createdAt: '2026-03-17T00:00:00Z',
          expiresAt: '2026-04-17T00:00:00Z',
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
          inspection: {
            id: 'inspection-2',
            overallScore: 90,
            passed: true,
            validUntil: '2026-03-20T10:00:00Z',
            createdAt: '2026-03-19T10:00:00Z',
          },
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

    render(<AdminListingsPage />)

    expect(await screen.findByText('Carbon Race Build')).toBeInTheDocument()
    expect(screen.getByText('Hết hạn kiểm định')).toBeInTheDocument()

    const actionTrigger = document.querySelector('button[aria-haspopup="menu"]')
    expect(actionTrigger).not.toBeNull()

    fireEvent.pointerDown(actionTrigger as HTMLButtonElement)
    expect(await screen.findByText('Đưa qua kiểm định')).toBeInTheDocument()
  })
})
