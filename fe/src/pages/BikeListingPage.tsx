import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, SlidersHorizontal, Grid3X3, List, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const bikes = [
    { id: 1, name: 'Giant TCR Advanced Pro', price: 25000000, location: 'Hồ Chí Minh', condition: 'Như mới', category: 'Road', brand: 'Giant', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400', verified: true },
    { id: 2, name: 'Specialized Tarmac SL6', price: 35000000, location: 'Hà Nội', condition: 'Đã qua sử dụng', category: 'Road', brand: 'Specialized', image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400', verified: false },
    { id: 3, name: 'Trek Domane SL5', price: 28000000, location: 'Đà Nẵng', condition: 'Tốt', category: 'Road', brand: 'Trek', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400', verified: true },
    { id: 4, name: 'Canyon Ultimate CF SL', price: 32000000, location: 'Hồ Chí Minh', condition: 'Như mới', category: 'Road', brand: 'Canyon', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400', verified: false },
    { id: 5, name: 'Trek Marlin 7', price: 15000000, location: 'Hà Nội', condition: 'Tốt', category: 'MTB', brand: 'Trek', image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400', verified: true },
    { id: 6, name: 'Giant XTC Advanced', price: 42000000, location: 'Đà Nẵng', condition: 'Như mới', category: 'MTB', brand: 'Giant', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400', verified: false },
    { id: 7, name: 'Cannondale Topstone', price: 38000000, location: 'Hồ Chí Minh', condition: 'Đã qua sử dụng', category: 'Gravel', brand: 'Cannondale', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400', verified: true },
    { id: 8, name: 'Specialized Diverge', price: 29000000, location: 'Hà Nội', condition: 'Tốt', category: 'Gravel', brand: 'Specialized', image: 'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=400', verified: false },
]

const categories = ['Tất cả', 'Road', 'MTB', 'Gravel', 'Touring', 'City']
const brands = ['Giant', 'Trek', 'Specialized', 'Canyon', 'Cannondale', 'Bianchi']
const conditions = ['Như mới', 'Tốt', 'Đã qua sử dụng', 'Cần sửa chữa']

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(price)
}

interface FilterSectionProps {
    title: string
    children: React.ReactNode
}

function FilterSection({ title, children }: FilterSectionProps) {
    return (
        <div className="space-y-3">
            <h4 className="font-medium text-foreground">{title}</h4>
            {children}
        </div>
    )
}

export default function BikeListingPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedCategory, setSelectedCategory] = useState('Tất cả')
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [selectedConditions, setSelectedConditions] = useState<string[]>([])
    const [verifiedOnly, setVerifiedOnly] = useState(false)

    const toggleBrand = (brand: string) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        )
    }

    const toggleCondition = (condition: string) => {
        setSelectedConditions(prev =>
            prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
        )
    }

    const filteredBikes = bikes.filter(bike => {
        if (selectedCategory !== 'Tất cả' && bike.category !== selectedCategory) return false
        if (selectedBrands.length > 0 && !selectedBrands.includes(bike.brand)) return false
        if (selectedConditions.length > 0 && !selectedConditions.includes(bike.condition)) return false
        if (verifiedOnly && !bike.verified) return false
        if (searchQuery && !bike.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const activeFiltersCount = selectedBrands.length + selectedConditions.length + (verifiedOnly ? 1 : 0)

    const FilterContent = () => (
        <div className="space-y-6">
            <FilterSection title="Loại xe">
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </FilterSection>

            <Separator />

            <FilterSection title="Thương hiệu">
                <div className="space-y-2">
                    {brands.map(brand => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => toggleBrand(brand)}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{brand}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            <Separator />

            <FilterSection title="Tình trạng">
                <div className="space-y-2">
                    {conditions.map(condition => (
                        <label key={condition} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedConditions.includes(condition)}
                                onChange={() => toggleCondition(condition)}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{condition}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            <Separator />

            <FilterSection title="Khác">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="text-sm flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        Chỉ xe đã kiểm định
                    </span>
                </label>
            </FilterSection>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Page Header */}
            <div className="border-b bg-muted/40">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                        Tất cả Xe Đạp
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Tìm thấy <span className="font-medium text-foreground">{filteredBikes.length}</span> xe đạp
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden w-64 shrink-0 lg:block">
                        <div className="sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-foreground">Bộ lọc</h3>
                                {activeFiltersCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setSelectedBrands([])
                                        setSelectedConditions([])
                                        setVerifiedOnly(false)
                                    }}>
                                        Xóa tất cả
                                    </Button>
                                )}
                            </div>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search and Controls */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm xe đạp..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Mobile Filter Button */}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="lg:hidden">
                                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                                            Bộ lọc
                                            {activeFiltersCount > 0 && (
                                                <Badge variant="secondary" className="ml-2">
                                                    {activeFiltersCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] overflow-y-auto">
                                        <SheetHeader>
                                            <SheetTitle>Bộ lọc</SheetTitle>
                                        </SheetHeader>
                                        <div className="mt-6">
                                            <FilterContent />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                {/* View Mode Toggle */}
                                <div className="hidden sm:flex items-center border rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("rounded-r-none", viewMode === 'grid' && "bg-muted")}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("rounded-l-none", viewMode === 'list' && "bg-muted")}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFiltersCount > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {selectedBrands.map(brand => (
                                    <Badge key={brand} variant="secondary" className="gap-1">
                                        {brand}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleBrand(brand)} />
                                    </Badge>
                                ))}
                                {selectedConditions.map(condition => (
                                    <Badge key={condition} variant="secondary" className="gap-1">
                                        {condition}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCondition(condition)} />
                                    </Badge>
                                ))}
                                {verifiedOnly && (
                                    <Badge variant="secondary" className="gap-1">
                                        Đã kiểm định
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Bike Grid/List */}
                        {filteredBikes.length > 0 ? (
                            <div className={cn(
                                "grid gap-6",
                                viewMode === 'grid'
                                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                                    : "grid-cols-1"
                            )}>
                                {filteredBikes.map((bike) => (
                                    <Link key={bike.id} to={`/bikes/${bike.id}`}>
                                        <Card className={cn(
                                            "group overflow-hidden transition-all hover:shadow-lg cursor-pointer",
                                            viewMode === 'list' && "flex"
                                        )}>
                                            <div className={cn(
                                                "relative overflow-hidden",
                                                viewMode === 'grid' ? "aspect-[4/3]" : "w-48 shrink-0"
                                            )}>
                                                <img
                                                    src={bike.image}
                                                    alt={bike.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute left-3 top-3 flex gap-2">
                                                    <Badge variant="success">{bike.condition}</Badge>
                                                    {bike.verified && (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Shield className="h-3 w-3" />
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={cn(viewMode === 'list' && "flex flex-1 flex-col")}>
                                                <CardContent className="p-4">
                                                    <div className="text-xs text-muted-foreground mb-1">{bike.category} • {bike.brand}</div>
                                                    <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                        {bike.name}
                                                    </h3>
                                                    <p className="mt-2 text-lg font-bold text-primary">
                                                        {formatPrice(bike.price)}
                                                    </p>
                                                </CardContent>
                                                <CardFooter className={cn("border-t px-4 py-3", viewMode === 'list' && "mt-auto")}>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {bike.location}
                                                    </div>
                                                </CardFooter>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Search className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">Không tìm thấy xe đạp</h3>
                                <p className="mt-2 text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
