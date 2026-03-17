import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Camera, Settings, LogOut, Heart, Package, Star, Shield, ShoppingBag, Lock, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { BuyerOrdersView } from '@/components/profile/BuyerOrdersView'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price)
}

const myListings = [
    { id: 1, name: 'Giant TCR Advanced Pro', price: 25000000, status: 'active', views: 234, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=200' },
    { id: 2, name: 'Trek Domane SL5', price: 28000000, status: 'sold', views: 156, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200' },
]

const wishlistItems = [
    { id: 3, name: 'Specialized Tarmac SL6', price: 35000000, location: 'Hà Nội', image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=200' },
    { id: 4, name: 'Canyon Ultimate CF SL', price: 32000000, location: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=200' },
]

const tabs = [
    { id: 'profile', label: 'Thông tin', icon: User },
    { id: 'orders', label: 'Đơn mua', icon: ShoppingBag },
    { id: 'listings', label: 'Tin đăng', icon: Package },
    { id: 'wishlist', label: 'Yêu thích', icon: Heart },
    { id: 'reviews', label: 'Đánh giá', icon: Star },
    { id: 'security', label: 'Bảo mật', icon: Lock },
]

export default function ProfilePage() {
    const { user, logout, setUser } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [isEditing, setIsEditing] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)
    const [profileSuccess, setProfileSuccess] = useState(false)

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        address: user?.address || '',
    })

    // Sync form when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || '',
            })
        }
    }, [user])

    // Change password state
    const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    const [pwLoading, setPwLoading] = useState(false)
    const [pwError, setPwError] = useState<string | null>(null)
    const [pwSuccess, setPwSuccess] = useState(false)

    const handleSaveProfile = async () => {
        setProfileError(null)
        setProfileSuccess(false)
        setProfileLoading(true)
        try {
            const updated = await authService.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                defaultAddress: formData.address,
            })
            setUser({ ...user!, ...updated })
            setIsEditing(false)
            setProfileSuccess(true)
            setTimeout(() => setProfileSuccess(false), 3000)
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Cập nhật thất bại. Vui lòng thử lại.'
            setProfileError(message)
        } finally {
            setProfileLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate(ROUTES.HOME)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (pwData.newPassword !== pwData.confirmNewPassword) {
            setPwError('Mật khẩu mới xác nhận không khớp.')
            return
        }
        setPwError(null)
        setPwSuccess(false)
        setPwLoading(true)
        try {
            await authService.changePassword({
                currentPassword: pwData.currentPassword,
                newPassword: pwData.newPassword,
            })
            setPwSuccess(true)
            setPwData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Đổi mật khẩu thất bại. Vui lòng thử lại.'
            setPwError(message)
        } finally {
            setPwLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/90 to-primary py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-white">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-2xl">{(user.firstName || user.email)?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <h1 className="text-2xl font-bold text-white">{user.name || user.email}</h1>
                                {user.verified && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Shield className="h-3 w-3" /> Đã xác thực
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-white/80">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar */}
                    <aside className="lg:w-64 shrink-0">
                        <Card>
                            <CardContent className="p-2">
                                <nav className="space-y-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                                activeTab === tab.id
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                        >
                                            <tab.icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                    <Separator className="my-2" />
                                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                        <Settings className="h-4 w-4" />
                                        Cài đặt
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Đăng xuất
                                    </button>
                                </nav>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Thông tin cá nhân</CardTitle>
                                    {!isEditing ? (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                            Chỉnh sửa
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setProfileError(null) }}>
                                                Hủy
                                            </Button>
                                            <Button size="sm" onClick={handleSaveProfile} disabled={profileLoading}>
                                                {profileLoading ? 'Đang lưu...' : 'Lưu'}
                                            </Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {profileError && (
                                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            {profileError}
                                        </div>
                                    )}
                                    {profileSuccess && (
                                        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 px-4 py-3 text-sm text-green-600">
                                            <Check className="h-4 w-4 shrink-0" />
                                            Cập nhật thông tin thành công!
                                        </div>
                                    )}
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" /> Họ
                                            </label>
                                            <Input value={formData.firstName} onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))} disabled={!isEditing} placeholder="Nguyễn" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" /> Tên
                                            </label>
                                            <Input value={formData.lastName} onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))} disabled={!isEditing} placeholder="Văn A" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" /> Email
                                            </label>
                                            <Input value={user.email} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" /> Số điện thoại
                                            </label>
                                            <Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} disabled={!isEditing} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" /> Địa chỉ
                                            </label>
                                            <Input value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} disabled={!isEditing} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'security' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Đổi mật khẩu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                        {pwError && (
                                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                {pwError}
                                            </div>
                                        )}
                                        {pwSuccess && (
                                            <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 px-4 py-3 text-sm text-green-600">
                                                <Check className="h-4 w-4 shrink-0" />
                                                Đổi mật khẩu thành công!
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                                            <Input
                                                type="password"
                                                value={pwData.currentPassword}
                                                onChange={(e) => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Mật khẩu mới</label>
                                            <Input
                                                type="password"
                                                value={pwData.newPassword}
                                                onChange={(e) => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                                            <Input
                                                type="password"
                                                value={pwData.confirmNewPassword}
                                                onChange={(e) => setPwData(p => ({ ...p, confirmNewPassword: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={pwLoading}>
                                            {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'orders' && <BuyerOrdersView />}

                        {activeTab === 'listings' && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Tin đăng của tôi</CardTitle>
                                    <Button size="sm" asChild>
                                        <Link to={ROUTES.SELL}>Đăng tin mới</Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {myListings.map((item) => (
                                            <div key={item.id} className="flex gap-4 p-4 rounded-lg border">
                                                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                                                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                                            {item.status === 'active' ? 'Đang hiển thị' : 'Đã bán'}
                                                        </Badge>
                                                        <span>{item.views} lượt xem</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'wishlist' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Xe yêu thích</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {wishlistItems.map((item) => (
                                            <Link key={item.id} to={`/bikes/${item.id}`} className="flex gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors">
                                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                                                <div>
                                                    <h3 className="font-semibold hover:text-primary">{item.name}</h3>
                                                    <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                        <MapPin className="h-3 w-3" /> {item.location}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'reviews' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Đánh giá từ người mua</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-muted-foreground">
                                        Chưa có đánh giá nào
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
