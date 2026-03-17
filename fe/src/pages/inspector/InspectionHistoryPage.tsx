import { History } from 'lucide-react'

export default function InspectionHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Lịch sử kiểm định</h2>
        <p className="text-muted-foreground">Danh sách các xe đã kiểm định.</p>
      </div>

      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        <History className="h-12 w-12 opacity-30" />
        <div>
          <p className="font-medium">Chưa có lịch sử kiểm định</p>
          <p className="text-sm mt-1 max-w-xs">
            Sau khi hoàn thành kiểm định xe, kết quả sẽ hiển thị tại đây.
          </p>
        </div>
      </div>
    </div>
  )
}
