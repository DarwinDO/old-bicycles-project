import { ClipboardList } from 'lucide-react'

export default function InspectionRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Yêu cầu kiểm định</h2>
        <p className="text-muted-foreground">Danh sách các yêu cầu kiểm định từ người bán.</p>
      </div>

      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        <ClipboardList className="h-12 w-12 opacity-30" />
        <div>
          <p className="font-medium">Chưa có yêu cầu kiểm định nào</p>
          <p className="text-sm mt-1 max-w-xs">
            Khi người bán yêu cầu kiểm định sản phẩm, danh sách sẽ hiển thị ở đây.
          </p>
        </div>
      </div>
    </div>
  )
}
