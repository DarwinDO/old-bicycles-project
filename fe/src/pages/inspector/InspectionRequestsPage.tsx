import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InspectionRequest {
    id: string;
    bike: string;
    seller: string;
    location: string;
    requestedAt: string;
    status: 'pending' | 'active';
}

const mockRequests: InspectionRequest[] = [
    { id: '1', bike: 'Giant TCR Advanced Pro', seller: 'Nguyễn Văn A', location: 'Quận 1, TP.HCM', requestedAt: '2026-01-20', status: 'pending' },
    { id: '2', bike: 'Trek Madone SLR 9', seller: 'Trần Thị B', location: 'Quận 7, TP.HCM', requestedAt: '2026-01-19', status: 'pending' },
    { id: '3', bike: 'Specialized Stumpjumper', seller: 'Lê Văn C', location: 'Thủ Đức, TP.HCM', requestedAt: '2026-01-18', status: 'active' },
];

export default function InspectionRequestsPage() {
    const columns: ColumnDef<InspectionRequest>[] = [
        {
            accessorKey: 'bike',
            header: 'Xe cần kiểm định',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.bike}</p>
                    <p className="text-xs text-muted-foreground">{row.original.seller}</p>
                </div>
            ),
        },
        { accessorKey: 'location', header: 'Địa điểm' },
        { accessorKey: 'requestedAt', header: 'Ngày yêu cầu' },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Link to={`/inspector/inspect/${row.original.id}`}>
                        <Button variant="ghost" size="icon" title="Xem chi tiết">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    {row.original.status === 'pending' && (
                        <>
                            <Button variant="ghost" size="icon" title="Chấp nhận">
                                <Check className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Từ chối">
                                <X className="h-4 w-4 text-destructive" />
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
                <h2 className="text-2xl font-bold text-foreground">Yêu cầu kiểm định</h2>
                <p className="text-muted-foreground">Danh sách các yêu cầu kiểm định từ người bán.</p>
            </div>

            <DataTable columns={columns} data={mockRequests} />
        </div>
    );
}
