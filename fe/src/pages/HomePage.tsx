import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Shield, Award, Users, ArrowRight, Bike, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'

const featuredBikes = [
    {
        id: 1,
        name: 'Giant TCR Advanced Pro',
        price: 25000000,
        location: 'Hồ Chí Minh',
        condition: 'Như mới',
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
        verified: true
    },
    {
        id: 2,
        name: 'Specialized Tarmac SL6',
        price: 35000000,
        location: 'Hà Nội',
        condition: 'Đã qua sử dụng',
        image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400',
        verified: false
    },
    {
        id: 3,
        name: 'Trek Domane SL5',
        price: 28000000,
        location: 'Đà Nẵng',
        condition: 'Tốt',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
        verified: true
    },
    {
        id: 4,
        name: 'Canyon Ultimate CF SL',
        price: 32000000,
        location: 'Hồ Chí Minh',
        condition: 'Như mới',
        image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400',
        verified: false
    },
]

const categories = [
    { name: 'Xe Đua Đường Trường', count: 156, icon: '🚴', href: ROUTES.MARKET },
    { name: 'Xe Địa Hình MTB', count: 203, icon: '🚵', href: ROUTES.MARKET },
    { name: 'Xe Touring', count: 89, icon: '🚲', href: ROUTES.MARKET },
    { name: 'Xe Gravel', count: 67, icon: '🛤️', href: ROUTES.MARKET },
]

const trustFeatures = [
    {
        icon: Shield,
        title: 'Giao Dịch An Toàn',
        description: 'Đảm bảo thông tin minh bạch, xác thực người dùng'
    },
    {
        icon: Award,
        title: 'Chất Lượng Đảm Bảo',
        description: 'Kiểm định xe đạp kỹ thuật, đánh giá chuyên nghiệp'
    },
    {
        icon: Users,
        title: 'Cộng Đồng Lớn',
        description: 'Kết nối hàng ngàn người đam mê xe đạp'
    },
]

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(price)
}

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [location, setLocation] = useState('')
    const navigate = useNavigate()

    const handleSearch = () => {
        navigate(`${ROUTES.MARKET}?q=${searchQuery}&location=${location}`)
    }

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/90 via-primary to-primary/80 dark:from-primary/80 dark:via-primary/70 dark:to-primary/60">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1920')] bg-cover bg-center opacity-10" />
                <div className="container relative mx-auto px-4 py-20 md:py-28">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                            Nền Tảng Mua Bán Xe Đạp Thể Thao Cũ Uy Tín
                        </h1>
                        <p className="mt-6 text-lg text-white/90 md:text-xl">
                            Kết nối người mua và người bán xe đạp thể thao đã qua sử dụng một cách an toàn, minh bạch và chuyên nghiệp
                        </p>

                        {/* Search Box */}
                        <Card className="mt-10 p-2">
                            <CardContent className="p-0">
                                <div className="flex flex-col gap-2 md:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Tìm kiếm xe đạp (thương hiệu, model...)"
                                            className="h-12 pl-10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <div className="relative md:w-48">
                                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Địa điểm"
                                            className="h-12 pl-10"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                    <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
                                        <Search className="mr-2 h-4 w-4" />
                                        Tìm kiếm
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/90">
                            <div className="text-center">
                                <div className="text-2xl font-bold">1,500+</div>
                                <div className="text-sm">Xe đang bán</div>
                            </div>
                            <div className="h-8 w-px bg-white/30" />
                            <div className="text-center">
                                <div className="text-2xl font-bold">5,000+</div>
                                <div className="text-sm">Thành viên</div>
                            </div>
                            <div className="h-8 w-px bg-white/30" />
                            <div className="text-center">
                                <div className="text-2xl font-bold">2,000+</div>
                                <div className="text-sm">Giao dịch thành công</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Features */}
            <section className="border-b bg-muted/40 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-3">
                        {trustFeatures.map((feature) => (
                            <div key={feature.title} className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Bikes */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Xe Đạp Nổi Bật</h2>
                            <p className="mt-1 text-muted-foreground">Những chiếc xe đạp được quan tâm nhiều nhất</p>
                        </div>
                        <Button variant="ghost" asChild className="hidden md:inline-flex">
                            <Link to={ROUTES.MARKET}>
                                Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredBikes.map((bike) => (
                            <Link key={bike.id} to={`/bikes/${bike.id}`}>
                                <Card className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={bike.image}
                                            alt={bike.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute left-3 top-3 flex gap-2">
                                            <Badge variant="success">{bike.condition}</Badge>
                                            {bike.verified && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Shield className="h-3 w-3" /> Đã kiểm định
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                            {bike.name}
                                        </h3>
                                        <p className="mt-2 text-lg font-bold text-primary">
                                            {formatPrice(bike.price)}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="border-t px-4 py-3">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {bike.location}
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Button variant="outline" asChild>
                            <Link to={ROUTES.MARKET}>
                                Xem tất cả xe đạp <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="bg-muted/40 py-16">
                <div className="container mx-auto px-4">
                    <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
                        Danh Mục Xe Đạp
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.map((category) => (
                            <Link key={category.name} to={category.href}>
                                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <span className="text-4xl">{category.icon}</span>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{category.count} xe đang bán</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-secondary/90 to-secondary py-16">
                <div className="container mx-auto px-4 text-center">
                    <div className="mx-auto max-w-2xl">
                        <Bike className="mx-auto h-12 w-12 text-white/90" />
                        <h2 className="mt-6 text-2xl font-bold text-white md:text-3xl">
                            Bạn muốn bán xe đạp của mình?
                        </h2>
                        <p className="mt-4 text-lg text-white/90">
                            Đăng tin miễn phí, tiếp cận hàng nghìn người mua tiềm năng
                        </p>
                        <Button
                            size="lg"
                            variant="outline"
                            className="mt-8 bg-white text-secondary hover:bg-white/90 border-white"
                            onClick={() => navigate(ROUTES.SELL)}
                        >
                            Đăng tin bán xe ngay <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
