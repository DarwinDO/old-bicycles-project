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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ROUTES, buildRoute } from '@/constants/routes'
import type { Category } from '@/types/reference-data'
import type { Product } from '@/types/product'
import { useAuth } from '@/contexts/AuthContext'
import { getSellEntryHref } from '@/layouts/app-header-visibility'

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
    title: 'Kiểm duyệt trước khi public',
    description: 'Tin đăng phải qua admin và inspection trước khi hiển thị công khai.',
  },
  {
    icon: Award,
    title: 'Thông tin xe rõ ràng',
    description: 'Người mua xem được mô tả, ảnh, trạng thái kiểm định và lịch sử giao dịch liên quan.',
  },
  {
    icon: Users,
    title: 'Luồng mua bán có kiểm soát',
    description: 'Đơn mua, đặt cọc, hoàn tiền và giải ngân đều đi qua các bước xác nhận rõ ràng.',
  },
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

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

  function handleSearch() {
    navigate(
      buildRoute.market({
        keyword: searchKeyword,
        province: searchProvince,
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
              Tìm xe theo từ khóa và khu vực, xem tin đã qua admin và inspection trước khi hiển thị công khai.
            </p>

            <Card className="mt-10 p-2 shadow-xl">
              <CardContent className="p-0">
                <div className="grid gap-2 md:grid-cols-[1.4fr_0.8fr_auto]">
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
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tỉnh / thành phố"
                      className="h-12 pl-10"
                      value={searchProvince}
                      onChange={(event) => setSearchProvince(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                    />
                  </div>

                  <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
                    <Search className="mr-2 h-4 w-4" />
                    Tìm kiếm
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                Tin đăng public đều đã qua inspection
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                Đặt cọc và xác nhận giao dịch theo từng bước
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                Hoàn tiền và giải ngân có đối soát thủ công
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
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Xe mới cập nhật</h2>
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
            <p className="mt-2 text-muted-foreground">Danh sách danh mục đang lấy từ reference data thật của hệ thống.</p>
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
              Tạo tin mới, chờ admin chuyển qua inspection, rồi chỉ lên public khi xe đạt kiểm định.
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
