import { ClipboardCheck, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

const stats = [
    { title: 'Yêu cầu chờ xử lý', value: '5', icon: Clock, trend: { value: 2, isPositive: false } },
    { title: 'Đã kiểm định tuần này', value: '12', icon: ClipboardCheck, trend: { value: 20, isPositive: true } },
    { title: 'Xe đạt chuẩn', value: '89%', icon: CheckCircle },
    { title: 'Điểm đánh giá', value: '4.8', icon: TrendingUp },
];

const recentInspections = [
    { id: '1', bike: 'Giant TCR Advanced Pro', seller: 'Nguyễn Văn A', result: 'passed', time: '2 giờ trước' },
    { id: '2', bike: 'Trek Madone SLR 9', seller: 'Trần Thị B', result: 'passed', time: '1 ngày trước' },
    { id: '3', bike: 'Specialized Stumpjumper', seller: 'Lê Văn C', result: 'failed', time: '2 ngày trước' },
];

export default function InspectorDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Tổng quan</h2>
                <p className="text-muted-foreground">Xin chào! Đây là tổng quan hoạt động kiểm định của bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Kiểm định gần đây</h3>
                </div>
                <div className="divide-y divide-border">
                    {recentInspections.map((inspection) => (
                        <div key={inspection.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div>
                                <p className="font-medium text-foreground">{inspection.bike}</p>
                                <p className="text-xs text-muted-foreground">Người bán: {inspection.seller}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-medium ${inspection.result === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                                    {inspection.result === 'passed' ? 'Đạt' : 'Không đạt'}
                                </span>
                                <span className="text-xs text-muted-foreground">{inspection.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
