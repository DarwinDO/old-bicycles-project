import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import InspectionRequestsPage from './InspectionRequestsPage'

const { getRequestsMock } = vi.hoisted(() => ({
  getRequestsMock: vi.fn(),
}))

vi.mock('@/api/inspections.api', () => ({
  inspectionsApi: {
    getRequests: getRequestsMock,
  },
}))

describe('InspectionRequestsPage', () => {
  it('renders inspection request cards from the API', async () => {
    getRequestsMock.mockResolvedValueOnce({
      content: [
        {
          inspectionId: 'inspection-1',
          productId: 'product-1',
          productTitle: 'Specialized Allez',
          productPrice: 18000000,
          sellerId: 'seller-1',
          sellerName: 'Minh Le',
          sellerPhone: '0909123456',
          province: 'Hồ Chí Minh',
          requestedAt: '2026-03-18T08:00:00Z',
        },
      ],
      pageable: {
        pageNumber: 0,
        pageSize: 8,
        offset: 0,
        paged: true,
        unpaged: false,
        sort: { empty: false, sorted: true, unsorted: false },
      },
      totalPages: 1,
      totalElements: 1,
      last: true,
      size: 8,
      number: 0,
      sort: { empty: false, sorted: true, unsorted: false },
      first: true,
      numberOfElements: 1,
      empty: false,
    })

    render(
      <MemoryRouter>
        <InspectionRequestsPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(getRequestsMock).toHaveBeenCalledWith({
        keyword: undefined,
        page: 0,
        size: 8,
      })
    })

    expect(await screen.findByText('Specialized Allez')).toBeInTheDocument()
    expect(screen.getByText('Người bán: Minh Le · 0909123456')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Bắt đầu kiểm định' })).toHaveAttribute(
      'href',
      '/inspector/inspect/product-1',
    )
  })
})
