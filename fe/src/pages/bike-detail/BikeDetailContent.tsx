import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Shield, Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Inspection } from '@/types/inspection'
import type { Product, ProductImage } from '@/types/product'
import type { Review } from '@/types/review'
import {
  CONDITION_LABELS,
  formatDate,
  getAverageRating,
  getSortedImages,
} from './utils'

interface BikeDetailContentProps {
  product: Product
  inspection: Inspection | null
  reviews: Review[]
}

function BikeImageGallery({
  productTitle,
  images,
  condition,
  isVerified,
}: {
  productTitle: string
  images: ProductImage[]
  condition?: Product['condition']
  isVerified: boolean
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const sortedImages = getSortedImages(images)
  const currentImage = sortedImages[currentImageIndex] ?? sortedImages[0]

  useEffect(() => {
    setCurrentImageIndex(0)
    setImgErrors({})
  }, [images])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        {currentImage ? (
          <img
            src={imgErrors[currentImage.id] ? undefined : currentImage.url}
            alt={productTitle}
            className="h-full w-full object-cover"
            onError={() => setImgErrors((prev) => ({ ...prev, [currentImage.id]: true }))}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <span className="text-4xl">🚲</span>
            <span className="text-sm">Không có ảnh</span>
          </div>
        )}

        {sortedImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 transition-colors hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 transition-colors hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute left-4 top-4 flex gap-2">
          {condition && (
            <Badge variant="success">{CONDITION_LABELS[condition] ?? condition}</Badge>
          )}
          {isVerified && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Đã kiểm định
            </Badge>
          )}
        </div>
      </div>

      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-4">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                'h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                index === currentImageIndex ? 'border-primary' : 'border-transparent',
              )}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}

function BikeDescriptionCard({ description }: { description?: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mô tả</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line text-muted-foreground">
          {description ?? 'Không có mô tả'}
        </p>
      </CardContent>
    </Card>
  )
}

function BikeSpecificationsCard({ product }: { product: Product }) {
  const specificationRows = [
    ['Thương hiệu', product.brandName],
    ['Danh mục', product.categoryName],
    ['Size khung', product.frameSize],
    ['Size bánh', product.wheelSize],
    ['Bộ truyền động', product.groupset],
    ['Loại phanh', product.brakeTypeName],
    ['Chất liệu khung', product.frameMaterialName],
    ['Khu vực', [product.district, product.province].filter(Boolean).join(', ')],
  ].filter(([, value]) => value)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông số kỹ thuật</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-y-0 sm:grid-cols-2 sm:gap-x-10">
          {specificationRows.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 border-b py-3 last:border-0"
            >
              <span className="min-w-0 text-muted-foreground">{label}</span>
              <span className="min-w-0 break-words text-right font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function BikeInspectionCard({ inspection }: { inspection: Inspection }) {
  return (
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
            <div className="col-span-2 flex justify-between">
              <span className="text-muted-foreground">Độ mòn</span>
              <span className="font-medium">{inspection.wearPercentage}%</span>
            </div>
          )}
        </div>

        {inspection.expertNotes && (
          <>
            <Separator />
            <div>
              <div className="mb-2 text-sm font-medium">Ghi chú chuyên gia</div>
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
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
          )}
        />
      ))}
    </div>
  )
}

function BikeSellerReviewsCard({ reviews }: { reviews: Review[] }) {
  const avgRating = getAverageRating(reviews)

  if (reviews.length === 0) {
    return null
  }

  return (
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
              <span className="shrink-0 text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
            </div>

            {review.comment && (
              <p className="ml-10 text-sm text-muted-foreground">{review.comment}</p>
            )}

            {review.sellerReply && (
              <div className="ml-10 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <div className="text-xs font-medium text-primary">Phản hồi từ người bán</div>
                <p className="mt-1 text-sm text-muted-foreground">{review.sellerReply}</p>
                {review.sellerRepliedAt && (
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(review.sellerRepliedAt)}</p>
                )}
              </div>
            )}

            <Separator />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function BikeDetailContent({ product, inspection, reviews }: BikeDetailContentProps) {
  return (
    <div className="space-y-6 lg:col-span-2">
      <BikeImageGallery
        productTitle={product.title}
        images={product.images}
        condition={product.condition}
        isVerified={product.isVerified}
      />
      <BikeDescriptionCard description={product.description} />
      <BikeSpecificationsCard product={product} />
      {inspection && <BikeInspectionCard inspection={inspection} />}
      <BikeSellerReviewsCard reviews={reviews} />
    </div>
  )
}
