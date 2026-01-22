import { Outlet } from 'react-router-dom';
import { Sidebar, adminNavItems } from '@/components/dashboard/Sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <Sidebar items={adminNavItems} title="Admin" />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
                    <h1 className="text-lg font-semibold text-foreground">
                        Quản trị hệ thống
                    </h1>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                                3
                            </span>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
