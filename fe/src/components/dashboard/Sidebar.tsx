import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    Flag,
    Tags,
    Scale,
    ClipboardCheck,
    History,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
}

interface SidebarProps {
    items: NavItem[];
    title?: string;
}

export function Sidebar({ items, title = 'Dashboard' }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside
            className={cn(
                'flex flex-col h-screen bg-card border-r border-border transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                {!collapsed && (
                    <span className="font-semibold text-lg text-foreground truncate">
                        {title}
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-2">
                    {items.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer',
                                        'hover:bg-muted',
                                        isActive && 'bg-primary/10 text-primary font-medium',
                                        collapsed && 'justify-center'
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {!collapsed && (
                                        <span className="truncate">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}

// Pre-configured admin navigation items
export const adminNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Tổng quan', href: '/admin' },
    { icon: Users, label: 'Người dùng', href: '/admin/users' },
    { icon: FileText, label: 'Tin đăng', href: '/admin/listings' },
    { icon: Flag, label: 'Báo cáo', href: '/admin/reports' },
    { icon: Tags, label: 'Danh mục', href: '/admin/categories' },
    { icon: Scale, label: 'Tranh chấp', href: '/admin/disputes' },
];

// Pre-configured inspector navigation items
export const inspectorNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Tổng quan', href: '/inspector' },
    { icon: ClipboardCheck, label: 'Yêu cầu kiểm định', href: '/inspector/requests' },
    { icon: History, label: 'Lịch sử', href: '/inspector/history' },
];
