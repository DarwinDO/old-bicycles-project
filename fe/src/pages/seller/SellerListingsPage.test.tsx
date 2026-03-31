import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SellerListingsPage from './SellerListingsPage'

const { getMineMock, hideMock, showMock, deleteMock } = vi.hoisted(() => ({
  getMineMock: vi.fn(),
  hideMock: vi.fn(),
  showMock: vi.fn(),
  deleteMock: vi.fn(),
}))

vi.mock('@/api/products.api', () => ({
  productsApi: {
    getMine: getMineMock,
    hide: hideMock,
    show: showMock,
    delete: deleteMock,
  },
}))

describe('SellerListingsPage', () => {
  beforeEach(() => {
    getMineMock.mockReset()
    hideMock.mockReset()
    showMock.mockReset()
    deleteMock.mockReset()

    getMineMock.mockResolvedValue({
      content: [
        {
          id: 'product-1',
          title: 'Specialized Roubaix',
          price: 33_000_000,
          status: 'active',
          createdAt: '2026-03-25T08:00:00Z',
          expiresAt: '2026-04-25T08:00:00Z',
          images: [],
          isVerified: false,
          lockedForTransaction: false,
          sellerActionLocked: false,
          inspection: {
            id: 'inspection-1',
            passed: true,
            validUntil: '2026-03-30T08:00:00Z',
            createdAt: '2026-03-24T08:00:00Z',
          },
        },
      ],
      totalPages: 1,
    })
  })

  it('shows expiry details when an active listing is no longer public because inspection expired', async () => {
    render(
      <MemoryRouter>
        <SellerListingsPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(getMineMock).toHaveBeenCalledWith(0, 10)
    })

    expect(await screen.findByText('Specialized Roubaix')).toBeInTheDocument()
    expect(screen.getByText('Hết hạn kiểm định')).toBeInTheDocument()
    expect(screen.getByText(/Kiểm định hết hạn:/i)).toBeInTheDocument()
    expect(screen.getByText(/Hạn tin:/i)).toBeInTheDocument()
    expect(screen.getByText(/Buyer không còn thấy tin này ngoài marketplace/i)).toBeInTheDocument()
  })
})
