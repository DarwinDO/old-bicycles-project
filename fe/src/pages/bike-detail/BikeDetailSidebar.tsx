import { AlertTriangle, Clock, CreditCard, Heart, Loader2, MapPin, MessageCircle, Share2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { formatPrice, getTimeAgo } from './utils'

interface BikeDetailSidebarProps {
  product: Product
  sellerFullName: string
  avgRating: number | null
  reviewCount: number
  isOwnListing: boolean
  isLockedForTransaction: boolean
  isOrderActionDisabled: boolean
  isWishlisted: boolean
  wishlistLoading: boolean
  wishlistError: string | null
  orderError: string | null
  onWishlistToggle: () => void
  onOpenOrderDialog: () => void
}

function FeedbackAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}

export function BikeDetailSidebar({
  product,
  sellerFullName,
  avgRating,
  reviewCount,
  isOwnListing,
  isLockedForTransaction,
  isOrderActionDisabled,
  isWishlisted,
  wishlistLoading,
  wishlistError,
  orderError,
  onWishlistToggle,
  onOpenOrderDialog,
}: BikeDetailSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="lg:sticky lg:top-24">
        <CardContent className="p-6">
          <h1 className="text-xl font-bold text-foreground">{product.title}</h1>

          <div className="mt-4">
            <div className="text-3xl font-bold text-primary">{formatPrice(product.price)}</div>
            {product.originalPrice != null && product.originalPrice > product.price && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <Badge variant="secondary">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {(product.district || product.province) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {[product.district, product.province].filter(Boolean).join(', ')}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {getTimeAgo(product.createdAt)}
            </div>
          </div>

          {isLockedForTransaction && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Xe này đang có giao dịch đang xử lý. Tạm thời hệ thống không nhận thêm đơn mua mới cho xe này.
            </div>
          )}

          <Separator className="my-6" />

          <div className="grid gap-4">
            {isOwnListing ? (
              <Button className="w-full" size="lg" disabled>
                <MessageCircle className="mr-2 h-4 w-4" />
                Đây là tin đăng của bạn
              </Button>
            ) : (
              <Button asChild className="w-full" size="lg">
                <Link to={`${ROUTES.MESSAGES}?productId=${product.id}`}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat với người bán
                </Link>
              </Button>
            )}

            <Button
              className="w-full"
              size="lg"
              variant="secondary"
              onClick={onOpenOrderDialog}
              disabled={isOrderActionDisabled}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isOwnListing ? 'Không thể tạo yêu cầu mua' : 'Tạo yêu cầu mua'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onWishlistToggle}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn('mr-2 h-4 w-4', isWishlisted && 'fill-current text-red-500')} />
                )}
                {isWishlisted ? 'Đã lưu' : 'Lưu tin'}
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigator.share?.({ title: product.title, url: window.location.href })}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
            </div>

            {wishlistError && <FeedbackAlert message={wishlistError} />}
            {orderError && <FeedbackAlert message={orderError} />}
          </div>

          <Separator className="my-6" />

          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={product.seller?.avatarUrl ?? undefined} />
              <AvatarFallback>{sellerFullName[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-foreground">{sellerFullName}</div>
              {avgRating !== null && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewCount} đánh giá)</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
