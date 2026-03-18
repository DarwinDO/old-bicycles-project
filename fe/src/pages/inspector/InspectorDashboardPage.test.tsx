import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import InspectorDashboardPage from './InspectorDashboardPage'

const { getDashboardMock } = vi.hoisted(() => ({
  getDashboardMock: vi.fn(),
}))

vi.mock('@/api/inspections.api', () => ({
  inspectionsApi: {
    getDashboard: getDashboardMock,
  },
}))

describe('InspectorDashboardPage', () => {
  it('loads dashboard summary and recent inspections', async () => {
    getDashboardMock.mockResolvedValueOnce({
      pendingRequests: 4,
      completedThisWeek: 3,
      passRate: 66.7,
      averageScore: 4.2,
      recentInspections: [
        {
          inspectionId: 'inspection-1',
          productId: 'product-1',
          productTitle: 'Giant Propel',
          productPrice: 52000000,
          sellerId: 'seller-1',
          sellerName: 'Lan Nguyen',
          requestedAt: '2026-03-18T08:00:00Z',
          evaluatedAt: '2026-03-18T10:30:00Z',
          passed: true,
          overallScore: 4.4,
        },
      ],
    })

    render(<InspectorDashboardPage />)

    await waitFor(() => {
      expect(getDashboardMock).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText('Giant Propel')).toBeInTheDocument()
    expect(screen.getByText('66.7%')).toBeInTheDocument()
    expect(screen.getByText('4.2/5')).toBeInTheDocument()
  })
})
