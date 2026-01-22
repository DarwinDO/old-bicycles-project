import { Users, FileText, Flag, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

// Mock data for demo
const stats = [
    {
        title: 'Tổng người dùng',
        value: '2,847',
        icon: Users,
        trend: { value: 12, isPositive: true },
    },
    {
        title: 'Tin đăng đang chờ',
        value: '23',
        icon: FileText,
        trend: { value: 5, isPositive: false },
    },
    {
        title: 'Báo cáo chưa xử lý',
        value: '8',
        icon: Flag,
    },
    {
        title: 'Doanh thu tháng',
        value: '45.2M đ',
        icon: DollarSign,
        trend: { value: 18, isPositive: true },
    },
];

const recentActivities = [
    { id: 1, action: 'Người dùng mới đăng ký', user: 'Nguyễn Văn A', time: '5 phút trước' },
    { id: 2, action: 'Tin đăng mới cần duyệt', user: 'Trần Thị B', time: '12 phút trước' },
    { id: 3, action: 'Báo cáo vi phạm mới', user: 'Lê Văn C', time: '25 phút trước' },
    { id: 4, action: 'Giao dịch hoàn tất', user: 'Phạm Thị D', time: '1 giờ trước' },
    { id: 5, action: 'Yêu cầu kiểm định mới', user: 'Hoàng Văn E', time: '2 giờ trước' },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">Tổng quan</h2>
                <p className="text-muted-foreground">Xin chào! Đây là tổng quan hoạt động hệ thống.</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Recent activity */}
            <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Hoạt động gần đây</h3>
                </div>
                <div className="divide-y divide-border">
                    {recentActivities.map((activity) => (
                        <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div>
                                <p className="text-sm font-medium text-foreground">{activity.action}</p>
                                <p className="text-xs text-muted-foreground">{activity.user}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick stats charts placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-4">Người dùng đăng ký theo tuần</h3>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-primary" />
                            <p className="text-sm">Biểu đồ sẽ hiển thị ở đây</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-4">Giao dịch theo tháng</h3>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <TrendingDown className="h-12 w-12 mx-auto mb-2 text-secondary" />
                            <p className="text-sm">Biểu đồ sẽ hiển thị ở đây</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
