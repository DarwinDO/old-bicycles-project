import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface Dispute {
    id: string;
    orderId: string;
    buyer: string;
    seller: string;
    product: string;
    reason: string;
    hasInspection: boolean;
    status: 'pending' | 'completed';
    createdAt: string;
}

const mockDisputes: Dispute[] = [
    { id: '1', orderId: 'ORD-001', buyer: 'Nguyễn Văn A', seller: 'Trần Thị B', product: 'Giant TCR', reason: 'Xe khác mô tả', hasInspection: true, status: 'pending', createdAt: '2026-01-20' },
    { id: '2', orderId: 'ORD-002', buyer: 'Lê Văn C', seller: 'Phạm Thị D', product: 'Trek Madone', reason: 'Hư hỏng không công bố', hasInspection: false, status: 'pending', createdAt: '2026-01-19' },
    { id: '3', orderId: 'ORD-003', buyer: 'Hoàng Văn E', seller: 'Nguyễn Thị F', product: 'Specialized', reason: 'Không giao hàng', hasInspection: false, status: 'completed', createdAt: '2026-01-18' },
];

export default function AdminDisputesPage() {
    const columns: ColumnDef<Dispute>[] = [
        {
            accessorKey: 'orderId',
            header: 'Mã đơn hàng',
        },
        {
            accessorKey: 'product',
            header: 'Sản phẩm',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.product}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.buyer} ↔ {row.original.seller}
                    </p>
                </div>
            ),
        },
        { accessorKey: 'reason', header: 'Lý do' },
        {
            accessorKey: 'hasInspection',
            header: 'Báo cáo kiểm định',
            cell: ({ row }) => (
                <span className={row.original.hasInspection ? 'text-primary' : 'text-muted-foreground'}>
                    {row.original.hasInspection ? 'Có' : 'Không'}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        { accessorKey: 'createdAt', header: 'Ngày tạo' },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                    </Button>
                    {row.original.status === 'pending' && (
                        <>
                            <Button variant="ghost" size="icon" title="Hoàn tiền cho Buyer">
                                <CheckCircle className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Từ chối khiếu nại">
                                <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Giải quyết tranh chấp</h2>
                <p className="text-muted-foreground">Xử lý các khiếu nại và tranh chấp giao dịch.</p>
            </div>

            <DataTable columns={columns} data={mockDisputes} />
        </div>
    );
}
