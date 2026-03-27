import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Bike,
  ChevronRight,
  MapPin,
  Search,
  Shield,
  Users,
} from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { referenceDataApi } from '@/api/reference-data.api'
import { vietnamProvincesApi } from '@/api/vietnam-provinces.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROUTES, buildRoute } from '@/constants/routes'
import {
  findAdministrativeOptionByName,
  type AdministrativeOption,
} from '@/lib/vietnamese-provinces'
import type { Category } from '@/types/reference-data'
import type { Product } from '@/types/product'
import { useAuth } from '@/contexts/AuthContext'
import { getSellEntryHref } from '@/layouts/app-header-visibility'
import { formatPriceDisplay } from '@/lib/currency-input'

const CATEGORY_ICONS: Record<string, string> = {
  bicycles: '🚲',
  'road-bikes': '🚴',
  'mountain-bikes': '🚵',
  'gravel-bikes': '🛤️',
  'city-bikes': '🏙️',
}

const TRUST_FEATURES = [
  {
    icon: Shield,
    title: 'Kiểm duyệt cực kỳ nghiêm ngặt',
    description: 'Tất cả tin đăng đều được ban quản trị kiểm định chất lượng trước khi hiển thị.',
  },
  {
    icon: Award,
    title: 'Thông tin xe rõ ràng',
    description: 'Người mua xem được thông tin xe, ảnh, trạng thái kiểm định và lịch sử giao dịch liên quan.',
  },
  {
    icon: Users,
    title: 'Luồng mua bán có kiểm soát',
    description: 'Đơn mua, đặt cọc, hoàn tiền và giải ngân đều đi qua các bước xác nhận rõ ràng.',
  },
] as const

const ALL_LOCATION_VALUE = '__all__'

function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

function getPrimaryImage(product: Product): string {
  const primaryImage = product.images.find((image) => image.isPrimary)
  return primaryImage?.url ?? product.images[0]?.url ?? ''
}

function getCategoryIcon(category: Category) {
  return CATEGORY_ICONS[category.slug] ?? CATEGORY_ICONS[category.name.toLowerCase().replace(/\s+/g, '-')] ?? '🚲'
}

function FeaturedBikeSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <CardContent className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
      </CardContent>
      <CardFooter className="border-t px-4 py-3">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </CardFooter>
    </Card>
  )
}

