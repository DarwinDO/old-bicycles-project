import type { PaymentMethod } from '@/types/order'

const PLATFORM_FEE_RATE = 0.02
const ROUNDING_UNIT = 1000
const MIN_PLATFORM_FEE = 1_000
const MAX_PLATFORM_FEE = 500_000

export interface PlatformFeePreview {
  feeBaseAmount: number
  platformFeeRate: number
  platformFeeTotal: number
  buyerFeeAmount: number
  sellerFeeAmount: number
  buyerChargeAmount: number
  sellerGrossPayoutAmount: number
  sellerNetPayoutAmount: number
  minimumAllowedUpfrontAmount: number
  isApplicable: boolean
}

export function calculatePlatformFeePreview(
  totalAmount: number,
  protectedAmount: number,
  paymentMethod: PaymentMethod,
): PlatformFeePreview {
  const safeTotalAmount = Math.max(0, totalAmount || 0)
  const safeProtectedAmount = Math.max(0, protectedAmount || 0)
  const isApplicable = paymentMethod !== 'cash' && safeTotalAmount > 0 && safeProtectedAmount > 0

  if (!isApplicable) {
    return {
      feeBaseAmount: safeTotalAmount,
      platformFeeRate: 0,
      platformFeeTotal: 0,
      buyerFeeAmount: 0,
      sellerFeeAmount: 0,
      buyerChargeAmount: safeProtectedAmount,
      sellerGrossPayoutAmount: safeProtectedAmount,
      sellerNetPayoutAmount: safeProtectedAmount,
      minimumAllowedUpfrontAmount: 0,
      isApplicable: false,
    }
  }

  const rawPlatformFee = safeTotalAmount * PLATFORM_FEE_RATE
  const roundedPlatformFee = Math.round(rawPlatformFee / ROUNDING_UNIT) * ROUNDING_UNIT
  const platformFeeTotal = clamp(roundedPlatformFee, MIN_PLATFORM_FEE, MAX_PLATFORM_FEE)
  const buyerFeeAmount = Math.round(platformFeeTotal / 2)
  const sellerFeeAmount = platformFeeTotal - buyerFeeAmount
  const buyerChargeAmount = safeProtectedAmount + buyerFeeAmount
  const sellerGrossPayoutAmount = safeProtectedAmount
  const sellerNetPayoutAmount = safeProtectedAmount - sellerFeeAmount

  return {
    feeBaseAmount: safeTotalAmount,
    platformFeeRate: PLATFORM_FEE_RATE,
    platformFeeTotal,
    buyerFeeAmount,
    sellerFeeAmount,
    buyerChargeAmount,
    sellerGrossPayoutAmount,
    sellerNetPayoutAmount,
    minimumAllowedUpfrontAmount: sellerFeeAmount,
    isApplicable: true,
  }
}

function clamp(value: number, min: number, max: number) {
  if (value < min) {
    return min
  }

  if (value > max) {
    return max
  }

  return value
}
