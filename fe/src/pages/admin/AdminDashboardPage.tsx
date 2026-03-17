import { useEffect, useState } from 'react';
import { Users, FileText, Flag, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { dashboardApi } from '@/api/dashboard.api';
import type { DashboardStats } from '@/types/dashboard';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        dashboardApi.getStats()
            .then(setStats)
            .catch(() => setError('Không thể tải dữ liệu thống kê.'))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (value: number) => {
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M đ`;
        if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K đ`;
        return `${value} đ`;
    };

    const currentMonthlyRevenue = stats?.monthlyRevenue 
        ? Object.values(stats.monthlyRevenue).reduce((a, b) => a + b, 0)
        : 0;
        
    const currentMonthlyOrders = stats?.monthlyOrders
        ? Object.values(stats.monthlyOrders).reduce((a, b) => a + b, 0)
        : 0;

    const statCards = stats
        ? [
              {
                  title: 'Tổng người dùng',
                  value: stats.totalUsers.toLocaleString('vi-VN'),
                  icon: Users,
              },
              {
                  title: 'Tổng sản phẩm',
                  value: stats.totalProducts.toLocaleString('vi-VN'),
                  icon: FileText,
              },
              {
                  title: 'Tổng đơn hàng',
                  value: stats.totalOrders.toLocaleString('vi-VN'),
                  icon: ShoppingCart,
              },
              {
                  title: 'Tổng doanh thu',
                  value: formatCurrency(stats.totalRevenue),
                  icon: DollarSign,
              },
          ]
        : [];

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">Tổng quan</h2>
                <p className="text-muted-foreground">Xin chào! Đây là tổng quan hoạt động hệ thống.</p>
            </div>

            {/* Stats grid */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse h-24" />
                    ))}
                </div>
            )}
            {error && (
                <div className="text-destructive bg-destructive/10 rounded-lg p-4 text-sm">{error}</div>
            )}
            {!loading && !error && stats && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((stat) => (
                            <StatCard key={stat.title} {...stat} />
                        ))}
                    </div>

                    {/* Inspection stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                            <h3 className="font-semibold text-foreground">Kiểm định xe</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tổng kiểm định</span>
                                    <span className="font-medium">{stats.totalInspections}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-500">Đạt</span>
                                    <span className="font-medium text-green-500">{stats.passedInspections}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-red-500">Không đạt</span>
                                    <span className="font-medium text-red-500">{stats.failedInspections}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Flag className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-foreground">Doanh thu tháng này</h3>
                            </div>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(currentMonthlyRevenue)}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-foreground">Đơn hàng tháng này</h3>
                            </div>
                            <p className="text-2xl font-bold text-primary">{currentMonthlyOrders}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
