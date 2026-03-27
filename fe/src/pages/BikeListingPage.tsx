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
import { vietnamProvincesApi } from '@/api/vietnam-provinces.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { buildRoute } from '@/constants/routes'
import { buildMarketSearchParams, readMarketSearchState } from '@/lib/market-search'
import { findAdministrativeOptionByName, type AdministrativeOption } from '@/lib/vietnamese-provinces'
import { formatPriceDisplay } from '@/lib/currency-input'
import { cn } from '@/lib/utils'
import type { Product, ProductFilterRequest } from '@/types/product'
import type { Brand, Category, ReferenceValue } from '@/types/reference-data'

const PAGE_SIZE = 6
const ALL_LOCATION_VALUE = '__all__'

const CONDITIONS = [
  { value: 'new_90', label: 'Như mới (90%+)' },
  { value: 'used', label: 'Đã qua sử dụng' },
  { value: 'needs_repair', label: 'Cần sửa chữa' },
] as const

function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

function getPrimaryImage(product: Product): string {
  const primaryImage = product.images.find((image) => image.isPrimary)
  return primaryImage?.url ?? product.images[0]?.url ?? ''
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

function ProductCardImage({ imageUrl, title }: { imageUrl: string; title: string }) {
  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/80">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Grid3X3 className="h-8 w-8 opacity-50" />
          <span className="text-xs font-medium">Chưa có ảnh</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={title}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  )
}

