import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Shield, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, Star, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const bikeData = {
    id: 1,
    name: 'Giant TCR Advanced Pro 2023',
    price: 25000000,
    originalPrice: 35000000,
    location: 'Quận 1, Hồ Chí Minh',
    condition: 'Như mới',
    verified: true,
    postedAt: '2 ngày trước',
    views: 234,
    description: `Xe đạp đua Giant TCR Advanced Pro phiên bản 2023, đã đi được khoảng 500km.

Thông tin chi tiết:
- Khung carbon Advanced-Grade Composite
- Bộ truyền động Shimano Ultegra R8000 22 tốc độ
- Phanh đĩa thủy lực Shimano
- Bánh xe Giant SLR 1 42mm Carbon
- Yên xe Fizik Antares R3
- Cổ phuộc carbon

Lý do bán: Upgrade lên xe khác.
Xe được bảo quản cẩn thận, không đâm đổ, không trầy xước.
Có đầy đủ hóa đơn và giấy tờ.`,
    images: [
        'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
        'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800',
    ],
    specs: {
        brand: 'Giant',
        model: 'TCR Advanced Pro',
        year: 2023,
        category: 'Road Bike',
        frameSize: 'M (54cm)',
        frameMaterial: 'Carbon',
        wheelSize: '700c',
        groupset: 'Shimano Ultegra R8000',
        brakeType: 'Đĩa thủy lực',
        weight: '7.8 kg',
    },
    seller: {
        id: 1,
        name: 'Nguyễn Văn A',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 4.8,
        reviewCount: 23,
        responseRate: '95%',
        memberSince: 'Tháng 3, 2024',
        totalListings: 5,
    },
    inspection: {
        date: '15/01/2026',
        inspector: 'Bike Pro Shop',
        overallScore: 9.2,
        frameScore: 10,
        groupsetScore: 9,
        wheelScore: 9,
        brakeScore: 9,
        notes: 'Xe trong tình trạng rất tốt, không có dấu hiệu hư hỏng hay đâm đổ. Groupset hoạt động trơn tru.'
    }
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(price)
}

export default function BikeDetailPage() {
    const { id: _id } = useParams()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isWishlisted, setIsWishlisted] = useState(false)

    const bike = bikeData // In real app, fetch by id

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % bike.images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + bike.images.length) % bike.images.length)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-muted/40">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link to={ROUTES.HOME} className="hover:text-foreground">Trang chủ</Link>
                        <span>/</span>
                        <Link to={ROUTES.MARKET} className="hover:text-foreground">Mua xe</Link>
                        <span>/</span>
                        <span className="text-foreground">{bike.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Images & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <Card className="overflow-hidden">
                            <div className="relative aspect-[4/3] bg-muted">
                                <img
                                    src={bike.images[currentImageIndex]}
                                    alt={bike.name}
                                    className="h-full w-full object-cover"
                                />
                                {bike.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}
                                <div className="absolute left-4 top-4 flex gap-2">
                                    <Badge variant="success">{bike.condition}</Badge>
                                    {bike.verified && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Shield className="h-3 w-3" /> Đã kiểm định
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {/* Thumbnails */}
                            <div className="flex gap-2 p-4 overflow-x-auto">
                                {bike.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={cn(
                                            "h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                                            idx === currentImageIndex ? "border-primary" : "border-transparent"
                                        )}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mô tả</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line text-muted-foreground">{bike.description}</p>
                            </CardContent>
                        </Card>

                        {/* Specifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông số kỹ thuật</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {Object.entries({
                                        'Thương hiệu': bike.specs.brand,
                                        'Model': bike.specs.model,
                                        'Năm sản xuất': bike.specs.year,
                                        'Loại xe': bike.specs.category,
                                        'Size khung': bike.specs.frameSize,
                                        'Chất liệu khung': bike.specs.frameMaterial,
                                        'Size bánh': bike.specs.wheelSize,
                                        'Bộ truyền động': bike.specs.groupset,
                                        'Loại phanh': bike.specs.brakeType,
                                        'Trọng lượng': bike.specs.weight,
                                    }).map(([label, value]) => (
                                        <div key={label} className="flex justify-between py-2 border-b last:border-0">
                                            <span className="text-muted-foreground">{label}</span>
                                            <span className="font-medium text-foreground">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inspection Report */}
                        {bike.verified && bike.inspection && (
                            <Card className="border-primary/50">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        <CardTitle>Báo cáo kiểm định</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Kiểm định bởi</span>
                                        <span className="font-medium">{bike.inspection.inspector}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Ngày kiểm định</span>
                                        <span className="font-medium">{bike.inspection.date}</span>
                                    </div>
                                    <Separator />
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-primary">{bike.inspection.overallScore}/10</div>
                                        <div className="text-sm text-muted-foreground">Điểm tổng thể</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Khung xe</span>
                                            <span className="font-medium">{bike.inspection.frameScore}/10</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Truyền động</span>
                                            <span className="font-medium">{bike.inspection.groupsetScore}/10</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Bánh xe</span>
                                            <span className="font-medium">{bike.inspection.wheelScore}/10</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Phanh</span>
                                            <span className="font-medium">{bike.inspection.brakeScore}/10</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium mb-2">Ghi chú</div>
                                        <p className="text-sm text-muted-foreground">{bike.inspection.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Price & Seller */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                <h1 className="text-xl font-bold text-foreground">{bike.name}</h1>

                                <div className="mt-4">
                                    <div className="text-3xl font-bold text-primary">{formatPrice(bike.price)}</div>
                                    {bike.originalPrice > bike.price && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-muted-foreground line-through text-sm">
                                                {formatPrice(bike.originalPrice)}
                                            </span>
                                            <Badge variant="secondary">
                                                -{Math.round((1 - bike.price / bike.originalPrice) * 100)}%
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {bike.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {bike.postedAt}
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div className="space-y-3">
                                    <Button className="w-full" size="lg">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Chat với người bán
                                    </Button>
                                    <Button variant="secondary" className="w-full" size="lg">
                                        Đặt cọc ngay
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setIsWishlisted(!isWishlisted)}
                                        >
                                            <Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-current text-red-500")} />
                                            {isWishlisted ? 'Đã lưu' : 'Lưu tin'}
                                        </Button>
                                        <Button variant="outline" className="flex-1">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Chia sẻ
                                        </Button>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Seller Info */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage src={bike.seller.avatar} />
                                        <AvatarFallback>{bike.seller.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-semibold text-foreground">{bike.seller.name}</div>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{bike.seller.rating}</span>
                                            <span className="text-muted-foreground">({bike.seller.reviewCount} đánh giá)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Phản hồi</div>
                                        <div className="font-medium">{bike.seller.responseRate}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Thành viên từ</div>
                                        <div className="font-medium">{bike.seller.memberSince}</div>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full mt-4" asChild>
                                    <Link to={`/seller/${bike.seller.id}`}>
                                        Xem trang người bán
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Safety Tips */}
                        <Card className="bg-muted/50">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-foreground">Mua bán an toàn</div>
                                        <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                                            <li>• Kiểm tra xe kỹ trước khi mua</li>
                                            <li>• Gặp mặt trực tiếp tại nơi công cộng</li>
                                            <li>• Không chuyển tiền trước khi xem xe</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
