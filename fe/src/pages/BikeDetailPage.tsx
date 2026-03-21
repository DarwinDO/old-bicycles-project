import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { adminProductsApi } from '@/api/admin-products.api'
import { inspectionsApi } from '@/api/inspections.api'
import { ordersApi } from '@/api/orders.api'
import { productsApi } from '@/api/products.api'
import { reviewsApi } from '@/api/reviews.api'
import { wishlistApi } from '@/api/wishlist.api'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import type { Inspection } from '@/types/inspection'
import type { Product } from '@/types/product'
import type { Review } from '@/types/review'
import {
  BikeDetailBreadcrumb,
  BikeDetailContent,
  BikeDetailSidebar,
  BikeOrderDialog,
  ORDER_CREATED_NOTICE,
  getAverageRating,
  getSellerFullName,
  parseCurrencyInput,
  type BikeOrderFormValues,
} from './bike-detail'

interface ApiErrorResponse {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

function getApiErrorDetails(error: unknown) {
  const response = (error as ApiErrorResponse)?.response

  return {
    status: response?.status,
    message: response?.data?.message,
  }
}

export default function BikeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [wishlistError, setWishlistError] = useState<string | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)

  useEffect(() => {
    if (!id || isAuthLoading) return

    const fetchAll = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const loadedProduct = user?.role === 'admin'
          ? await adminProductsApi.getById(id)
          : await productsApi.getById(id)
        setProduct(loadedProduct)

        const extras: Promise<unknown>[] = [
          inspectionsApi.getByProduct(id).then(setInspection),
        ]

        if (loadedProduct.seller?.id) {
          extras.push(
            reviewsApi.getSellerReviews(loadedProduct.seller.id, 0, 5)
              .then((response) => setReviews(response.content))
              .catch(() => { /* non-critical */ }),
          )
        }

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
  }, [id, isAuthenticated, isAuthLoading, user?.role])

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }

    if (!product || wishlistLoading) {
      return
    }

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
    } catch (errorResponse) {
      const { status, message } = getApiErrorDetails(errorResponse)

      if (status === 409) {
        setIsWishlisted(true)
      } else {
        setWishlistError(
          message
          ?? (status === 403 ? 'Bạn không có quyền thực hiện thao tác này.'
            : status === 400 ? 'Yêu cầu không hợp lệ.'
              : 'Lưu tin thất bại. Vui lòng thử lại.'),
        )
      }
    } finally {
      setWishlistLoading(false)
    }
  }

  const isOwnListing = Boolean(user?.id && product?.seller?.id && user.id === product.seller.id)
  const isLockedForTransaction = Boolean(product?.lockedForTransaction)
  const isOrderActionDisabled = isLockedForTransaction || isOwnListing
  const isAdminDetailView = user?.role === 'admin'
  const listPageHref = isAdminDetailView ? ROUTES.ADMIN_LISTINGS : ROUTES.MARKET
  const listPageLabel = isAdminDetailView ? 'Duyệt tin đăng' : 'Mua xe'

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

  const handleCreateOrder = async ({
    paymentOption,
    paymentMethod,
    upfrontAmount,
  }: BikeOrderFormValues) => {
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
      navigate(`${ROUTES.PROFILE}?tab=orders`, {
        state: {
          orderCreatedNotice: ORDER_CREATED_NOTICE,
          createdOrderId: createdOrder.id,
        },
      })
    } catch (errorResponse) {
      const { message } = getApiErrorDetails(errorResponse)
      setOrderError(message ?? 'Không thể tạo yêu cầu mua lúc này. Vui lòng thử lại.')
    } finally {
      setOrderLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin xe...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <p className="text-destructive">{error ?? 'Không tìm thấy sản phẩm.'}</p>
          <Button variant="outline" onClick={() => navigate(listPageHref)}>Quay lại</Button>
        </div>
      </div>
    )
  }

  const sellerFullName = getSellerFullName(product.seller)
  const avgRating = getAverageRating(reviews)

  return (
    <div className="min-h-screen bg-background">
      <BikeDetailBreadcrumb
        isAdminDetailView={isAdminDetailView}
        listPageHref={listPageHref}
        listPageLabel={listPageLabel}
        productTitle={product.title}
        onBackToAdminListings={() => navigate(ROUTES.ADMIN_LISTINGS)}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <BikeDetailContent product={product} inspection={inspection} reviews={reviews} />
          <BikeDetailSidebar
            product={product}
            sellerFullName={sellerFullName}
            avgRating={avgRating}
            reviewCount={reviews.length}
            isOwnListing={isOwnListing}
            isLockedForTransaction={isLockedForTransaction}
            isOrderActionDisabled={isOrderActionDisabled}
            isWishlisted={isWishlisted}
            wishlistLoading={wishlistLoading}
            wishlistError={wishlistError}
            orderError={orderError}
            onWishlistToggle={handleWishlistToggle}
            onOpenOrderDialog={handleOpenOrderDialog}
          />
        </div>
      </div>

      <BikeOrderDialog
        open={isOrderDialogOpen}
        productTitle={product.title}
        productPrice={product.price}
        error={orderError}
        isSubmitting={orderLoading}
        onOpenChange={(open) => {
          setIsOrderDialogOpen(open)
          if (!open) {
            setOrderError(null)
          }
        }}
        onSubmit={handleCreateOrder}
      />
    </div>
  )
}
