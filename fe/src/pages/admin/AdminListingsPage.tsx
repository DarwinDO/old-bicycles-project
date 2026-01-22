import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Check, X, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Listing {
    id: string;
    title: string;
    seller: string;
    price: string;
    category: string;
    status: 'pending' | 'active' | 'rejected' | 'sold';
    createdAt: string;
}

const mockListings: Listing[] = [
    { id: '1', title: 'Giant TCR Advanced Pro', seller: 'Nguyễn Văn A', price: '45,000,000đ', category: 'Road', status: 'pending', createdAt: '2026-01-20' },
    { id: '2', title: 'Trek Madone SLR 9', seller: 'Trần Thị B', price: '120,000,000đ', category: 'Road', status: 'active', createdAt: '2026-01-19' },
    { id: '3', title: 'Specialized Stumpjumper', seller: 'Lê Văn C', price: '35,000,000đ', category: 'MTB', status: 'pending', createdAt: '2026-01-18' },
    { id: '4', title: 'Cannondale SuperSix EVO', seller: 'Phạm Thị D', price: '55,000,000đ', category: 'Road', status: 'sold', createdAt: '2026-01-17' },
    { id: '5', title: 'Scott Scale RC', seller: 'Hoàng Văn E', price: '28,000,000đ', category: 'MTB', status: 'rejected', createdAt: '2026-01-16' },
];

export default function AdminListingsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        listingId: string;
        action: 'approve' | 'reject';
    }>({ open: false, listingId: '', action: 'approve' });

    const handleAction = (listingId: string, action: 'approve' | 'reject') => {
        setConfirmDialog({ open: true, listingId, action });
    };

    const handleConfirm = () => {
        console.log(`${confirmDialog.action} listing ${confirmDialog.listingId}`);
        setConfirmDialog({ open: false, listingId: '', action: 'approve' });
    };

    const columns: ColumnDef<Listing>[] = [
        {
            accessorKey: 'title',
            header: 'Tiêu đề',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.title}</p>
                    <p className="text-xs text-muted-foreground">{row.original.category}</p>
                </div>
            ),
        },
        { accessorKey: 'seller', header: 'Người bán' },
        { accessorKey: 'price', header: 'Giá' },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        { accessorKey: 'createdAt', header: 'Ngày đăng' },
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
                            <>
                                <DropdownMenuItem onClick={() => handleAction(row.original.id, 'approve')}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Duyệt tin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(row.original.id, 'reject')}>
                                    <X className="h-4 w-4 mr-2" />
                                    Từ chối
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const filteredListings = mockListings.filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.seller.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Duyệt tin đăng</h2>
                <p className="text-muted-foreground">Quản lý và duyệt các tin đăng bán xe.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm tin đăng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <DataTable columns={columns} data={filteredListings} />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                title={confirmDialog.action === 'approve' ? 'Duyệt tin đăng' : 'Từ chối tin đăng'}
                description={
                    confirmDialog.action === 'approve'
                        ? 'Bạn có chắc muốn duyệt tin đăng này?'
                        : 'Bạn có chắc muốn từ chối tin đăng này?'
                }
                confirmText={confirmDialog.action === 'approve' ? 'Duyệt' : 'Từ chối'}
                onConfirm={handleConfirm}
                variant={confirmDialog.action === 'reject' ? 'destructive' : 'default'}
            />
        </div>
    );
}
