import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  CreditCard, MapPin, Shield, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight,
  Star, Clock, AlertTriangle, Loader2, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { ordersApi } from '@/api/orders.api'
import { productsApi } from '@/api/products.api'
import { wishlistApi } from '@/api/wishlist.api'
import { reviewsApi } from '@/api/reviews.api'
import { inspectionsApi } from '@/api/inspections.api'
import type { PaymentMethod, PaymentOption } from '@/types/order'
import type { Product } from '@/types/product'
import type { Review } from '@/types/review'
import type { Inspection } from '@/types/inspection'
import { useAuth } from '@/contexts/AuthContext'

const CONDITION_LABELS: Record<string, string> = {
  new_90: 'Như mới (90%+)',
  used: 'Đã qua sử dụng',
  needs_repair: 'Cần sửa chữa',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(dateStr))
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hôm nay'
  if (days === 1) return '1 ngày trước'
  if (days < 30) return `${days} ngày trước`
  const months = Math.floor(days / 30)
  return `${months} tháng trước`
}

function parseCurrencyInput(rawValue: string): number | null {
  const normalizedDigits = rawValue.replace(/[^\d]/g, '')

  if (!normalizedDigits) {
    return null
  }

  const parsedValue = Number(normalizedDigits)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

const ORDER_CREATED_NOTICE =
  'Đơn mua đã được tạo. Sau khi người bán chấp nhận đơn, bạn mới có thể lấy mã QR hoặc thông tin chuyển khoản ở mục Đơn mua.'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn('h-4 w-4', s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')}
        />
      ))}
    </div>
  )
}

