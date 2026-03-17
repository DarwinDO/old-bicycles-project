import { StatCard } from '@/components/dashboard/StatCard';
import { Package, ShoppingBag, Eye, TrendingUp } from 'lucide-react';

export default function SellerDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Tổng quan cửa hàng</h2>
                <p className="text-muted-foreground">
                    Theo dõi hoạt động kinh doanh và tương tác với tin đăng của bạn.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Đơn cọc chờ xử lý"
                    value="3"
                    icon={ShoppingBag}
                    description="Cần xác nhận ngay"
                    trend={{ value: 1, isPositive: true }}
                />
                <StatCard
                    title="Tin đang bật"
                    value="12"
                    icon={Package}
                    description="2 tin đang chờ duyệt"
                />
                <StatCard
                    title="Lượt xem tuần này"
                    value="845"
                    icon={Eye}
                    trend={{ value: 12.5, isPositive: true }}
                    description="Tuyệt vời, tăng trưởng tốt!"
                />
                <StatCard
                    title="Tỷ lệ chuyển đổi"
                    value="4.2%"
                    icon={TrendingUp}
                    trend={{ value: 0.8, isPositive: true }}
                    description="So với tháng trước"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Space for future charts/latest orders view */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-lg font-medium">Hoạt động gần đây</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground border-dashed border-2 rounded-md">
                            Khu vực biểu đồ (Đang phát triển)
                        </div>
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-lg font-medium">Việc cần làm ngay</h3>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Minh đã đặt cọc xe Giant OCR</p>
                                <p className="text-sm text-muted-foreground">2 giờ trước - Chờ bạn xác nhận</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Thảo đã nhận được xe (Completed)</p>
                                <p className="text-sm text-muted-foreground">Tiền đã được chuyển vào ví</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
