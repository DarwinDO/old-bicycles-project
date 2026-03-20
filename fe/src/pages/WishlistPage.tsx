import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { buildRoute } from '@/constants/routes'
import { wishlistApi } from '@/api/wishlist.api'
import type { WishlistItem } from '@/types/wishlist'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ duyệt',
  active: 'Đang bán',
  hidden: 'Đã ẩn',
  sold: 'Đã bán',
  pending_inspection: 'Chờ kiểm định',
  inspected_passed: 'Đã kiểm định',
  inspected_failed: 'KĐ thất bại',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await wishlistApi.getMine()
      setItems(data)
    } catch {
      setError('Không thể tải danh sách xe đã lưu. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const handleRemove = async (productId: string) => {
    setRemovingId(productId)
    try {
      await wishlistApi.remove(productId)
      setItems((prev) => prev.filter((item) => item.productId !== productId))
    } catch {
      // silent
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Xe đã lưu</h1>
              <p className="text-muted-foreground mt-1">
                {isLoading ? 'Đang tải...' : `${items.length} xe đang được theo dõi`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchWishlist}>Thử lại</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Chưa có xe nào được lưu</h3>
            <p className="mt-2 text-muted-foreground">
              Bấm vào nút "Lưu tin" trên trang chi tiết xe để thêm vào danh sách theo dõi.
            </p>
            <Button asChild className="mt-4">
              <Link to="/market">Xem xe đạp</Link>
            </Button>
          </div>
        )}

        {/* Wishlist Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const isSold = item.status === 'sold'
              const isRemoving = removingId === item.productId

              return (
                <Card
                  key={item.productId}
                  className={`overflow-hidden transition-all hover:shadow-md ${isSold ? 'opacity-60' : ''}`}
                >
                  {/* Thumbnail */}
                  <Link to={buildRoute.bikeDetail(item.productId)} className="block">
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      {item.primaryImageUrl ? (
                        <img
                          src={item.primaryImageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                          Không có ảnh
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant={isSold ? 'secondary' : 'success'}>
                          {STATUS_LABEL[item.status] ?? item.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  <CardContent className="p-4">
                    <Link to={buildRoute.bikeDetail(item.productId)}>
                      <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="mt-2 text-lg font-bold text-primary">{formatPrice(item.price)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Người bán: {item.sellerName}
                    </p>
                  </CardContent>

                  <CardFooter className="px-4 py-3 border-t flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => handleRemove(item.productId)}
                      disabled={isRemoving}
                    >
                      {isRemoving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Bỏ lưu
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
