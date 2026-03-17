import type { PaymentMethod } from '@/types/order'

export type PaymentGateway = 'manual' | 'sepay'

export type PaymentPhase = 'upfront' | 'remaining'

export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded'

export interface PaymentRequestResponse {
  paymentId: string
  orderId: string
  gateway: PaymentGateway
  phase: PaymentPhase
  status: PaymentStatus
  amount: number
  gatewayOrderCode?: string | null
  checkoutUrl?: string | null
  qrCodeUrl?: string | null
  transferContent?: string | null
  bankBin?: string | null
  bankAccountNumber?: string | null
  bankAccountName?: string | null
  mockMode: boolean
  instructions?: string | null
  expiresAt?: string | null
}

export interface PaymentHistoryItem {
  id: string
  orderId: string
  amount: number
  gateway: PaymentGateway
  method: PaymentMethod
  phase: PaymentPhase
  status: PaymentStatus
  gatewayOrderCode?: string | null
  transactionReference?: string | null
  checkoutUrl?: string | null
  qrCodeUrl?: string | null
  paymentDate?: string | null
  createdAt: string
}