export default function BikeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [wishlistError, setWishlistError] = useState<string | null>(null)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('partial')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer')
  const [upfrontAmount, setUpfrontAmount] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchAll = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const p = await productsApi.getById(id)
        setProduct(p)

        // Load inspection, reviews, and wishlist status in parallel (non-critical)
        const extras: Promise<unknown>[] = []

        extras.push(inspectionsApi.getByProduct(id).then(setInspection))

        if (p.seller?.id) {
          extras.push(
            reviewsApi.getSellerReviews(p.seller.id, 0, 5)
              .then((res) => setReviews(res.content))
              .catch(() => { /* non-critical */ }),
          )
        }

        // Check wishlist state if user is logged in
        if (isAuthenticated) {
          extras.push(
            wishlistApi.getMine()
              .then((items) => setIsWishlisted(items.some((item) => item.productId === id)))
              .catch(() => { /* non-critical */ }),
          )
        }

        await Promise.allSettled(extras)
      } catch {
        setError('Không thể tải thông tin xe. Vui lòng thử lại.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [id, isAuthenticated])

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }
    if (!product || wishlistLoading) return

    setWishlistLoading(true)
    setWishlistError(null)
    try {
      if (isWishlisted) {
        await wishlistApi.remove(product.id)
        setIsWishlisted(false)
      } else {
        await wishlistApi.add(product.id)
        setIsWishlisted(true)
      }
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
      const status = res?.status
      const beMessage = res?.data?.message

      if (status === 409) {
        // Already in wishlist — just sync state
        setIsWishlisted(true)
      } else {
        // Show BE message if available, otherwise fallback by status
        setWishlistError(
          beMessage
          ?? (status === 403 ? 'Bạn không có quyền thực hiện thao tác này.'
            : status === 400 ? 'Yêu cầu không hợp lệ.'
              : 'Lưu tin thất bại. Vui lòng thử lại.')
        )
      }
    } finally {
      setWishlistLoading(false)
    }
  }

  const images = product?.images ?? []
  const primaryImage = images.find(img => img.isPrimary)
  const sortedImages = primaryImage
    ? [primaryImage, ...images.filter(img => !img.isPrimary)]
    : images

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)

  const sellerFullName = product?.seller
    ? `${product.seller.firstName} ${product.seller.lastName}`.trim()
    : 'Người bán'

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  const isOwnListing = Boolean(user?.id && product?.seller?.id && user.id === product.seller.id)
  const isLockedForTransaction = Boolean(product?.lockedForTransaction)

  const handleOpenOrderDialog = () => {
    if (!product) {
      return
    }

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } })
      return
    }

    if (user?.role !== 'buyer') {
      setOrderError('Chỉ tài khoản người mua mới có thể tạo yêu cầu mua.')
      return
    }

    if (isOwnListing) {
      setOrderError('Bạn không thể tạo đơn cho tin đăng của chính mình.')
      return
    }

    if (isLockedForTransaction) {
      setOrderError('Xe này đang có giao dịch đang xử lý. Bạn chưa thể tạo thêm đơn mua mới.')
      return
    }

    setOrderError(null)
    setIsOrderDialogOpen(true)
  }

  const handleCreateOrder = async () => {
    if (!product) {
      return
    }

    const parsedUpfrontAmount = paymentOption === 'partial' ? parseCurrencyInput(upfrontAmount) : null

    if (paymentOption === 'partial' && (!parsedUpfrontAmount || parsedUpfrontAmount <= 0)) {
      setOrderError('Vui lòng nhập số tiền ứng trước hợp lệ.')
      return
    }

    setOrderLoading(true)
    setOrderError(null)

    try {
      const createdOrder = await ordersApi.create({
        productId: product.id,
        paymentMethod,
        paymentOption,
        upfrontAmount: paymentOption === 'partial' && parsedUpfrontAmount ? parsedUpfrontAmount : undefined,
      })

      setIsOrderDialogOpen(false)
      setUpfrontAmount('')
      navigate(`${ROUTES.PROFILE}?tab=orders`, {
        state: {
          orderCreatedNotice: ORDER_CREATED_NOTICE,
          createdOrderId: createdOrder.id,
        },
      })
    } catch (requestError) {
      if (
        requestError &&
        typeof requestError === 'object' &&
        'response' in requestError &&
        requestError.response &&
        typeof requestError.response === 'object' &&
        'data' in requestError.response &&
        requestError.response.data &&
        typeof requestError.response.data === 'object' &&
        'message' in requestError.response.data &&
        typeof requestError.response.data.message === 'string'
      ) {
        setOrderError(requestError.response.data.message)
      } else {
        setOrderError('Không thể tạo yêu cầu mua lúc này. Vui lòng thử lại.')
      }
    } finally {
      setOrderLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải thông tin xe...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive">{error ?? 'Không tìm thấy sản phẩm.'}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={ROUTES.HOME} className="hover:text-foreground">Trang chủ</Link>
            <span>/</span>
            <Link to={ROUTES.MARKET} className="hover:text-foreground">Mua xe</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {sortedImages.length > 0 ? (
                  <img
                    src={imgErrors[sortedImages[currentImageIndex]?.id] ? undefined : sortedImages[currentImageIndex]?.url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    onError={() => setImgErrors((prev) => ({ ...prev, [sortedImages[currentImageIndex]?.id]: true }))}
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <span className="text-4xl">🚲</span>
                    <span className="text-sm">Không có ảnh</span>
                  </div>
                )}
                {sortedImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute left-4 top-4 flex gap-2">
                  {product.condition && (
                    <Badge variant="success">{CONDITION_LABELS[product.condition] ?? product.condition}</Badge>
                  )}
                  {product.isVerified && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" /> Đã kiểm định
                    </Badge>
                  )}
                </div>
              </div>
              {/* Thumbnails */}
              {sortedImages.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {sortedImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors',
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent',
                      )}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {product.description ?? 'Không có mô tả'}
                </p>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Thông số kỹ thuật</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-0 sm:grid-cols-2">
                  {[
                    ['Thương hiệu', product.brandName],
                    ['Danh mục', product.categoryName],
                    ['Size khung', product.frameSize],
                    ['Size bánh', product.wheelSize],
                    ['Bộ truyền động', product.groupset],
                    ['Loại phanh', product.brakeTypeName],
                    ['Chất liệu khung', product.frameMaterialName],
                    ['Khu vực', [product.district, product.province].filter(Boolean).join(', ')],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b last:border-0">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Inspection Report */}
            {inspection && (
              <Card className="border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Báo cáo kiểm định</CardTitle>
                    {inspection.passed !== null && inspection.passed !== undefined && (
                      <Badge variant={inspection.passed ? 'success' : 'destructive'}>
                        {inspection.passed ? 'Đạt' : 'Không đạt'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inspection.overallScore != null && (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{inspection.overallScore}/10</div>
                      <div className="text-sm text-muted-foreground">Điểm tổng thể</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {inspection.frameScore != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Khung xe</span>
                        <span className="font-medium">{inspection.frameScore}/10</span>
                      </div>
                    )}
                    {inspection.drivetrainScore != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Truyền động</span>
                        <span className="font-medium">{inspection.drivetrainScore}/10</span>
                      </div>
                    )}
                    {inspection.wheelsScore != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bánh xe</span>
                        <span className="font-medium">{inspection.wheelsScore}/10</span>
                      </div>
                    )}
                    {inspection.brakesScore != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phanh</span>
                        <span className="font-medium">{inspection.brakesScore}/10</span>
                      </div>
                    )}
                    {inspection.wearPercentage != null && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-muted-foreground">Độ mòn</span>
                        <span className="font-medium">{inspection.wearPercentage}%</span>
                      </div>
                    )}
                  </div>
                  {inspection.expertNotes && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm font-medium mb-2">Ghi chú chuyên gia</div>
                        <p className="text-sm text-muted-foreground">{inspection.expertNotes}</p>
                      </div>
                    </>
                  )}
                  {inspection.validUntil && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hiệu lực đến</span>
                      <span className="font-medium">{formatDate(inspection.validUntil)}</span>
                    </div>
                  )}
                  {inspection.reportFileUrl && (
                    <a
                      href={inspection.reportFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Xem báo cáo đầy đủ
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Seller Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Đánh giá người bán</CardTitle>
                    {avgRating !== null && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({reviews.length} đánh giá)</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{review.reviewerName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{review.reviewerName}</div>
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(review.createdAt)}</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground ml-10">{review.comment}</p>
                      )}
                      <Separator />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Price & Seller */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h1 className="text-xl font-bold text-foreground">{product.title}</h1>

                <div className="mt-4">
                  <div className="text-3xl font-bold text-primary">{formatPrice(product.price)}</div>
                  {product.originalPrice != null && product.originalPrice > product.price && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground line-through text-sm">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <Badge variant="secondary">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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

                <div className="space-y-3">
                  <Link to={`${ROUTES.MESSAGES}?productId=${product.id}`}>
                    <Button className="w-full" size="lg" disabled={isOwnListing}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {isOwnListing ? 'Đây là tin đăng của bạn' : 'Chat với người bán'}
                    </Button>
                  </Link>
                  <Button
                    className="w-full"
                    size="lg"
                    variant="secondary"
                    onClick={handleOpenOrderDialog}
                    disabled={isLockedForTransaction}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Tạo yêu cầu mua
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleWishlistToggle}
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
                  {/* Wishlist error feedback */}
                  {wishlistError && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {wishlistError}
                    </div>
                  )}
                  {orderError && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {orderError}
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Seller Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={product.seller?.avatarUrl ?? undefined} />
                    <AvatarFallback>{sellerFullName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">{sellerFullName}</div>
                    {avgRating !== null && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{avgRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({reviews.length} đánh giá)</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Mua bán an toàn</div>
                    <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                      <li>• Kiểm tra xe kỹ trước khi mua</li>
                      <li>• Gặp mặt trực tiếp tại nơi công cộng</li>
                      <li>• Không chuyển tiền trước khi xem xe</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={isOrderDialogOpen}
        onOpenChange={(open) => {
          setIsOrderDialogOpen(open)
          if (!open) {
            setOrderError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu mua xe</DialogTitle>
            <DialogDescription>
              Bạn đang tạo yêu cầu mua cho <span className="font-semibold text-foreground">{product.title}</span>.
              Sau khi người bán chấp nhận, bạn sẽ thanh toán ở trang đơn mua của mình.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Giá niêm yết</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{formatPrice(product.price)}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-option">Hình thức thanh toán</Label>
              <Select value={paymentOption} onValueChange={(value) => setPaymentOption(value as PaymentOption)}>
                <SelectTrigger id="payment-option">
                  <SelectValue placeholder="Chọn hình thức thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partial">Đặt cọc một phần</SelectItem>
                  <SelectItem value="full">Thanh toán toàn bộ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Phương thức thanh toán</Label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Chọn phương thức thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Chuyển khoản</SelectItem>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentOption === 'partial' && (
              <div className="space-y-2">
                <Label htmlFor="upfront-amount">Số tiền ứng trước</Label>
                <Input
                  id="upfront-amount"
                  inputMode="numeric"
                  placeholder="Ví dụ: 5000000"
                  value={upfrontAmount}
                  onChange={(event) => setUpfrontAmount(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Backend cho phép bạn nhập số tiền ứng trước hợp lệ, miễn lớn hơn 0 và không vượt quá giá xe.
                </p>
              </div>
            )}

            {orderError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {orderError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsOrderDialogOpen(false)
                setOrderError(null)
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateOrder} disabled={orderLoading}>
              {orderLoading ? 'Đang tạo đơn...' : 'Tạo yêu cầu mua'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
