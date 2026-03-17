import { Outlet } from 'react-router-dom';
import { Sidebar, adminNavItems } from '@/components/dashboard/Sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell, User, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.HOME);
    };

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
                        <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                                3
                            </span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar ?? undefined} />
                                        <AvatarFallback className="text-sm">{(user?.firstName || user?.email)?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name || user?.email}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                                    <User className="mr-2 h-4 w-4" />
                                    Trang cá nhân
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(ROUTES.HOME)}>
                                    <Home className="mr-2 h-4 w-4" />
                                    Về trang mua bán
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
