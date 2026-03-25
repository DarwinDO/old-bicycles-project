import { describe, expect, it } from 'vitest'
import { normalizeProduct } from './products.api'

describe('normalizeProduct', () => {
  it('maps backend verified and primary keys to the frontend product shape', () => {
    const product = normalizeProduct({
      id: 'product-1',
      title: 'Giant 2026',
      price: 20_000_000,
      status: 'active',
      createdAt: '2026-03-25T11:48:29.966713Z',
      verified: true,
      lockedForTransaction: false,
      images: [
        {
          id: 'image-1',
          url: 'https://cdn.example.com/giant.jpg',
          primary: true,
          displayOrder: 0,
        },
      ],
    })

    expect(product.isVerified).toBe(true)
    expect(product.images[0]?.isPrimary).toBe(true)
  })

  it('preserves explicit frontend keys when they already exist', () => {
    const product = normalizeProduct({
      id: 'product-2',
      title: 'Specialized Roubaix',
      price: 33_000_000,
      status: 'active',
      createdAt: '2026-03-25T01:04:29.19604Z',
      isVerified: true,
      lockedForTransaction: false,
      images: [
        {
          id: 'image-2',
          url: 'https://cdn.example.com/roubaix.jpg',
          isPrimary: true,
          primary: false,
          displayOrder: 0,
        },
      ],
    })

    expect(product.isVerified).toBe(true)
    expect(product.images[0]?.isPrimary).toBe(true)
  })
})
