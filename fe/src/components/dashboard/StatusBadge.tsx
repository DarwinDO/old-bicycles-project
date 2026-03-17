import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant =
    | 'pending'
    | 'active'
    | 'hidden'
    | 'pending_inspection'
    | 'inspected_passed'
    | 'inspected_failed'
    | 'banned'
    | 'sold'
    | 'verified'
    | 'rejected'
    | 'completed';

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
    hidden: {
        label: 'Đã ẩn',
        className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
    },
    pending_inspection: {
        label: 'Chờ kiểm định',
        className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    },
    inspected_passed: {
        label: 'Đạt kiểm định',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    inspected_failed: {
        label: 'Không đạt kiểm định',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
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
