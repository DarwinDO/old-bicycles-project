import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

interface InspectionHistory {
    id: string;
    bike: string;
    seller: string;
    overallScore: number;
    result: 'passed' | 'failed';
    inspectedAt: string;
}

const mockHistory: InspectionHistory[] = [
    { id: '1', bike: 'Giant TCR Advanced Pro', seller: 'Nguyễn Văn A', overallScore: 4.6, result: 'passed', inspectedAt: '2026-01-20' },
    { id: '2', bike: 'Trek Madone SLR 9', seller: 'Trần Thị B', overallScore: 4.8, result: 'passed', inspectedAt: '2026-01-18' },
    { id: '3', bike: 'Specialized Stumpjumper', seller: 'Lê Văn C', overallScore: 2.4, result: 'failed', inspectedAt: '2026-01-15' },
    { id: '4', bike: 'Cannondale SuperSix', seller: 'Phạm Thị D', overallScore: 4.2, result: 'passed', inspectedAt: '2026-01-12' },
];

export default function InspectionHistoryPage() {
    const columns: ColumnDef<InspectionHistory>[] = [
        {
            accessorKey: 'bike',
            header: 'Xe đã kiểm định',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.bike}</p>
                    <p className="text-xs text-muted-foreground">{row.original.seller}</p>
                </div>
            ),
        },
        {
            accessorKey: 'overallScore',
            header: 'Điểm',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.overallScore}/5</span>
            ),
        },
        {
            accessorKey: 'result',
            header: 'Kết quả',
            cell: ({ row }) => (
                <span className={`font-medium ${row.original.result === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.original.result === 'passed' ? 'Đạt' : 'Không đạt'}
                </span>
            ),
        },
        { accessorKey: 'inspectedAt', header: 'Ngày kiểm định' },
        {
            id: 'actions',
            header: '',
            cell: () => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Tải báo cáo">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Lịch sử kiểm định</h2>
                <p className="text-muted-foreground">Danh sách các xe đã kiểm định.</p>
            </div>

            <DataTable columns={columns} data={mockHistory} />
        </div>
    );
}
