import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, CheckCircle, XCircle } from 'lucide-react';

const FAKE_ORDERS = [
    {
        id: 'ORD-1234',
        buyer: 'Minh',
        item: 'Road Bike Trinx Tempo 1.0',
        amount: '500,000 đ',
        type: 'Cọc 15%',
        status: 'Chờ nhận cọc', // Pending Accept/Reject
        date: '2026-02-25 10:30',
        alert: true,
    },
    {
        id: 'ORD-1233',
        buyer: 'Khánh',
        item: 'Fixed Gear cơ bản',
        amount: '200,000 đ',
        type: 'Cọc 15%',
        status: 'Đã nhận cọc', // Deposited - Wait to ship
        date: '2026-02-24 14:15',
        alert: false,
    },
    {
        id: 'ORD-1229',
        buyer: 'Thảo',
        item: 'Trek Marlin 5',
        amount: '8,000,000 đ',
        type: 'Mua đứt',
        status: 'Hoàn tất', // Completed (Tiền đã được gửi)
        date: '2026-02-14 09:00',
        alert: false,
    }
];

export default function SellerOrdersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Quản lý Đơn cọc / Mua</h2>
                <p className="text-muted-foreground">
                    Chấp nhận hoặc từ chối các yêu cầu đặt cọc từ người mua (Escrow System).
                </p>
            </div>

            <div className="grid gap-4">
                {FAKE_ORDERS.map((order) => (
                    <div key={order.id} className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl border bg-card text-card-foreground shadow-sm transition-all ${order.alert ? 'border-orange-500/50 shadow-orange-500/10' : ''}`}>
                        <div className="flex gap-4">
                            <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${order.alert ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-secondary/50 text-muted-foreground'}`}>
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">{order.item}</h3>
                                    <Badge variant="outline" className="text-xs font-normal">Mã: {order.id}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                    <span>Người mua: <span className="font-medium text-foreground">{order.buyer}</span></span>
                                    <span>•</span>
                                    <span>Loại: {order.type}</span>
                                    <span>•</span>
                                    <span>{order.date}</span>
                                </div>
                                <div className="pt-1">
                                    <span className={`inline-flex items-center font-medium text-sm
                                        ${order.status === 'Chờ nhận cọc' ? 'text-orange-600 dark:text-orange-400' : ''}
                                        ${order.status === 'Đã nhận cọc' ? 'text-blue-600 dark:text-blue-400' : ''}
                                        ${order.status === 'Hoàn tất' ? 'text-green-600 dark:text-green-400' : ''}
                                    `}>
                                        Trạng thái: {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-border">
                            <div className="text-lg font-bold">
                                {order.amount}
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                {order.status === 'Chờ nhận cọc' && (
                                    <>
                                        <Button variant="outline" className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 border-red-200 dark:border-red-900/50">
                                            <XCircle className="h-4 w-4" /> Từ chối
                                        </Button>
                                        <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white gap-1.5">
                                            <CheckCircle className="h-4 w-4" /> Chấp nhận cọc
                                        </Button>
                                    </>
                                )}
                                {order.status === 'Đã nhận cọc' && (
                                    <Button variant="outline" className="flex-1 md:flex-none gap-1.5">
                                        Cập nhật đã giao hàng
                                    </Button>
                                )}
                                {order.status === 'Hoàn tất' && (
                                    <Button variant="ghost" className="flex-1 md:flex-none" disabled>
                                        Giao dịch xong
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
