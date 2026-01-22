import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
    return (
        <div
            className={cn(
                'bg-card border border-border rounded-lg p-5 transition-shadow hover:shadow-md',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    {trend && (
                        <p
                            className={cn(
                                'text-xs font-medium',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            <span className="text-muted-foreground ml-1">so với tuần trước</span>
                        </p>
                    )}
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </div>
        </div>
    );
}
