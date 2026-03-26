import { beforeEach, describe, expect, it, vi } from 'vitest'
import { refundsApi } from './refunds.api'

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}))

vi.mock('@/lib/http', () => ({
  compactParams: (params: unknown) => params,
  getResult: vi.fn(),
  patchResult: vi.fn(),
  http: {
    post: postMock,
  },
}))

describe('refundsApi.create', () => {
  beforeEach(() => {
    postMock.mockReset()
    postMock.mockResolvedValue({
      data: {
        result: {
          id: 'refund-1',
        },
      },
    })
  })

  it('builds multipart form data with amount, reason, note, and files', async () => {
    const file = new File(['refund-image'], 'refund-proof.jpg', { type: 'image/jpeg' })

    await refundsApi.create('order-1', {
      amount: 4_200_000,
      reason: 'Xe không giống mô tả',
      evidenceNote: 'Ảnh mở thùng',
      files: [file],
    })

    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock).toHaveBeenCalledWith(
      '/api/orders/order-1/refunds',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    )

    const formData = postMock.mock.calls[0]?.[1] as FormData
    expect(formData.get('amount')).toBe('4200000')
    expect(formData.get('reason')).toBe('Xe không giống mô tả')
    expect(formData.get('evidenceNote')).toBe('Ảnh mở thùng')
    expect(formData.getAll('files')).toEqual([file])
  })
})
