import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportsApi } from '@/api/reports.api';
import type { ReportRequest, ReportReason } from '@/types/report';
import { Flag } from 'lucide-react';

export interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetType: 'product' | 'user';
  targetName?: string;
  onSuccess?: () => void;
}

const REPORT_REASONS: Record<'product' | 'user', { value: ReportReason; label: string }[]> = {
  product: [
    { value: 'fake', label: 'Hàng giả, hàng nhái' },
    { value: 'wrong_description', label: 'Thông tin sai lệch (giá, mô tả, hình ảnh)' },
    { value: 'fraud', label: 'Sản phẩm bị cấm giao dịch' },
    { value: 'spam', label: 'Hình ảnh phản cảm' },
    { value: 'other', label: 'Lý do khác' }
  ],
  user: [
    { value: 'fraud', label: 'Lừa đảo' },
    { value: 'other', label: 'Ngôn từ đả kích, thù ghét' },
    { value: 'fake', label: 'Gian lận đánh giá' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Lý do khác' }
  ]
};

export function ReportModal({
  open,
  onOpenChange,
  targetId,
  targetType,
  targetName,
  onSuccess
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason) {
      setError('Vui lòng chọn lý do báo cáo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: ReportRequest = {
        targetId,
        targetType: targetType.toUpperCase(),
        reason: reason as ReportReason,
        description: description.trim() || undefined
      };

      await reportsApi.submit(payload);
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setReason('');
      setDescription('');
    } catch (err) {
      setError('Không thể gửi báo cáo lúc này. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Don't close if loading
      if (loading) return; 
      onOpenChange(val);
      if (!val) {
        setError(null);
        setReason('');
        setDescription('');
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Báo cáo {targetType === 'product' ? 'tin đăng' : 'người dùng'}
          </DialogTitle>
          <DialogDescription>
            {targetName ? (
              <span>Bạn đang báo cáo: <strong className="text-foreground">{targetName}</strong></span>
            ) : (
              'Vui lòng cung cấp chi tiết hành vi vi phạm.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do báo cáo *</label>
            <Select value={reason} onValueChange={(v) => {
              setReason(v as ReportReason);
              setError(null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS[targetType].map((option) => (
                  <SelectItem key={option.value + option.label} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả thêm (tuỳ chọn)</label>
            <Textarea
              placeholder="Cung cấp thêm chi tiết để chúng tôi có thể xử lý nhanh hơn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Huỷ
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
