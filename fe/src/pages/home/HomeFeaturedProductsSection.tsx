import { ArrowRight, Bike, MapPin, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ROUTES, buildRoute } from '@/constants/routes'
import type { Product } from '@/types/product'
import {
  formatPrice,
  getPrimaryImage,
  getProductConditionLabel,
  getProductLocation,
} from './home.utils'

interface HomeFeaturedProductsSectionProps {
  products: Product[]
  loading: boolean
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

export function HomeFeaturedProductsSection({
  products,
  loading,
}: HomeFeaturedProductsSectionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Xe mới cập nhật
            </h2>

          </div>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link to={ROUTES.MARKET}>
              Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <FeaturedBikeSkeleton key={index} />)
          ) : products.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center text-muted-foreground">
              Hiện chưa có xe công khai nào phù hợp để hiển thị ở trang chủ.
            </div>
          ) : (
            products.map((product) => {
              const conditionLabel = getProductConditionLabel(product.condition)

              return (
                <Link key={product.id} to={buildRoute.bikeDetail(product.id)}>
                  <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <ProductPreviewImage
                        imageUrl={getPrimaryImage(product)}
                        title={product.title}
                      />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {conditionLabel ? <Badge variant="success">{conditionLabel}</Badge> : null}
                        {product.isVerified ? (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Đã kiểm định
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                        {product.title}
                      </h3>
                      <p className="mt-2 text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </p>
                    </CardContent>

                    <CardFooter className="border-t px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {getProductLocation(product)}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
