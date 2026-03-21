import { ChevronLeft, ChevronRight, Loader2, MapPin, Search, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { buildRoute } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { CONDITIONS, type BikeListingViewMode } from './constants'
import { formatPrice, getPrimaryImage } from './utils'

interface BikeListingResultsProps {
  activeFiltersCount: number
  error: string | null
  isLoading: boolean
  page: number
  products: Product[]
  totalPages: number
  viewMode: BikeListingViewMode
  onClearFilters: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
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

function BikeListingProductCard({
  product,
  viewMode,
}: {
  product: Product
  viewMode: BikeListingViewMode
}) {
  const conditionLabel = CONDITIONS.find((condition) => condition.value === product.condition)?.label

  return (
    <Link to={buildRoute.bikeDetail(product.id)}>
      <Card className={cn('group cursor-pointer overflow-hidden transition-all hover:shadow-lg', viewMode === 'list' && 'flex')}>
        <div className={cn('relative overflow-hidden', viewMode === 'grid' ? 'aspect-[4/3]' : 'w-48 shrink-0')}>
          <img
            src={getPrimaryImage(product)}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {conditionLabel && <Badge variant="success">{conditionLabel}</Badge>}
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
  )
}

export function BikeListingResults({
  activeFiltersCount,
  error,
  isLoading,
  page,
  products,
  totalPages,
  viewMode,
  onClearFilters,
  onPageChange,
  onRetry,
}: BikeListingResultsProps) {
  const gridClass = cn(
    'grid gap-6',
    viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
  )

  if (error && !isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className={gridClass}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className={gridClass}>
          {products.map((product) => (
            <BikeListingProductCard key={product.id} product={product} viewMode={viewMode} />
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
            <Button variant="outline" className="mt-4" onClick={onClearFilters}>
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
            onClick={() => onPageChange(Math.max(0, page - 1))}
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
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
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
    </>
  )
}
