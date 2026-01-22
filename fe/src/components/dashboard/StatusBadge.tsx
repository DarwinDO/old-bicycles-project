import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StatusVariant = 'pending' | 'active' | 'banned' | 'sold' | 'verified' | 'rejected' | 'completed';

interface StatusBadgeProps {
    status: StatusVariant;
    className?: string;
}

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
    pending: {
        label: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    active: {
        label: 'Hoạt động',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    banned: {
        label: 'Bị khóa',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    sold: {
        label: 'Đã bán',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    },
    verified: {
        label: 'Đã kiểm định',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    rejected: {
        label: 'Từ chối',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    completed: {
        label: 'Hoàn tất',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge variant="secondary" className={cn(config.className, className)}>
            {config.label}
        </Badge>
    );
}
