import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Camera, Settings, LogOut, Heart, Package, Star, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const userData = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    address: 'Quận 1, Hồ Chí Minh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    memberSince: 'Tháng 3, 2024',
    rating: 4.8,
    reviewCount: 23,
    verified: true,
}

const tabs = [
    { id: 'profile', label: 'Thông tin', icon: User },
    { id: 'listings', label: 'Tin đăng', icon: Package },
    { id: 'wishlist', label: 'Yêu thích', icon: Heart },
    { id: 'reviews', label: 'Đánh giá', icon: Star },
]

const myListings = [
    { id: 1, name: 'Giant TCR Advanced Pro', price: 25000000, status: 'active', views: 234, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=200' },
    { id: 2, name: 'Trek Domane SL5', price: 28000000, status: 'sold', views: 156, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200' },
]

const wishlistItems = [
    { id: 3, name: 'Specialized Tarmac SL6', price: 35000000, location: 'Hà Nội', image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=200' },
    { id: 4, name: 'Canyon Ultimate CF SL', price: 32000000, location: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=200' },
]

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price)
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('profile')
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
    })

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/90 to-primary py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-white">
                                <AvatarImage src={userData.avatar} />
                                <AvatarFallback className="text-2xl">{userData.name[0]}</AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
                                {userData.verified && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Shield className="h-3 w-3" /> Đã xác thực
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-white/90 justify-center md:justify-start">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{userData.rating}</span>
                                <span className="text-white/70">({userData.reviewCount} đánh giá)</span>
                            </div>
                            <p className="mt-1 text-sm text-white/70">Thành viên từ {userData.memberSince}</p>
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
                                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
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
                                    <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={() => setIsEditing(!isEditing)}>
                                        {isEditing ? 'Lưu' : 'Chỉnh sửa'}
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" /> Họ và tên
                                            </label>
                                            <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} disabled={!isEditing} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" /> Email
                                            </label>
                                            <Input value={userData.email} disabled />
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
