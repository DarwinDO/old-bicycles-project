export type PaymentOption = 'partial' | 'full'

export type PaymentMethod = 'transfer' | 'cash' | 'online'

export type OrderStatus =
  | 'pending'
  | 'deposited'
  | 'awaiting_buyer_confirmation'
  | 'completed'
  | 'cancelled'

export type OrderFundingStatus =
  | 'unpaid'
  | 'awaiting_payment'
  | 'held'
  | 'released'
  | 'refund_pending'
  | 'refunded'

export interface Order {
  id: string
  productId: string
  productTitle: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  totalAmount: number
  depositAmount?: number | null
  requiredUpfrontAmount: number
  paidAmount: number
  remainingAmount: number
  serviceFee?: number | null
  paymentOption: PaymentOption
  status: OrderStatus
  fundingStatus: OrderFundingStatus
  paymentMethod: PaymentMethod
  acceptedAt?: string | null
  paymentDeadline?: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderCreateRequest {
  productId: string
  upfrontAmount?: number
  depositAmount?: number
  serviceFee?: number
  paymentOption?: PaymentOption
  paymentMethod: PaymentMethod
}
