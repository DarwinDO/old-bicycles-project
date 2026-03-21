import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PaymentMethod, PaymentOption } from '@/types/order'
import { formatPrice } from './utils'

export interface BikeOrderFormValues {
  paymentOption: PaymentOption
  paymentMethod: PaymentMethod
  upfrontAmount: string
}

interface BikeOrderDialogProps {
  open: boolean
  productTitle: string
  productPrice: number
  error: string | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: BikeOrderFormValues) => void
}

export function BikeOrderDialog({
  open,
  productTitle,
  productPrice,
  error,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: BikeOrderDialogProps) {
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('partial')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer')
  const [upfrontAmount, setUpfrontAmount] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu mua xe</DialogTitle>
          <DialogDescription>
            Bạn đang tạo yêu cầu mua cho <span className="font-semibold text-foreground">{productTitle}</span>.
            Sau khi người bán chấp nhận, bạn sẽ thanh toán ở trang đơn mua của mình.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-sm text-muted-foreground">Giá niêm yết</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{formatPrice(productPrice)}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-option">Hình thức thanh toán</Label>
            <Select value={paymentOption} onValueChange={(value) => setPaymentOption(value as PaymentOption)}>
              <SelectTrigger id="payment-option">
                <SelectValue placeholder="Chọn hình thức thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partial">Đặt cọc một phần</SelectItem>
                <SelectItem value="full">Thanh toán toàn bộ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Phương thức thanh toán</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Chọn phương thức thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Chuyển khoản</SelectItem>
                <SelectItem value="cash">Tiền mặt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentOption === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="upfront-amount">Số tiền ứng trước</Label>
              <Input
                id="upfront-amount"
                inputMode="numeric"
                placeholder="Ví dụ: 5000000"
                value={upfrontAmount}
                onChange={(event) => setUpfrontAmount(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Backend cho phép bạn nhập số tiền ứng trước hợp lệ, miễn lớn hơn 0 và không vượt quá giá xe.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => onSubmit({ paymentOption, paymentMethod, upfrontAmount })}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang tạo đơn...' : 'Tạo yêu cầu mua'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
