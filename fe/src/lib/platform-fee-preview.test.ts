import { describe, expect, it } from 'vitest'
import { calculatePlatformFeePreview } from '@/lib/platform-fee-preview'

describe('platform-fee-preview', () => {
  it('matches the backend fee split for transfer orders', () => {
    const preview = calculatePlatformFeePreview(20_000_000, 4_000_000, 'transfer')

    expect(preview.feeBaseAmount).toBe(20_000_000)
    expect(preview.platformFeeRate).toBe(0.02)
    expect(preview.platformFeeTotal).toBe(400_000)
    expect(preview.buyerFeeAmount).toBe(200_000)
    expect(preview.sellerFeeAmount).toBe(200_000)
    expect(preview.buyerChargeAmount).toBe(4_200_000)
    expect(preview.sellerGrossPayoutAmount).toBe(4_000_000)
    expect(preview.sellerNetPayoutAmount).toBe(3_800_000)
    expect(preview.minimumAllowedUpfrontAmount).toBe(200_000)
    expect(preview.isApplicable).toBe(true)
  })

  it('returns zero fee when the payment is not applicable', () => {
    const preview = calculatePlatformFeePreview(20_000_000, 4_000_000, 'cash')

    expect(preview.platformFeeTotal).toBe(0)
    expect(preview.buyerFeeAmount).toBe(0)
    expect(preview.sellerFeeAmount).toBe(0)
    expect(preview.buyerChargeAmount).toBe(4_000_000)
    expect(preview.isApplicable).toBe(false)
  })
})
