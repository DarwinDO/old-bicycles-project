import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, PlusCircle, PenSquare, EyeOff, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

// Fake Data for UI showcase
const FAKE_LISTINGS = [
    {
        id: 'B001',
        title: 'Road Bike Trinx Tempo 1.0',
        price: '3,200,000 đ',
        status: 'Active',
        views: 124,
        date: '2026-02-23',
    },
    {
        id: 'B002',
        title: 'Giant Escape 3 2023',
        price: '6,500,000 đ',
        status: 'Pending',
        views: 0,
        date: '2026-02-25',
    },
    {
        id: 'B003',
        title: 'Trek Marlin 5',
        price: '8,000,000 đ',
        status: 'Sold',
        views: 942,
        date: '2026-02-10',
    },
];

export default function SellerListingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between shrink-0 gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý tin đăng</h2>
                    <p className="text-muted-foreground">
                        Sửa, ẩn, xóa hoặc đánh dấu đã bán các xe bạn đang rao.
                    </p>
                </div>
                <Link to={ROUTES.SELL}>
                    <Button className="w-full sm:w-auto gap-2">
                        <PlusCircle className="h-4 w-4" /> Đăng tin mới
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm theo mã hoặc tên xe..."
                        className="pl-8 bg-background"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Tất cả</Button>
                    <Button variant="outline" size="sm">Đang bán</Button>
                    <Button variant="outline" size="sm">Chờ duyệt</Button>
                    <Button variant="outline" size="sm">Đã bán</Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sản phẩm</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Giá</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lượt xem</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ngày đăng</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {FAKE_LISTINGS.map((item) => (
                                <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex items-center justify-center rounded bg-secondary/50">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">Mã: {item.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle font-medium">{item.price}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                            ${item.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                            ${item.status === 'Pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                            ${item.status === 'Sold' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' : ''}
                                        `}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">{item.views}</td>
                                    <td className="p-4 align-middle text-muted-foreground">{item.date}</td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            {item.status !== 'Sold' && (
                                                <>
                                                    <Button variant="ghost" size="icon" title="Chỉnh sửa">
                                                        <PenSquare className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Ẩn tin">
                                                        <EyeOff className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Mark as Sold" className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-950/30">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
