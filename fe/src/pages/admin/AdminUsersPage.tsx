import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Ban, CheckCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock user data
interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller' | 'inspector';
    status: 'active' | 'banned';
    createdAt: string;
}

const mockUsers: User[] = [
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', role: 'seller', status: 'active', createdAt: '2026-01-15' },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0912345678', role: 'buyer', status: 'active', createdAt: '2026-01-14' },
    { id: '3', name: 'Lê Văn C', email: 'levanc@email.com', phone: '0923456789', role: 'seller', status: 'banned', createdAt: '2026-01-13' },
    { id: '4', name: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0934567890', role: 'inspector', status: 'active', createdAt: '2026-01-12' },
    { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@email.com', phone: '0945678901', role: 'buyer', status: 'active', createdAt: '2026-01-11' },
];

const roleLabels: Record<string, string> = {
    buyer: 'Người mua',
    seller: 'Người bán',
    inspector: 'Kiểm định viên',
};

export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        userId: string;
        action: 'ban' | 'unban';
    }>({ open: false, userId: '', action: 'ban' });

    const handleAction = (userId: string, action: 'ban' | 'unban') => {
        setConfirmDialog({ open: true, userId, action });
    };

    const handleConfirm = () => {
        // Handle ban/unban action
        console.log(`${confirmDialog.action} user ${confirmDialog.userId}`);
        setConfirmDialog({ open: false, userId: '', action: 'ban' });
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: 'Họ tên',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.email}</p>
                </div>
            ),
        },
        {
            accessorKey: 'phone',
            header: 'Số điện thoại',
        },
        {
            accessorKey: 'role',
            header: 'Vai trò',
            cell: ({ row }) => roleLabels[row.original.role],
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: 'createdAt',
            header: 'Ngày đăng ký',
        },
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
                        {row.original.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleAction(row.original.id, 'ban')}>
                                <Ban className="h-4 w-4 mr-2" />
                                Khóa tài khoản
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => handleAction(row.original.id, 'unban')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mở khóa
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const filteredUsers = mockUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">Quản lý người dùng</h2>
                <p className="text-muted-foreground">Xem và quản lý tất cả người dùng trong hệ thống.</p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Users table */}
            <DataTable columns={columns} data={filteredUsers} />

            {/* Confirm dialog */}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                title={confirmDialog.action === 'ban' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                description={
                    confirmDialog.action === 'ban'
                        ? 'Bạn có chắc muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập.'
                        : 'Bạn có chắc muốn mở khóa tài khoản này?'
                }
                confirmText={confirmDialog.action === 'ban' ? 'Khóa' : 'Mở khóa'}
                onConfirm={handleConfirm}
                variant={confirmDialog.action === 'ban' ? 'destructive' : 'default'}
            />
        </div>
    );
}
