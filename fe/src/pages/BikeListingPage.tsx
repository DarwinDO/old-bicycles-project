import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Loader2,
  MapPin,
  Search,
  Shield,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { referenceDataApi } from '@/api/reference-data.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { buildRoute } from '@/constants/routes'
import { buildMarketSearchParams, readMarketSearchState } from '@/lib/market-search'
import { cn } from '@/lib/utils'
import type { Product, ProductFilterRequest } from '@/types/product'
import type { Brand, Category } from '@/types/reference-data'

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
  const primaryImage = product.images.find((image) => image.isPrimary)
  return (
    primaryImage?.url ??
    product.images[0]?.url ??
    'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800'
  )
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
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="border-t px-4 py-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export default function BikeListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearchState = useMemo(() => readMarketSearchState(searchParams), [searchParams])

  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [keyword, setKeyword] = useState(initialSearchState.keyword)
  const [searchInput, setSearchInput] = useState(initialSearchState.keyword)
  const [province, setProvince] = useState(initialSearchState.province)
  const [provinceInput, setProvinceInput] = useState(initialSearchState.province)
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialSearchState.categoryId)
  const [selectedCondition, setSelectedCondition] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    Promise.all([referenceDataApi.getBrands(), referenceDataApi.getCategories()])
      .then(([loadedBrands, loadedCategories]) => {
        setBrands(loadedBrands)
        setCategories(loadedCategories)
      })
      .catch(() => {
        setBrands([])
        setCategories([])
      })
  }, [])

  useEffect(() => {
    const nextState = readMarketSearchState(searchParams)
    setKeyword(nextState.keyword)
    setSearchInput(nextState.keyword)
    setProvince(nextState.province)
    setProvinceInput(nextState.province)
    setSelectedCategoryId(nextState.categoryId)
    setPage(0)
  }, [searchParams])

  const updateSearchUrl = useCallback(
    (nextState: Partial<{ keyword: string; province: string; categoryId: string }>) => {
      const params = buildMarketSearchParams({
        keyword: nextState.keyword ?? keyword,
        province: nextState.province ?? province,
        categoryId: nextState.categoryId ?? selectedCategoryId,
      })

      setSearchParams(params, { replace: true })
    },
    [keyword, province, selectedCategoryId, setSearchParams],
  )

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const filters: ProductFilterRequest & { page: number; size: number } = {
      page,
      size: PAGE_SIZE,
    }

    if (keyword) filters.keyword = keyword
    if (province) filters.province = province
    if (selectedBrandId) filters.brandId = selectedBrandId
    if (selectedCategoryId) filters.categoryId = selectedCategoryId
    if (selectedCondition) filters.condition = selectedCondition as ProductFilterRequest['condition']
    if (verifiedOnly) filters.hasInspection = true
    if (minPrice) filters.minPrice = Number(minPrice)
    if (maxPrice) filters.maxPrice = Number(maxPrice)

    try {
      const result = await productsApi.search(filters)
      setProducts(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setError('Không thể tải danh sách xe. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [keyword, maxPrice, minPrice, page, province, selectedBrandId, selectedCategoryId, selectedCondition, verifiedOnly])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  function handleSearchSubmit() {
    const nextKeyword = searchInput.trim()
    const nextProvince = provinceInput.trim()
    setPage(0)
    setKeyword(nextKeyword)
    setProvince(nextProvince)
    updateSearchUrl({ keyword: nextKeyword, province: nextProvince })
  }

  function handleCategoryChange(categoryId: string) {
    setPage(0)
    setSelectedCategoryId(categoryId)
    updateSearchUrl({ categoryId })
  }

  function clearFilters() {
    setSearchInput('')
    setKeyword('')
    setProvinceInput('')
    setProvince('')
    setSelectedBrandId('')
    setSelectedCategoryId('')
    setSelectedCondition('')
    setVerifiedOnly(false)
    setMinPrice('')
    setMaxPrice('')
    setPage(0)
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const activeFiltersCount =
    (keyword ? 1 : 0) +
    (province ? 1 : 0) +
    (selectedBrandId ? 1 : 0) +
    (selectedCategoryId ? 1 : 0) +
    (selectedCondition ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0)

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId)
  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId)
  const selectedConditionLabel = CONDITIONS.find((condition) => condition.value === selectedCondition)?.label

  const filterContent = (
    <div className="space-y-6">
      <FilterSection title="Danh mục">
        <div className="space-y-1">
          <button
            className={cn(
              'w-full rounded px-2 py-1.5 text-left text-sm transition-colors',
              !selectedCategoryId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
            onClick={() => handleCategoryChange('')}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={cn(
                'w-full rounded px-2 py-1.5 text-left text-sm transition-colors',
                selectedCategoryId === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Thương hiệu">
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {brands.map((brand) => (
            <label key={brand.id} className="flex cursor-pointer items-center gap-2 py-0.5">
              <input
                type="checkbox"
                checked={selectedBrandId === brand.id}
                onChange={() => {
                  setSelectedBrandId((current) => (current === brand.id ? '' : brand.id))
                  setPage(0)
                }}
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
          {CONDITIONS.map((condition) => (
            <label key={condition.value} className="flex cursor-pointer items-center gap-2 py-0.5">
              <input
                type="checkbox"
                checked={selectedCondition === condition.value}
                onChange={() => {
                  setSelectedCondition((current) => (current === condition.value ? '' : condition.value))
                  setPage(0)
                }}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">{condition.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Khoảng giá (VNĐ)">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="text-sm"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="text-sm"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            setPage(0)
            void fetchProducts()
          }}
        >
          Áp dụng
        </Button>
      </FilterSection>

      <Separator />

      <FilterSection title="Khác">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => {
              setVerifiedOnly(event.target.checked)
              setPage(0)
            }}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <span className="flex items-center gap-1 text-sm">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Chỉ xe đã kiểm định
          </span>
        </label>
      </FilterSection>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Tất cả xe đạp</h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading ? (
              'Đang tải...'
            ) : (
              <>
                Tìm thấy <span className="font-medium text-foreground">{totalElements}</span> xe đạp công khai
              </>
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Bộ lọc</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Xóa tất cả
                  </Button>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_280px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm xe đạp..."
                    className="pl-10"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSearchSubmit()}
                  />
                </div>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Lọc theo tỉnh / thành phố"
                    className="pl-10"
                    value={provinceInput}
                    onChange={(event) => setProvinceInput(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSearchSubmit()}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleSearchSubmit}>Tìm</Button>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Bộ lọc
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Bộ lọc</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">{filterContent}</div>
                    </SheetContent>
                  </Sheet>

                  <div className="hidden items-center rounded-lg border sm:flex">
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

              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keyword && (
                    <Badge variant="secondary" className="gap-1">
                      Từ khóa: {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setSearchInput('')
                          setKeyword('')
                          setPage(0)
                          updateSearchUrl({ keyword: '' })
                        }}
                      />
                    </Badge>
                  )}

                  {province && (
                    <Badge variant="secondary" className="gap-1">
                      Khu vực: {province}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setProvinceInput('')
                          setProvince('')
                          setPage(0)
                          updateSearchUrl({ province: '' })
                        }}
                      />
                    </Badge>
                  )}

                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      Danh mục: {selectedCategory.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange('')} />
                    </Badge>
                  )}

                  {selectedBrand && (
                    <Badge variant="secondary" className="gap-1">
                      Thương hiệu: {selectedBrand.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedBrandId('')} />
                    </Badge>
                  )}

                  {selectedConditionLabel && (
                    <Badge variant="secondary" className="gap-1">
                      Tình trạng: {selectedConditionLabel}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCondition('')} />
                    </Badge>
                  )}

                  {verifiedOnly && (
                    <Badge variant="secondary" className="gap-1">
                      Đã kiểm định
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
                    </Badge>
                  )}

                  {(minPrice || maxPrice) && (
                    <Badge variant="secondary" className="gap-1">
                      Giá: {minPrice ? formatPrice(Number(minPrice)) : '0'} — {maxPrice ? formatPrice(Number(maxPrice)) : '∞'}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setMinPrice('')
                          setMaxPrice('')
                        }}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {error && !isLoading && (
              <div className="py-8 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => void fetchProducts()}>
                  Thử lại
                </Button>
              </div>
            )}

            {isLoading ? (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
                )}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : null}

            {!isLoading && !error && products.length > 0 && (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
                )}
              >
                {products.map((product) => (
                  <Link key={product.id} to={buildRoute.bikeDetail(product.id)}>
                    <Card className={cn('group cursor-pointer overflow-hidden transition-all hover:shadow-lg', viewMode === 'list' && 'flex')}>
                      <div className={cn('relative overflow-hidden', viewMode === 'grid' ? 'aspect-[4/3]' : 'w-48 shrink-0')}>
                        <img
                          src={getPrimaryImage(product)}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          {product.condition && (
                            <Badge variant="success">
                              {product.condition === 'new_90'
                                ? 'Như mới'
                                : product.condition === 'used'
                                  ? 'Đã qua sử dụng'
                                  : 'Cần sửa chữa'}
                            </Badge>
                          )}
                          {product.isVerified && (
                            <Badge variant="secondary" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Đã kiểm định
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className={cn(viewMode === 'list' && 'flex flex-1 flex-col')}>
                        <CardContent className="p-4">
                          <div className="mb-1 text-xs text-muted-foreground">
                            {[product.categoryName, product.brandName].filter(Boolean).join(' • ')}
                          </div>
                          <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                            {product.title}
                          </h3>
                          <p className="mt-2 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
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

            {!isLoading && !error && products.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
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

            {!isLoading && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Trước
                </Button>
                <span className="px-4 text-sm text-muted-foreground">
                  Trang {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Tiếp
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {isLoading && products.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
