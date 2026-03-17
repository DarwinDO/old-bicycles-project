import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Camera, Settings, LogOut, Heart, Package, Star, Shield, ShoppingBag, Lock, AlertCircle, Check, Eye, EyeOff, Pencil, Trash2, Loader2, PlusCircle } from 'lucide-react'
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
import { wishlistApi } from '@/api/wishlist.api'
import { productsApi } from '@/api/products.api'
import type { WishlistItem } from '@/types/wishlist'
import type { Product } from '@/types/product'
import { buildRoute } from '@/constants/routes'

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price)
}



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

    // Wishlist state
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
    const [wishlistLoading, setWishlistLoading] = useState(false)
    const [removingWishlistId, setRemovingWishlistId] = useState<string | null>(null)

    // Listings state
    const [listings, setListings] = useState<Product[]>([])
    const [listingsLoading, setListingsLoading] = useState(false)
    const [togglingId, setTogglingId] = useState<string | null>(null)

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

    // Load wishlist when tab is opened
    useEffect(() => {
        if (activeTab !== 'wishlist') return
        setWishlistLoading(true)
        wishlistApi.getMine()
            .then(setWishlistItems)
            .catch(() => {})
            .finally(() => setWishlistLoading(false))
    }, [activeTab])

    const handleRemoveWishlist = async (productId: string) => {
        setRemovingWishlistId(productId)
        try {
            await wishlistApi.remove(productId)
            setWishlistItems((prev) => prev.filter((item) => item.productId !== productId))
        } catch {
            // silent
        } finally {
            setRemovingWishlistId(null)
        }
    }

    // Load listings when tab opened
    useEffect(() => {
        if (activeTab !== 'listings') return
        setListingsLoading(true)
        productsApi.getMine(0, 20)
            .then((res) => setListings(res.content))
            .catch(() => {})
            .finally(() => setListingsLoading(false))
    }, [activeTab])

    const handleToggleVisibility = async (item: Product) => {
        setTogglingId(item.id)
        try {
            if (item.status === 'active') {
                await productsApi.hide(item.id)
                setListings(prev => prev.map(p => p.id === item.id ? { ...p, status: 'hidden' as const } : p))
            } else {
                await productsApi.show(item.id)
                setListings(prev => prev.map(p => p.id === item.id ? { ...p, status: 'pending' as const } : p))
            }
        } catch {
            // silent
        } finally {
            setTogglingId(null)
        }
    }

    const handleDeleteListing = async (id: string) => {
        if (!window.confirm('Xóa tin này? Bạn không thể hoàn tác sau khi xóa.')) return
        try {
            await productsApi.delete(id)
            setListings(prev => prev.filter(p => p.id !== id))
        } catch {
            // silent
        }
    }

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
                                <AvatarImage src={user.avatar ?? undefined} />
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
                                        <Link to={ROUTES.SELL}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Đăng tin mới
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {listingsLoading ? (
                                        <div className="py-8 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                                        </div>
                                    ) : listings.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground">Chưa có tin đăng nào.</p>
                                            <Button asChild variant="outline" className="mt-4" size="sm">
                                                <Link to={ROUTES.SELL}>Đăng tin đầu tiên</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {listings.map((item) => {
                                                const thumb = item.images?.find(i => i.isPrimary)?.url ?? item.images?.[0]?.url
                                                const isActive = item.status === 'active'
                                                const isToggling = togglingId === item.id
                                                return (
                                                    <div key={item.id} className="flex gap-4 p-4 rounded-lg border hover:border-primary/30 transition-colors">
                                                        {/* Thumbnail */}
                                                        <Link to={buildRoute.bikeDetail(item.id)} className="shrink-0">
                                                            {thumb ? (
                                                                <img src={thumb} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                                                            ) : (
                                                                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </Link>
                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <Link to={buildRoute.bikeDetail(item.id)}>
                                                                <h3 className="font-semibold hover:text-primary line-clamp-1">{item.title}</h3>
                                                            </Link>
                                                            <p className="text-primary font-bold mt-0.5">{formatPrice(item.price)}</p>
                                                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                                                <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                                                                    {isActive ? 'Đang hiển thị' : item.status === 'hidden' ? 'Đã ẩn' : item.status === 'sold' ? 'Đã bán' : item.status === 'pending' ? 'Chờ duyệt' : item.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-1.5 shrink-0">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-2 text-xs"
                                                            >
                                                                <Link to={buildRoute.sellerEditProduct(item.id)}>
                                                                    <Pencil className="h-3.5 w-3.5 mr-1" />
                                                                    Sửa
                                                                </Link>
                                                            </Button>
                                                            {item.status !== 'sold' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-2 text-xs"
                                                                    onClick={() => handleToggleVisibility(item)}
                                                                    disabled={isToggling}
                                                                >
                                                                    {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isActive ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                                                                    {isActive ? 'Ẩn' : 'Hiện'}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDeleteListing(item.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                                Xóa
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'wishlist' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Xe yêu thích</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {wishlistLoading ? (
                                        <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
                                    ) : wishlistItems.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground">Chưa có xe nào được lưu.</p>
                                            <Button asChild variant="outline" className="mt-4" size="sm">
                                                <Link to="/market">Xem xe đạp</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {wishlistItems.map((item) => (
                                                <div key={item.productId} className="flex gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors">
                                                    <Link to={`/bikes/${item.productId}`} className="shrink-0">
                                                        {item.primaryImageUrl ? (
                                                            <img src={item.primaryImageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                                                        ) : (
                                                            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                                                                <Heart className="h-6 w-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </Link>
                                                    <div className="flex-1 min-w-0">
                                                        <Link to={`/bikes/${item.productId}`}>
                                                            <h3 className="font-semibold hover:text-primary line-clamp-2 leading-tight">{item.title}</h3>
                                                        </Link>
                                                        <p className="text-primary font-bold mt-1">{formatPrice(item.price)}</p>
                                                        <button
                                                            className="mt-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                                                            onClick={() => handleRemoveWishlist(item.productId)}
                                                            disabled={removingWishlistId === item.productId}
                                                        >
                                                            {removingWishlistId === item.productId ? 'Đang xóa...' : '✕ Bỏ lưu'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
