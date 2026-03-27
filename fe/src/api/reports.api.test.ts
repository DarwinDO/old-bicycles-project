import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reportsApi } from './reports.api'

const { postMock, getResultMock, putResultMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
  getResultMock: vi.fn(),
  putResultMock: vi.fn(),
}))

vi.mock('@/lib/http', () => ({
  compactParams: (params: unknown) => params,
  getResult: getResultMock,
  putResult: putResultMock,
  http: {
    post: postMock,
  },
}))

describe('reportsApi.submit', () => {
  beforeEach(() => {
    postMock.mockReset()
    getResultMock.mockReset()
    putResultMock.mockReset()
    postMock.mockResolvedValue({
      data: {
        result: {
          id: 'report-1',
        },
      },
    })
  })

  it('builds multipart form data with target, reason, description, and files', async () => {
    const file = new File(['report-image'], 'listing-proof.jpg', { type: 'image/jpeg' })

    await reportsApi.submit({
      targetId: 'product-1',
      targetType: 'PRODUCT',
      reason: 'fake',
      description: 'Xe không đúng hình',
      files: [file],
    })

    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock).toHaveBeenCalledWith(
      '/api/reports',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    )

    const formData = postMock.mock.calls[0]?.[1] as FormData
    expect(formData.get('targetId')).toBe('product-1')
    expect(formData.get('targetType')).toBe('PRODUCT')
    expect(formData.get('reason')).toBe('fake')
    expect(formData.get('description')).toBe('Xe không đúng hình')
    expect(formData.getAll('files')).toEqual([file])
  })
})
