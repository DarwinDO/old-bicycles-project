import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud } from 'lucide-react';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    orderId: string;
}

export function DisputeModal({ isOpen, onClose, onSubmit, orderId }: DisputeModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl text-red-600 dark:text-red-400 flex items-center gap-2">
                        Báo cáo sự cố / Khiếu nại
                    </DialogTitle>
                    <DialogDescription>
                        Tiền của bạn đang được hệ thống bảo vệ an toàn. Hãy cung cấp lý do và bằng chứng để quản trị viên xử lý cho đơn hàng <span className="font-semibold text-foreground">{orderId}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Lý do khiếu nại <span className="text-red-500">*</span></Label>
                        <Select defaultValue="not-described">
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Chọn lý do" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="not-described">Xe không giống mô tả</SelectItem>
                                <SelectItem value="damaged">Hàng bị hỏng hóc/trầy xước</SelectItem>
                                <SelectItem value="missing-parts">Thiếu phụ kiện kèm theo</SelectItem>
                                <SelectItem value="fake-papers">Nghi ngờ giấy tờ giả</SelectItem>
                                <SelectItem value="not-received">Chưa nhận được hàng nhưng báo đã giao</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Mô tả chi tiết <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả cụ thể vấn đề bạn gặp phải để Inspector dễ dàng xác minh..."
                            className="h-24 resize-none"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Hình ảnh / Video bằng chứng <span className="text-red-500">*</span></Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Nhấn để tải lên hoặc kéo thả file</p>
                            <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, MP4 (Tối đa 50MB)</p>
                            <Input type="file" className="hidden" />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button variant="destructive" onClick={onSubmit}>
                        Gửi khiếu nại
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
