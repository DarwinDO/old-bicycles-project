import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, CheckCircle, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Report {
    id: string;
    reporter: string;
    reportedType: 'product' | 'user';
    reportedName: string;
    reason: string;
    status: 'pending' | 'completed';
    createdAt: string;
}

const mockReports: Report[] = [
    { id: '1', reporter: 'Nguyễn Văn A', reportedType: 'product', reportedName: 'Giant TCR Copy', reason: 'Hàng giả', status: 'pending', createdAt: '2026-01-20' },
    { id: '2', reporter: 'Trần Thị B', reportedType: 'user', reportedName: 'Lê Văn C', reason: 'Lừa đảo', status: 'pending', createdAt: '2026-01-19' },
    { id: '3', reporter: 'Phạm Thị D', reportedType: 'product', reportedName: 'Trek Fake', reason: 'Sai mô tả', status: 'completed', createdAt: '2026-01-18' },
];

export default function AdminReportsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const columns: ColumnDef<Report>[] = [
        {
            accessorKey: 'reporter',
            header: 'Người báo cáo',
        },
        {
            accessorKey: 'reportedName',
            header: 'Đối tượng',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.reportedName}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.reportedType === 'product' ? 'Tin đăng' : 'Người dùng'}
                    </p>
                </div>
            ),
        },
        { accessorKey: 'reason', header: 'Lý do' },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        { accessorKey: 'createdAt', header: 'Ngày báo cáo' },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        {row.original.status === 'pending' && (
                            <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Đánh dấu đã xử lý
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const filteredReports = mockReports.filter((report) =>
        report.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportedName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Báo cáo vi phạm</h2>
                <p className="text-muted-foreground">Xử lý các báo cáo từ người dùng.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm báo cáo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <DataTable columns={columns} data={filteredReports} />
        </div>
    );
}