export default function BikeListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearchState = useMemo(() => readMarketSearchState(searchParams), [searchParams])

  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [groupsets, setGroupsets] = useState<ReferenceValue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [keyword, setKeyword] = useState(initialSearchState.keyword)
  const [searchInput, setSearchInput] = useState(initialSearchState.keyword)
  const [province, setProvince] = useState(initialSearchState.province)
  const [district, setDistrict] = useState(initialSearchState.district)
  const [ward, setWard] = useState(initialSearchState.ward)
  const [provinceOptions, setProvinceOptions] = useState<AdministrativeOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<AdministrativeOption[]>([])
  const [wardOptions, setWardOptions] = useState<AdministrativeOption[]>([])
  const [provinceOptionsLoading, setProvinceOptionsLoading] = useState(true)
  const [districtOptionsLoading, setDistrictOptionsLoading] = useState(false)
  const [wardOptionsLoading, setWardOptionsLoading] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [selectedGroupsetId, setSelectedGroupsetId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialSearchState.categoryId)
  const [selectedCondition, setSelectedCondition] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    Promise.all([referenceDataApi.getBrands(), referenceDataApi.getCategories(), referenceDataApi.getGroupsets()])
      .then(([loadedBrands, loadedCategories, loadedGroupsets]) => {
        setBrands(loadedBrands)
        setCategories(loadedCategories)
        setGroupsets(loadedGroupsets)
      })
      .catch(() => {
        setBrands([])
        setCategories([])
        setGroupsets([])
      })
  }, [])

  useEffect(() => {
    const nextState = readMarketSearchState(searchParams)
    setKeyword(nextState.keyword)
    setSearchInput(nextState.keyword)
    setProvince(nextState.province)
    setDistrict(nextState.district)
    setWard(nextState.ward)
    setSelectedCategoryId(nextState.categoryId)
    setPage(0)
  }, [searchParams])

  useEffect(() => {
    let ignore = false

    async function loadProvinceOptions() {
      setProvinceOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getAll()

        if (!ignore) {
          setProvinceOptions(result)
        }
      } catch {
        if (!ignore) {
          setProvinceOptions([])
        }
      } finally {
        if (!ignore) {
          setProvinceOptionsLoading(false)
        }
      }
    }

    void loadProvinceOptions()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const selectedProvince = findAdministrativeOptionByName(provinceOptions, province)

    if (!selectedProvince) {
      setDistrictOptions([])
      setWardOptions([])
      setDistrictOptionsLoading(false)
      setWardOptionsLoading(false)
      return
    }

    const selectedProvinceCode = selectedProvince.code
    let ignore = false

    async function loadDistrictOptions() {
      setDistrictOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getDistricts(selectedProvinceCode)

        if (!ignore) {
          setDistrictOptions(result)
        }
      } catch {
        if (!ignore) {
          setDistrictOptions([])
        }
      } finally {
        if (!ignore) {
          setDistrictOptionsLoading(false)
        }
      }
    }

    void loadDistrictOptions()

    return () => {
      ignore = true
    }
  }, [province, provinceOptions])

  useEffect(() => {
    const selectedDistrict = findAdministrativeOptionByName(districtOptions, district)

    if (!selectedDistrict) {
      setWardOptions([])
      setWardOptionsLoading(false)
      return
    }

    const selectedDistrictCode = selectedDistrict.code
    let ignore = false

    async function loadWardOptions() {
      setWardOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getWards(selectedDistrictCode)

        if (!ignore) {
          setWardOptions(result)
        }
      } catch {
        if (!ignore) {
          setWardOptions([])
        }
      } finally {
        if (!ignore) {
          setWardOptionsLoading(false)
        }
      }
    }

    void loadWardOptions()

    return () => {
      ignore = true
    }
  }, [district, districtOptions])

  const updateSearchUrl = useCallback(
    (nextState: Partial<{ keyword: string; province: string; district: string; ward: string; categoryId: string }>) => {
      const params = buildMarketSearchParams({
        keyword: nextState.keyword ?? keyword,
        province: nextState.province ?? province,
        district: nextState.district ?? district,
        ward: nextState.ward ?? ward,
        categoryId: nextState.categoryId ?? selectedCategoryId,
      })

      setSearchParams(params, { replace: true })
    },
    [district, keyword, province, selectedCategoryId, setSearchParams, ward],
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
    if (district) filters.district = district
    if (ward) filters.ward = ward
    if (selectedBrandId) filters.brandId = selectedBrandId
    if (selectedGroupsetId) filters.groupsetId = selectedGroupsetId
    if (selectedCategoryId) filters.categoryId = selectedCategoryId
    if (selectedCondition) filters.condition = selectedCondition as ProductFilterRequest['condition']
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
  }, [district, keyword, maxPrice, minPrice, page, province, selectedBrandId, selectedCategoryId, selectedCondition, selectedGroupsetId, ward])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  function handleSearchSubmit() {
    const nextKeyword = searchInput.trim()
    setPage(0)
    setKeyword(nextKeyword)
    updateSearchUrl({ keyword: nextKeyword, province, district, ward })
  }

  function handleCategoryChange(categoryId: string) {
    setPage(0)
    setSelectedCategoryId(categoryId)
    updateSearchUrl({ categoryId })
  }

  function clearFilters() {
    setSearchInput('')
    setKeyword('')
    setProvince('')
    setDistrict('')
      setWard('')
      setSelectedBrandId('')
      setSelectedGroupsetId('')
      setSelectedCategoryId('')
    setSelectedCondition('')
    setMinPrice('')
    setMaxPrice('')
    setPage(0)
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const activeFiltersCount =
    (keyword ? 1 : 0) +
    (province ? 1 : 0) +
    (district ? 1 : 0) +
    (ward ? 1 : 0) +
    (selectedBrandId ? 1 : 0) +
    (selectedGroupsetId ? 1 : 0) +
    (selectedCategoryId ? 1 : 0) +
    (selectedCondition ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0)

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId)
  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId)
  const selectedGroupset = groupsets.find((groupset) => groupset.id === selectedGroupsetId)
  const selectedConditionLabel = CONDITIONS.find((condition) => condition.value === selectedCondition)?.label
  const selectedProvinceOption = useMemo(
    () => findAdministrativeOptionByName(provinceOptions, province),
    [province, provinceOptions],
  )
  const selectedDistrictOption = useMemo(
    () => findAdministrativeOptionByName(districtOptions, district),
    [district, districtOptions],
  )
  const selectedWardOption = useMemo(
    () => findAdministrativeOptionByName(wardOptions, ward),
    [ward, wardOptions],
  )

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

      <FilterSection title="Groupset">
        <Select
          value={selectedGroupsetId || ALL_LOCATION_VALUE}
          onValueChange={(value) => {
            setSelectedGroupsetId(value === ALL_LOCATION_VALUE ? '' : value)
            setPage(0)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn groupset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_LOCATION_VALUE}>Tất cả groupset</SelectItem>
            {groupsets.map((groupset) => (
              <SelectItem key={groupset.id} value={groupset.id}>
                {groupset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm xe đạp..."
                    className="h-11 pl-10"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSearchSubmit()}
                  />
                </div>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select
                    value={selectedProvinceOption?.name ?? ALL_LOCATION_VALUE}
                    onValueChange={(value) => {
                      const nextProvince = value === ALL_LOCATION_VALUE ? '' : value
                      setPage(0)
                      setProvince(nextProvince)
                      setDistrict('')
                      setWard('')
                      setDistrictOptions([])
                      setWardOptions([])
                      updateSearchUrl({
                        province: nextProvince,
                        district: '',
                        ward: '',
                      })
                    }}
                    disabled={provinceOptionsLoading}
                  >
                    <SelectTrigger className="h-11 pl-10 text-left">
                      <SelectValue
                        placeholder={
                          provinceOptionsLoading ? 'Đang tải tỉnh / thành phố...' : 'Tỉnh / thành phố'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value={ALL_LOCATION_VALUE}>Tất cả tỉnh / thành</SelectItem>
                      {provinceOptions.map((option) => (
                        <SelectItem key={option.code} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select
                    value={selectedDistrictOption?.name ?? ALL_LOCATION_VALUE}
                    onValueChange={(value) => {
                      const nextDistrict = value === ALL_LOCATION_VALUE ? '' : value
                      setPage(0)
                      setDistrict(nextDistrict)
                      setWard('')
                      setWardOptions([])
                      updateSearchUrl({
                        district: nextDistrict,
                        ward: '',
                      })
                    }}
                    disabled={!selectedProvinceOption || districtOptionsLoading}
                  >
                    <SelectTrigger className="h-11 pl-10 text-left">
                      <SelectValue
                        placeholder={
                          !selectedProvinceOption
                            ? 'Quận / huyện'
                            : districtOptionsLoading
                              ? 'Đang tải quận / huyện...'
                              : 'Quận / huyện'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value={ALL_LOCATION_VALUE}>Tất cả quận / huyện</SelectItem>
                      {districtOptions.map((option) => (
                        <SelectItem key={option.code} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select
                    value={selectedWardOption?.name ?? ALL_LOCATION_VALUE}
                    onValueChange={(value) => {
                      const nextWard = value === ALL_LOCATION_VALUE ? '' : value
                      setPage(0)
                      setWard(nextWard)
                      updateSearchUrl({ ward: nextWard })
                    }}
                    disabled={!selectedDistrictOption || wardOptionsLoading}
                  >
                    <SelectTrigger className="h-11 pl-10 text-left">
                      <SelectValue
                        placeholder={
                          !selectedDistrictOption
                            ? 'Phường / xã'
                            : wardOptionsLoading
                              ? 'Đang tải phường / xã...'
                              : 'Phường / xã'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value={ALL_LOCATION_VALUE}>Tất cả phường / xã</SelectItem>
                      {wardOptions.map((option) => (
                        <SelectItem key={option.code} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button className="h-11 sm:col-span-2 xl:col-span-1" onClick={handleSearchSubmit}>
                  Tìm kiếm
                </Button>
              </div>

              <div className="flex items-center justify-between gap-3">
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

                <div className="hidden items-center rounded-lg border sm:ml-auto sm:flex">
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
                          setProvince('')
                          setDistrict('')
                          setWard('')
                          setPage(0)
                          updateSearchUrl({ province: '', district: '', ward: '' })
                        }}
                      />
                    </Badge>
                  )}

                  {district && (
                    <Badge variant="secondary" className="gap-1">
                      Quận / huyện: {district}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setDistrict('')
                          setWard('')
                          setPage(0)
                          updateSearchUrl({ district: '', ward: '' })
                        }}
                      />
                    </Badge>
                  )}

                  {ward && (
                    <Badge variant="secondary" className="gap-1">
                      Phường / xã: {ward}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setWard('')
                          setPage(0)
                          updateSearchUrl({ ward: '' })
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

                  {selectedGroupset && (
                    <Badge variant="secondary" className="gap-1">
                      Groupset: {selectedGroupset.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedGroupsetId('')} />
                    </Badge>
                  )}

                  {selectedConditionLabel && (
                    <Badge variant="secondary" className="gap-1">
                      Tình trạng: {selectedConditionLabel}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCondition('')} />
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
                        <ProductCardImage imageUrl={getPrimaryImage(product)} title={product.title} />

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
                  onClick={() => {
                    setPage((currentPage) => Math.max(0, currentPage - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
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
                  onClick={() => {
                    setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
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
