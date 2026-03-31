import { Heart, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES, buildRoute } from '@/constants/routes'
import { formatPriceDisplay } from '@/lib/currency-input'
import type { WishlistItem } from '@/types/wishlist'

interface ProfileWishlistSectionProps {
  items: WishlistItem[]
  isLoading: boolean
  removingId: string | null
  onRemove: (productId: string) => void
}

function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

export function ProfileWishlistSection({
  items,
  isLoading,
  removingId,
  onRemove,
}: ProfileWishlistSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xe yêu thích</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có xe nào được lưu.</p>
            <Button asChild variant="outline" className="mt-4" size="sm">
              <Link to={ROUTES.MARKET}>Xem xe đạp</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 rounded-lg border p-4 transition-colors hover:border-primary/50"
              >
                <Link to={buildRoute.bikeDetail(item.productId)} className="shrink-0">
                  {item.primaryImageUrl ? (
                    <img
                      src={item.primaryImageUrl}
                      alt={item.title}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                      <Heart className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={buildRoute.bikeDetail(item.productId)}>
                    <h3 className="line-clamp-2 leading-tight font-semibold hover:text-primary">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="mt-1 font-bold text-primary">{formatPrice(item.price)}</p>
                  <button
                    className="mt-2 text-xs text-muted-foreground transition-colors hover:text-destructive"
                    onClick={() => onRemove(item.productId)}
                    disabled={removingId === item.productId}
                  >
                    {removingId === item.productId ? 'Đang xóa...' : '✕ Bỏ lưu'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
