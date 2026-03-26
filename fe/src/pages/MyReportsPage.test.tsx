import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MyReportsPage from './MyReportsPage'

const { getMineMock } = vi.hoisted(() => ({
  getMineMock: vi.fn(),
}))

vi.mock('@/api/reports.api', () => ({
  reportsApi: {
    getMine: getMineMock,
  },
}))

function buildPageResult() {
  return {
    content: [
      {
        id: 'report-1',
        reporterId: 'buyer-1',
        reporterName: 'Nguyen Buyer',
        targetId: 'product-1',
        targetType: 'PRODUCT',
        reason: 'fake' as const,
        description: 'Xe đăng ảnh không đúng thực tế',
        evidenceFiles: [
          {
            id: 'file-1',
            fileUrl: 'https://cdn.example.com/report-proof.jpg',
            fileName: 'report-proof.jpg',
            contentType: 'image/jpeg',
            sortOrder: 0,
          },
        ],
        status: 'pending' as const,
        adminNote: 'Đã tiếp nhận báo cáo',
        processedById: null,
        processedByName: null,
        createdAt: '2026-03-26T08:00:00Z',
        processedAt: null,
      },
    ],
    totalPages: 1,
    totalElements: 1,
    first: true,
    last: true,
    size: 10,
    number: 0,
    sort: { empty: false, sorted: true, unsorted: false },
    pageable: {
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      paged: true,
      unpaged: false,
      sort: { empty: false, sorted: true, unsorted: false },
    },
    numberOfElements: 1,
    empty: false,
  }
}

describe('MyReportsPage', () => {
  beforeEach(() => {
    getMineMock.mockReset()
    getMineMock.mockResolvedValue(buildPageResult())
  })

  it('loads my reports and renders evidence images for the reporter', async () => {
    render(<MyReportsPage />)

    await waitFor(() => {
      expect(getMineMock).toHaveBeenCalledWith(0, 10)
    })

    expect(await screen.findByText('Báo cáo của tôi')).toBeInTheDocument()
    expect(screen.getByText('Ảnh bạn đã gửi')).toBeInTheDocument()
    expect(screen.getByText('report-proof.jpg')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /report-proof\.jpg/i })).toHaveAttribute(
      'href',
      'https://cdn.example.com/report-proof.jpg',
    )
    expect(screen.getByText(/Đã tiếp nhận báo cáo/)).toBeInTheDocument()
  })
})
