import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bike, Plus, User, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Trang chủ', href: ROUTES.HOME },
    { name: 'Mua xe', href: ROUTES.MARKET },
    { name: 'Bán xe', href: ROUTES.SELL },
    { name: 'Hướng dẫn', href: ROUTES.GUIDE },
]

export default function AppHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path: string) => {
        if (path === ROUTES.HOME) return location.pathname === path
        return location.pathname.startsWith(path)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to={ROUTES.HOME} className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Bike className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">BikeExchange</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:gap-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                isActive(item.href)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex md:items-center md:gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Đăng nhập
                    </Button>
                    <Button size="sm" onClick={() => navigate(ROUTES.SELL)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Đăng tin
                    </Button>
                </div>

                {/* Mobile Menu */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                        <Bike className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                    BikeExchange
                                </SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 flex flex-col gap-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors",
                                            isActive(item.href)
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="my-4 h-px bg-border" />
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    onClick={() => {
                                        navigate(ROUTES.LOGIN)
                                        setMobileMenuOpen(false)
                                    }}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Đăng nhập
                                </Button>
                                <Button
                                    className="justify-start"
                                    onClick={() => {
                                        navigate(ROUTES.SELL)
                                        setMobileMenuOpen(false)
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Đăng tin bán xe
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    )
}
