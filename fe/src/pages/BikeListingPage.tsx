import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, SlidersHorizontal, Grid3X3, List, Shield, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { productsApi } from '@/api/products.api'
import { referenceDataApi } from '@/api/reference-data.api'
import type { Product, ProductFilterRequest } from '@/types/product'
import type { Brand, Category } from '@/types/reference-data'
import { buildRoute } from '@/constants/routes'

const PAGE_SIZE = 6

const CONDITIONS = [
  { value: 'new_90', label: 'Như mới (90%+)' },
  { value: 'used', label: 'Đã qua sử dụng' },
  { value: 'needs_repair', label: 'Cần sửa chữa' },
] as const

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

function getPrimaryImage(product: Product): string {
  const primary = product.images?.find((img) => img.isPrimary)
  return primary?.url ?? product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400'
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

function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-5 bg-muted rounded w-1/2" />
      </div>
      <div className="px-4 py-3 border-t">
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  )
}

export default function BikeListingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Load reference data (brands, categories) once
  useEffect(() => {
    Promise.all([referenceDataApi.getBrands(), referenceDataApi.getCategories()])
      .then(([b, c]) => {
        setBrands(b)
        setCategories(c)
      })
      .catch(() => {
        // non-critical, filters still work without them
      })
  }, [])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const filters: ProductFilterRequest & { page: number; size: number } = {
      page,
      size: PAGE_SIZE,
    }
    if (keyword) filters.keyword = keyword
    if (selectedBrandId) filters.brandId = selectedBrandId
    if (selectedCategoryId) filters.categoryId = selectedCategoryId
    if (selectedCondition) filters.condition = selectedCondition as ProductFilterRequest['condition']
    if (verifiedOnly) filters.hasInspection = true
    if (minPrice) filters.minPrice = Number(minPrice)
    if (maxPrice) filters.maxPrice = Number(maxPrice)

    try {
      const result = await productsApi.search(filters)
      const availableProducts = result.content.filter(
        (p) =>
          p.status !== 'inspected_failed' &&
          p.status !== 'pending' &&
          p.status !== 'hidden' &&
          p.status !== 'sold' &&
          p.status !== 'pending_inspection'
      )
      
      setProducts(availableProducts)
      setTotalPages(result.totalPages)
      // Tạm thời tính lại số lượng hiển thị thực tế trên trang này
      // (Backend cần sửa API để totalElements trả về đúng)
      setTotalElements(
        result.totalElements - (result.content.length - availableProducts.length)
      )
    } catch {
      setError('Không thể tải danh sách xe. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [page, keyword, selectedBrandId, selectedCategoryId, selectedCondition, verifiedOnly, minPrice, maxPrice])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = useCallback((value: string) => {
    setKeyword(value)
    setPage(0)
  }, [])

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value === '') {
      // Reset ngay khi xóa hết
      handleSearch('')
      return
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(value)
    }, 500)
  }

  const clearFilters = () => {
    setSelectedBrandId('')
    setSelectedCategoryId('')
    setSelectedCondition('')
    setVerifiedOnly(false)
    setMinPrice('')
    setMaxPrice('')
    setPage(0)
  }

  const activeFiltersCount =
    (selectedBrandId ? 1 : 0) +
    (selectedCategoryId ? 1 : 0) +
    (selectedCondition ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      <FilterSection title="Danh mục">
        <div className="space-y-1">
          <button
            className={cn(
              'w-full text-left px-2 py-1.5 rounded text-sm transition-colors',
              !selectedCategoryId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
            onClick={() => { setSelectedCategoryId(''); setPage(0) }}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded text-sm transition-colors',
                selectedCategoryId === cat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
              onClick={() => { setSelectedCategoryId(cat.id); setPage(0) }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Thương hiệu">
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
            <label key={brand.id} className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={selectedBrandId === brand.id}
                onChange={() => { setSelectedBrandId(prev => prev === brand.id ? '' : brand.id); setPage(0) }}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">{brand.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Tình trạng">
        <div className="space-y-1">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={selectedCondition === c.value}
                onChange={() => { setSelectedCondition(prev => prev === c.value ? '' : c.value); setPage(0) }}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Khoảng giá (VNĐ)">
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="text-sm"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="text-sm"
          />
        </div>
        <Button size="sm" variant="outline" className="w-full" onClick={() => { setPage(0); fetchProducts() }}>
          Áp dụng
        </Button>
      </FilterSection>

      <Separator />

      <FilterSection title="Khác">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(0) }}
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
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Tất cả Xe Đạp</h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading ? (
              'Đang tải...'
            ) : (
              <>
                Tìm thấy <span className="font-medium text-foreground">{totalElements}</span> xe đạp
              </>
            )}
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
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Xóa tất cả
                  </Button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search and Controls */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm xe đạp..."
                    className="pl-10"
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
                  />
                </div>
                <Button onClick={() => handleSearch(searchInput)} size="sm">Tìm</Button>
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
                    className={cn('rounded-r-none', viewMode === 'grid' && 'bg-muted')}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('rounded-l-none', viewMode === 'list' && 'bg-muted')}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {activeFiltersCount > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedBrandId && (
                  <Badge variant="secondary" className="gap-1">
                    {brands.find(b => b.id === selectedBrandId)?.name ?? selectedBrandId}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedBrandId(''); setPage(0) }} />
                  </Badge>
                )}
                {selectedCategoryId && (
                  <Badge variant="secondary" className="gap-1">
                    {categories.find(c => c.id === selectedCategoryId)?.name ?? selectedCategoryId}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedCategoryId(''); setPage(0) }} />
                  </Badge>
                )}
                {selectedCondition && (
                  <Badge variant="secondary" className="gap-1">
                    {CONDITIONS.find(c => c.value === selectedCondition)?.label ?? selectedCondition}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedCondition(''); setPage(0) }} />
                  </Badge>
                )}
                {verifiedOnly && (
                  <Badge variant="secondary" className="gap-1">
                    Đã kiểm định
                    <X className="h-3 w-3 cursor-pointer" onClick={() => { setVerifiedOnly(false); setPage(0) }} />
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary" className="gap-1">
                    Giá: {minPrice ? formatPrice(Number(minPrice)) : '0'} — {maxPrice ? formatPrice(Number(maxPrice)) : '∞'}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(0) }} />
                  </Badge>
                )}
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="py-8 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchProducts}>Thử lại</Button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
              )}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Product Grid/List */}
            {!isLoading && !error && products.length > 0 && (
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
              )}>
                {products.map((product) => (
                  <Link key={product.id} to={buildRoute.bikeDetail(product.id)}>
                    <Card className={cn(
                      'group overflow-hidden transition-all hover:shadow-lg cursor-pointer',
                      viewMode === 'list' && 'flex',
                    )}>
                      <div className={cn(
                        'relative overflow-hidden',
                        viewMode === 'grid' ? 'aspect-[4/3]' : 'w-48 shrink-0',
                      )}>
                        <img
                          src={getPrimaryImage(product)}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3 flex gap-2 flex-wrap">
                          {product.condition && (
                            <Badge variant="success">
                              {CONDITIONS.find(c => c.value === product.condition)?.label ?? product.condition}
                            </Badge>
                          )}
                          {product.isVerified && (
                            <Badge variant="secondary" className="gap-1">
                              <Shield className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className={cn(viewMode === 'list' && 'flex flex-1 flex-col')}>
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">
                            {[product.categoryName, product.brandName].filter(Boolean).join(' • ')}
                          </div>
                          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {product.title}
                          </h3>
                          <p className="mt-2 text-lg font-bold text-primary">
                            {formatPrice(product.price)}
                          </p>
                        </CardContent>
                        <CardFooter className={cn('border-t px-4 py-3', viewMode === 'list' && 'mt-auto')}>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {[product.district, product.province].filter(Boolean).join(', ') || 'Chưa có địa chỉ'}
                          </div>
                        </CardFooter>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Không tìm thấy xe đạp</h3>
                <p className="mt-2 text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Trang {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Tiếp
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Loading indicator for page change */}
            {isLoading && products.length > 0 && (
              <div className="flex justify-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
