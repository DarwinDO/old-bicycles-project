import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Camera,
  Check,
  CreditCard,
  Heart,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  PlusCircle,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Trash2,
  User,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ROUTES, buildRoute } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { BuyerOrdersView } from '@/components/profile/BuyerOrdersView'
import { PayoutProfileSection } from '@/components/profile/PayoutProfileSection'
import { SellerReviewsSection } from '@/components/profile/SellerReviewsSection'
import { SellerListingsSection } from '@/components/profile/SellerListingsSection'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { wishlistApi } from '@/api/wishlist.api'
import { productsApi } from '@/api/products.api'
import type { WishlistItem } from '@/types/wishlist'
import type { Product } from '@/types/product'
import { getSellerListingStatusPresentation } from '@/pages/seller/seller-listing-visibility'
import { formatPriceDisplay } from '@/lib/currency-input'

function formatPrice(price: number): string {
  return formatPriceDisplay(price)
}

const tabs = [
  { id: 'profile', label: 'Thông tin', icon: User },
  { id: 'orders', label: 'Đơn mua', icon: ShoppingBag },
  { id: 'listings', label: 'Tin đăng', icon: Package },
  { id: 'wishlist', label: 'Yêu thích', icon: Heart },
  { id: 'reviews', label: 'Đánh giá', icon: Star },
  { id: 'payout', label: 'Nhận tiền', icon: CreditCard },
  { id: 'security', label: 'Bảo mật', icon: Lock },
] as const

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')

  const isInspector = user?.role === 'inspector'
  const isSeller = user?.role === 'seller'
  
  const visibleTabs = useMemo(() => tabs.filter(tab => {
    if (isInspector && ['orders', 'listings', 'reviews', 'payout'].includes(tab.id)) return false
    if (isSeller && tab.id === 'listings') return false
    return true
  }), [isInspector, isSeller])
  
  const visibleTabIds = useMemo(() => new Set(visibleTabs.map(t => t.id)), [visibleTabs])

  const [activeTab, setActiveTab] = useState(
    requestedTab && visibleTabIds.has(requestedTab as any) ? requestedTab : 'profile',
  )
  const [isEditing, setIsEditing] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [removingWishlistId, setRemovingWishlistId] = useState<string | null>(null)

  const [listings, setListings] = useState<Product[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })

  const [pwData, setPwData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      address: user.address || '',
    })
  }, [user])

  useEffect(() => {
    if (requestedTab && visibleTabIds.has(requestedTab as any)) {
      setActiveTab(requestedTab)
    }
  }, [requestedTab, visibleTabIds])

  useEffect(() => {
    if (activeTab !== 'wishlist') {
      return
    }

    setWishlistLoading(true)
    wishlistApi
      .getMine()
      .then(setWishlistItems)
      .catch(() => undefined)
      .finally(() => setWishlistLoading(false))
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'listings') {
      return
    }

    setListingsLoading(true)
    productsApi
      .getMine(0, 20)
      .then((result) => setListings(result.content))
      .catch(() => undefined)
      .finally(() => setListingsLoading(false))
  }, [activeTab])

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab)
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams)

        if (nextTab === 'profile') {
          nextParams.delete('tab')
        } else {
          nextParams.set('tab', nextTab)
        }

        return nextParams
      },
      { replace: true },
    )
  }

  const handleRemoveWishlist = async (productId: string) => {
    setRemovingWishlistId(productId)

    try {
      await wishlistApi.remove(productId)
      setWishlistItems((currentItems) => currentItems.filter((item) => item.productId !== productId))
    } catch {
      // Giữ silent như flow cũ.
    } finally {
      setRemovingWishlistId(null)
    }
  }

  const handleToggleVisibility = async (item: Product, action?: 'hide' | 'show') => {
    setTogglingId(item.id)

    try {
      const nextAction =
        action ?? (item.status === 'active' || item.status === 'inspected_passed' ? 'hide' : 'show')

      if (nextAction === 'hide') {
        await productsApi.hide(item.id)
        setListings((currentListings) =>
          currentListings.map((product) =>
            product.id === item.id ? { ...product, status: 'hidden' as const } : product,
          ),
        )
      } else {
        await productsApi.show(item.id)
        setListings((currentListings) =>
          currentListings.map((product) =>
            product.id === item.id ? { ...product, status: 'pending' as const } : product,
          ),
        )
      }
    } catch {
      // Giữ silent như flow cũ.
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Xóa tin này? Bạn không thể hoàn tác sau khi xóa.')) {
      return
    }

    try {
      await productsApi.delete(id)
      setListings((currentListings) => currentListings.filter((product) => product.id !== id))
    } catch {
      // Giữ silent như flow cũ.
    }
  }

  const handleSaveProfile = async () => {
    setProfileError(null)
    setProfileSuccess(false)
    setProfileLoading(true)

    try {
      const updated = await authService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        defaultAddress: formData.address,
      })

      setUser({ ...user!, ...updated })
      setIsEditing(false)
      setProfileSuccess(true)
      window.setTimeout(() => setProfileSuccess(false), 3000)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Cập nhật thất bại. Vui lòng thử lại.'
      setProfileError(message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.HOME)
  }

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault()

    if (pwData.newPassword !== pwData.confirmNewPassword) {
      setPwError('Mật khẩu mới xác nhận không khớp.')
      return
    }

    setPwError(null)
    setPwSuccess(false)
    setPwLoading(true)

    try {
      await authService.changePassword({
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      })
      setPwSuccess(true)
      setPwData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      setPwError(message)
    } finally {
      setPwLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/90 to-primary py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className="text-2xl">
                  {(user.firstName || user.email)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <h1 className="text-2xl font-bold text-white">{user.name || user.email}</h1>
                {user.verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Đã xác thực
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-white/80">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="shrink-0 lg:w-64">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {visibleTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}

                  <Separator className="my-2" />

                  <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    Cài đặt
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false)
                          setProfileError(null)
                        }}
                      >
                        Hủy
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} disabled={profileLoading}>
                        {profileLoading ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {profileError && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {profileError}
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-950/20">
                      <Check className="h-4 w-4 shrink-0" />
                      Cập nhật thông tin thành công!
                    </div>
                  )}

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Họ
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(event) => setFormData((current) => ({ ...current, firstName: event.target.value }))}
                        disabled={!isEditing}
                        placeholder="Nguyễn"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Tên
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(event) => setFormData((current) => ({ ...current, lastName: event.target.value }))}
                        disabled={!isEditing}
                        placeholder="Văn A"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email
                      </label>
                      <Input value={user.email} disabled />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Số điện thoại
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Địa chỉ
                      </label>
                      <Input
                        value={formData.address}
                        onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                    {pwError && (
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {pwError}
                      </div>
                    )}

                    {pwSuccess && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-950/20">
                        <Check className="h-4 w-4 shrink-0" />
                        Đổi mật khẩu thành công!
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                      <Input
                        type="password"
                        value={pwData.currentPassword}
                        onChange={(event) =>
                          setPwData((current) => ({ ...current, currentPassword: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mật khẩu mới</label>
                      <Input
                        type="password"
                        value={pwData.newPassword}
                        onChange={(event) => setPwData((current) => ({ ...current, newPassword: event.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                      <Input
                        type="password"
                        value={pwData.confirmNewPassword}
                        onChange={(event) =>
                          setPwData((current) => ({ ...current, confirmNewPassword: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <Button type="submit" disabled={pwLoading}>
                      {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'orders' && <BuyerOrdersView />}

            {activeTab === 'listings' && (
              <SellerListingsSection
                listings={listings}
                listingsLoading={listingsLoading}
                togglingId={togglingId}
                onToggleVisibility={handleToggleVisibility}
                onDeleteListing={handleDeleteListing}
              />
            )}

            {false && activeTab === 'listings' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tin đăng của tôi</CardTitle>
                  <Button size="sm" asChild>
                    <Link to={ROUTES.SELLER_NEW_PRODUCT}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Đăng tin mới
                    </Link>
                  </Button>
                </CardHeader>

                <CardContent>
                  {listingsLoading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : listings.length === 0 ? (
                    <div className="py-8 text-center">
                      <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">Chưa có tin đăng nào.</p>
                      <Button asChild variant="outline" className="mt-4" size="sm">
                        <Link to={ROUTES.SELLER_NEW_PRODUCT}>Đăng tin đầu tiên</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {listings.map((item) => {
                        const thumb = item.images?.find((image) => image.isPrimary)?.url ?? item.images?.[0]?.url
                        const isActive = item.status === 'active'
                        const isToggling = togglingId === item.id
                        const statusPresentation = getSellerListingStatusPresentation(item)

                        return (
                          <div
                            key={item.id}
                            className="flex gap-4 rounded-lg border p-4 transition-colors hover:border-primary/30"
                          >
                            <Link to={buildRoute.bikeDetail(item.id)} className="shrink-0">
                              {thumb ? (
                                <img src={thumb} alt={item.title} className="h-20 w-20 rounded-lg object-cover" />
                              ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link to={buildRoute.bikeDetail(item.id)}>
                                <h3 className="line-clamp-1 font-semibold hover:text-primary">{item.title}</h3>
                              </Link>
                              <p className="mt-0.5 font-bold text-primary">{formatPrice(item.price)}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={cn('border-transparent text-xs', statusPresentation.className)}
                                >
                                  {isActive
                                    ? 'Đang hiển thị'
                                    : item.status === 'hidden'
                                      ? 'Đã ẩn'
                                      : item.status === 'sold'
                                        ? 'Đã bán'
                                        : item.status === 'pending'
                                          ? 'Chờ duyệt'
                                          : item.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col gap-1.5">
                              <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs">
                                <Link to={buildRoute.sellerEditProduct(item.id)}>
                                  <Pencil className="mr-1 h-3.5 w-3.5" />
                                  Sửa
                                </Link>
                              </Button>

                              {item.status !== 'sold' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs"
                                  onClick={() => handleToggleVisibility(item)}
                                  disabled={isToggling}
                                >
                                  {isToggling ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : isActive ? (
                                    <EyeOff className="mr-1 h-3.5 w-3.5" />
                                  ) : (
                                    <Eye className="mr-1 h-3.5 w-3.5" />
                                  )}
                                  {isActive ? 'Ẩn' : 'Hiện'}
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteListing(item.id)}
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'wishlist' && (
              <Card>
                <CardHeader>
                  <CardTitle>Xe yêu thích</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlistLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="py-8 text-center">
                      <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">Chưa có xe nào được lưu.</p>
                      <Button asChild variant="outline" className="mt-4" size="sm">
                        <Link to={ROUTES.MARKET}>Xem xe đạp</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {wishlistItems.map((item) => (
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
                              onClick={() => handleRemoveWishlist(item.productId)}
                              disabled={removingWishlistId === item.productId}
                            >
                              {removingWishlistId === item.productId ? 'Đang xóa...' : '✕ Bỏ lưu'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'reviews' && (
              user.role === 'seller' ? (
                <SellerReviewsSection sellerId={user.id} />
              ) : (
                <Card>
                  <CardHeader>
                  <CardTitle>Đánh giá từ người mua</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">Chưa có đánh giá nào.</div>
                </CardContent>
              </Card>
            ))}

            {activeTab === 'payout' && <PayoutProfileSection />}
          </div>
        </div>
      </div>
    </div>
  )
}