function ProductPreviewImage({ imageUrl, title }: { imageUrl: string; title: string }) {
  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/80">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Bike className="h-10 w-10 opacity-60" />
          <span className="text-xs font-medium">Chưa có ảnh xe</span>
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

function CategorySkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchProvince, setSearchProvince] = useState('')
  const [searchDistrict, setSearchDistrict] = useState('')
  const [searchWard, setSearchWard] = useState('')
  const [provinceOptions, setProvinceOptions] = useState<AdministrativeOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<AdministrativeOption[]>([])
  const [wardOptions, setWardOptions] = useState<AdministrativeOption[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [provinceOptionsLoading, setProvinceOptionsLoading] = useState(true)
  const [districtOptionsLoading, setDistrictOptionsLoading] = useState(false)
  const [wardOptionsLoading, setWardOptionsLoading] = useState(false)

  const sellerEntryHref = useMemo(
    () => getSellEntryHref(user?.role, isAuthenticated),
    [isAuthenticated, user?.role],
  )

  useEffect(() => {
    let ignore = false

    async function loadFeaturedProducts() {
      setFeaturedLoading(true)

      try {
        const result = await productsApi.search({
          page: 0,
          size: 4,
          sortBy: 'createdAt,desc',
        })

        if (!ignore) {
          setFeaturedProducts(result.content)
        }
      } catch {
        if (!ignore) {
          setFeaturedProducts([])
        }
      } finally {
        if (!ignore) {
          setFeaturedLoading(false)
        }
      }
    }

    void loadFeaturedProducts()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadCategories() {
      setCategoriesLoading(true)

      try {
        const result = await referenceDataApi.getCategories()
        const primaryCategories = result.filter((category) => !category.parentId).slice(0, 4)

        if (!ignore) {
          setCategories(primaryCategories)
        }
      } catch {
        if (!ignore) {
          setCategories([])
        }
      } finally {
        if (!ignore) {
          setCategoriesLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      ignore = true
    }
  }, [])

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
    const selectedProvince = findAdministrativeOptionByName(provinceOptions, searchProvince)

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
  }, [provinceOptions, searchProvince])

  useEffect(() => {
    const selectedDistrict = findAdministrativeOptionByName(districtOptions, searchDistrict)

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
  }, [districtOptions, searchDistrict])

  function handleSearch() {
    const nextKeyword = searchKeyword.trim()

    navigate(
      buildRoute.market({
        keyword: nextKeyword,
        province: searchProvince,
        district: searchDistrict,
        ward: searchWard,
      }),
    )
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Nền tảng mua bán xe đạp thể thao cũ có kiểm định
            </h1>
            <p className="mt-6 text-lg text-white/90 md:text-xl">
              Tìm kiếm linh hoạt, an tâm giao dịch với mọi tin đăng đã được ban quản trị kiểm định kỹ lưỡng.
            </p>

            <Card className="mt-10 p-2 shadow-xl">
              <CardContent className="p-0">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(3,minmax(0,0.8fr))_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên xe, thương hiệu hoặc model"
                      className="h-12 pl-10"
                      value={searchKeyword}
                      onChange={(event) => setSearchKeyword(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Select
                      value={searchProvince || ALL_LOCATION_VALUE}
                      onValueChange={(value) => {
                        const nextProvince = value === ALL_LOCATION_VALUE ? '' : value
                        setSearchProvince(nextProvince)
                        setSearchDistrict('')
                        setSearchWard('')
                        setDistrictOptions([])
                        setWardOptions([])
                      }}
                    >
                      <SelectTrigger className="h-12 pl-10 text-left">
                        <SelectValue placeholder={provinceOptionsLoading ? 'Đang tải tỉnh / thành phố...' : 'Tỉnh / thành phố'} />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem value={ALL_LOCATION_VALUE}>Tất cả tỉnh / thành</SelectItem>
                        {provinceOptions.map((province) => (
                          <SelectItem key={province.code} value={province.name}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Select
                      value={searchDistrict || ALL_LOCATION_VALUE}
                      onValueChange={(value) => {
                        const nextDistrict = value === ALL_LOCATION_VALUE ? '' : value
                        setSearchDistrict(nextDistrict)
                        setSearchWard('')
                        setWardOptions([])
                      }}
                      disabled={!searchProvince || districtOptionsLoading}
                    >
                      <SelectTrigger className="h-12 pl-10 text-left">
                        <SelectValue
                          placeholder={
                            !searchProvince
                              ? 'Chọn quận / huyện'
                              : districtOptionsLoading
                                ? 'Đang tải quận / huyện...'
                                : 'Quận / huyện'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem value={ALL_LOCATION_VALUE}>Tất cả quận / huyện</SelectItem>
                        {districtOptions.map((district) => (
                          <SelectItem key={district.code} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Select
                      value={searchWard || ALL_LOCATION_VALUE}
                      onValueChange={(value) => {
                        setSearchWard(value === ALL_LOCATION_VALUE ? '' : value)
                      }}
                      disabled={!searchDistrict || wardOptionsLoading}
                    >
                      <SelectTrigger className="h-12 pl-10 text-left">
                        <SelectValue
                          placeholder={
                            !searchDistrict
                              ? 'Chọn phường / xã'
                              : wardOptionsLoading
                                ? 'Đang tải phường / xã...'
                                : 'Phường / xã'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem value={ALL_LOCATION_VALUE}>Tất cả phường / xã</SelectItem>
                        {wardOptions.map((ward) => (
                          <SelectItem key={ward.code} value={ward.name}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button size="lg" className="h-12 px-8 sm:col-span-2 xl:col-span-1" onClick={handleSearch}>
                    <Search className="mr-2 h-4 w-4" />
                    Tìm kiếm
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                Mọi tin đăng đều đã qua kiểm định
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                Đặt cọc và xác nhận giao dịch an toàn
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                Hoàn tiền và giải ngân đối soát kỹ lưỡng
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/40 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {TRUST_FEATURES.map((feature) => (
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

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Xe công khai mới cập nhật</h2>
              <p className="mt-1 text-muted-foreground">Dữ liệu lấy trực tiếp từ marketplace công khai, không còn dùng mock.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link to={ROUTES.MARKET}>
                Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredLoading ? (
              Array.from({ length: 4 }).map((_, index) => <FeaturedBikeSkeleton key={index} />)
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center text-muted-foreground">
                Hiện chưa có xe công khai nào phù hợp để hiển thị ở trang chủ.
              </div>
            ) : (
              featuredProducts.map((product) => (
                <Link key={product.id} to={buildRoute.bikeDetail(product.id)}>
                  <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <ProductPreviewImage imageUrl={getPrimaryImage(product)} title={product.title} />
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

                    <CardContent className="p-4">
                      <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                        {product.title}
                      </h3>
                      <p className="mt-2 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
                    </CardContent>

                    <CardFooter className="border-t px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {[product.district, product.province].filter(Boolean).join(', ') || 'Chưa cập nhật địa điểm'}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Danh mục xe đạp</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoriesLoading ? (
              Array.from({ length: 4 }).map((_, index) => <CategorySkeleton key={index} />)
            ) : categories.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
                Chưa tải được danh mục. Bạn vẫn có thể xem toàn bộ xe ở trang mua xe.
              </div>
            ) : (
              categories.map((category) => (
                <Link key={category.id} to={buildRoute.market({ categoryId: category.id })}>
                  <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                      <span className="text-4xl">{getCategoryIcon(category)}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">Mở bộ lọc và xem các xe thuộc danh mục này</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-secondary/90 to-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <Bike className="mx-auto h-12 w-12 text-white/90" />
            <h2 className="mt-6 text-2xl font-bold text-white md:text-3xl">
              Bạn muốn bán xe đạp của mình?
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Tạo tin dễ dàng, chờ ban quản trị kiểm định chất lượng trước khi được đăng bán công khai.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="mt-8 border-white bg-white text-secondary hover:bg-white/90"
              onClick={() => navigate(sellerEntryHref)}
            >
              Đăng tin bán xe ngay <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
