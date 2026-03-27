import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminReportsPage from './AdminReportsPage'

const { getAdminReportsMock, processMock } = vi.hoisted(() => ({
  getAdminReportsMock: vi.fn(),
  processMock: vi.fn(),
}))

vi.mock('@/api/reports.api', () => ({
  reportsApi: {
    getAdminReports: getAdminReportsMock,
    process: processMock,
  },
}))

function buildPageResult(status: 'pending' | 'investigating' = 'pending') {
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
        status,
        adminNote: null,
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

describe('AdminReportsPage', () => {
  beforeEach(() => {
    getAdminReportsMock.mockReset()
    processMock.mockReset()
    getAdminReportsMock.mockResolvedValue(buildPageResult())
  })

  it('loads admin reports with the current filters', async () => {
    render(<AdminReportsPage />)

    await waitFor(() => {
      expect(getAdminReportsMock).toHaveBeenCalledWith({
        status: undefined,
        targetType: undefined,
        page: 0,
        size: 10,
      })
    })
  })

  it('renders evidence files inside the detail dialog', async () => {
    render(<AdminReportsPage />)

    const reporter = await screen.findByText('Nguyen Buyer')
    const row = reporter.closest('tr')
    expect(row).not.toBeNull()

    const rowButtons = within(row as HTMLElement).getAllByRole('button')
    fireEvent.pointerDown(rowButtons[0])

    fireEvent.click(await screen.findByText('Xem chi tiết'))

    expect(await screen.findByText('Ảnh bằng chứng người dùng gửi kèm')).toBeInTheDocument()
    expect(screen.getByText('report-proof.jpg')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /report-proof\.jpg/i })).toHaveAttribute(
      'href',
      'https://cdn.example.com/report-proof.jpg',
    )
  })

  it('lets admin close an investigating report by dismissing it', async () => {
    getAdminReportsMock.mockResolvedValue(buildPageResult('investigating'))
    processMock.mockResolvedValue({})

    render(<AdminReportsPage />)

    const reporter = await screen.findByText('Nguyen Buyer')
    const row = reporter.closest('tr')
    expect(row).not.toBeNull()

    fireEvent.pointerDown(within(row as HTMLElement).getAllByRole('button')[0])
    fireEvent.click(await screen.findByText('Cập nhật xử lý'))

    const dialog = await screen.findByRole('dialog', { name: 'Cập nhật xử lý báo cáo' })

    fireEvent.click(within(dialog).getByRole('combobox'))
    fireEvent.click(await screen.findByRole('option', { name: 'Bác bỏ báo cáo' }))
    fireEvent.change(within(dialog).getByPlaceholderText('Nhập ghi chú...'), {
      target: { value: 'Không đủ bằng chứng để kết luận vi phạm' },
    })

    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận' }))

    await waitFor(() => {
      expect(processMock).toHaveBeenCalledWith('report-1', {
        status: 'resolved_dismissed',
        adminNote: 'Không đủ bằng chứng để kết luận vi phạm',
      })
    })
  })
})
