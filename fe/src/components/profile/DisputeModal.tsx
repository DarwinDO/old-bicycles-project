import { useEffect, useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatOrderCurrency } from '@/lib/order-display'

export interface RefundFormValues {
  reason: string
  evidenceNote?: string
}

interface DisputeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: RefundFormValues) => Promise<void> | void
  orderId: string
  refundAmount: number
  isSubmitting?: boolean
  error?: string | null
}

const reasonOptions = [
  'Xe không giống mô tả',
  'Hàng bị hỏng hoặc trầy xước',
  'Thiếu phụ kiện đi kèm',
  'Nghi ngờ giấy tờ giả',
  'Chưa nhận được hàng nhưng đã báo giao',
]

export function DisputeModal({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  refundAmount,
  isSubmitting = false,
  error = null,
}: DisputeModalProps) {
  const [reason, setReason] = useState('')
  const [evidenceNote, setEvidenceNote] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setEvidenceNote('')
    }
  }, [isOpen])

  async function handleSubmit() {
    if (!reason) {
      return
    }

    await onSubmit({
      reason,
      evidenceNote: evidenceNote.trim() || undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Yêu cầu hoàn tiền
          </DialogTitle>
          <DialogDescription>
            Đơn hàng <span className="font-semibold text-foreground">{orderId}</span> đang ở trạng thái đã đặt cọc.
            Hãy chọn lý do và ghi chú rõ ràng để admin xem xét yêu cầu hoàn tiền.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-sm">
          <p className="font-medium text-foreground">Số tiền hệ thống sẽ yêu cầu hoàn</p>
          <p className="mt-1 text-lg font-bold text-primary">{formatOrderCurrency(refundAmount)}</p>
          <p className="mt-2 text-muted-foreground">
            Backend hiện chỉ cho tạo yêu cầu hoàn đúng bằng số tiền đã thanh toán, nên FE không cho sửa số tiền này.
          </p>
        </div>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="refund-reason">
              Lý do hoàn tiền <span className="text-red-500">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="refund-reason">
                <SelectValue placeholder="Chọn lý do phù hợp" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="refund-evidence">Ghi chú và bằng chứng mô tả</Label>
            <Textarea
              id="refund-evidence"
              value={evidenceNote}
              onChange={(event) => setEvidenceNote(event.target.value)}
              placeholder="Ví dụ: Xe bị trầy sâu ở khung, thiếu pedal như bài đăng và tôi có ảnh chụp khi mở hàng."
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              FE hiện mới gửi ghi chú mô tả qua API `evidenceNote`. Chưa có API upload file riêng cho phần khiếu nại.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={() => void handleSubmit()} disabled={isSubmitting || !reason}>
            {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu hoàn tiền'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
