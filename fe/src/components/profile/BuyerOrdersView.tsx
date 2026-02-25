import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageOpen, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { DisputeModal } from './DisputeModal';

const INITIAL_ORDERS = [
    {
        id: 'BORD-901',
        title: 'Road Bike Trinx Tempo 1.0',
        price: '3,200,000 đ',
        seller: 'Cửa hàng Xe đạp Tuấn Mập',
        status: 'SHIPPED', // Waiting for buyer to confirm receipt
        date: '2026-02-23',
    },
    {
        id: 'BORD-902',
        title: 'Phụ kiện: Mũ bảo hiểm đua',
        price: '450,000 đ',
        seller: 'Phượt Store',
        status: 'DEPOSITED', // Waiting for seller to ship
        date: '2026-02-24',
    },
    {
        id: 'BORD-885',
        title: 'Giant Escape 3',
        price: '6,500,000 đ',
        seller: 'Bicycle HN',
        status: 'COMPLETED', // Done
        date: '2026-02-10',
    }
];

export function BuyerOrdersView() {
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [disputeModalOpen, setDisputeModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const handleConfirmReceipt = (orderId: string) => {
        // In a real app, this would be an API call
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: 'COMPLETED' } : order
        ));
    };

    const openDisputeModal = (orderId: string) => {
        setSelectedOrderId(orderId);
        setDisputeModalOpen(true);
    };

    const handleDisputeSubmit = () => {
        if (selectedOrderId) {
            setOrders(orders.map(order =>
                order.id === selectedOrderId ? { ...order, status: 'DISPUTED' } : order
            ));
        }
        setDisputeModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Đơn mua của tôi</h2>
                <p className="text-muted-foreground text-sm">
                    Theo dõi trạng thái giao hàng và xác nhận nhận xe để hoàn tất giao dịch.
                </p>
            </div>

            <div className="grid gap-4">
                {orders.map((order) => (
                    <div key={order.id} className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl border bg-card text-card-foreground shadow-sm transition-all ${order.status === 'SHIPPED' ? 'border-primary/50 shadow-primary/5' : ''}`}>
                        <div className="flex gap-4">
                            <div className="mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                                <PackageOpen className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">{order.title}</h3>
                                    <Badge variant="outline" className="text-xs font-normal">Mã: {order.id}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                    <span>Người bán: <span className="font-medium text-foreground">{order.seller}</span></span>
                                    <span>•</span>
                                    <span>{order.date}</span>
                                </div>
                                <div className="pt-1">
                                    <span className={`inline-flex items-center font-medium text-sm
                                        ${order.status === 'DEPOSITED' ? 'text-blue-600 dark:text-blue-400' : ''}
                                        ${order.status === 'SHIPPED' ? 'text-orange-600 dark:text-orange-400' : ''}
                                        ${order.status === 'DISPUTED' ? 'text-red-600 dark:text-red-400' : ''}
                                        ${order.status === 'COMPLETED' ? 'text-green-600 dark:text-green-400' : ''}
                                    `}>
                                        Trạng thái: {order.status === 'DEPOSITED' && 'Đã đặt cọc - Chờ giao'}
                                        {order.status === 'SHIPPED' && 'Đang giao - Chờ bạn xác nhận'}
                                        {order.status === 'DISPUTED' && 'Đang khiếu nại'}
                                        {order.status === 'COMPLETED' && 'Đã hoàn tất'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-border">
                            <div className="text-lg font-bold text-primary">
                                {order.price}
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                {order.status === 'SHIPPED' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 border-red-200 dark:border-red-900/50"
                                            onClick={() => openDisputeModal(order.id)}
                                        >
                                            <AlertTriangle className="h-4 w-4" /> Khiếu nại
                                        </Button>
                                        <Button
                                            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                            onClick={() => handleConfirmReceipt(order.id)}
                                        >
                                            <ShieldCheck className="h-4 w-4" /> Đã nhận xe
                                        </Button>
                                    </>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <Button variant="outline" className="flex-1 md:flex-none gap-1.5 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950/30">
                                        <CheckCircle2 className="h-4 w-4" /> Đánh giá người bán
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <DisputeModal
                isOpen={disputeModalOpen}
                onClose={() => setDisputeModalOpen(false)}
                onSubmit={handleDisputeSubmit}
                orderId={selectedOrderId || ''}
            />
        </div>
    );
}
