import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { wishlistApi } from '@/api/wishlist.api'
import { productsApi } from '@/api/products.api'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import type { Product } from '@/types/product'
import type { WishlistItem } from '@/types/wishlist'
import { getVisibleProfileTabs, isProfileTabId } from './profile.constants'
import {
  INITIAL_PASSWORD_FORM_DATA,
  createProfileFormData,
  type PasswordFormData,
  type ProfileFormData,
  type ProfileTabId,
} from './profile.types'

function mapProfileUpdateError(error: unknown) {
  let message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message

  if (!message) {
    return 'Cập nhật thất bại. Vui lòng thử lại.'
  }

  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('phone') && normalizedMessage.includes('exist')) {
    return 'Số điện thoại này đã được sử dụng.'
  }

  return message
}

function mapPasswordError(error: unknown) {
  let message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message

  if (!message) {
    return 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
  }

  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('incorrect') ||
    normalizedMessage.includes('wrong') ||
    normalizedMessage.includes('invalid') ||
    normalizedMessage.includes('credential')
  ) {
    return 'Mật khẩu hiện tại không chính xác.'
  }

  return message
}

export function useProfilePage() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const visibleTabs = useMemo(() => getVisibleProfileTabs(user?.role), [user?.role])
  const visibleTabIds = useMemo(() => new Set(visibleTabs.map((tab) => tab.id)), [visibleTabs])

  const [activeTab, setActiveTab] = useState<ProfileTabId>(() => {
    if (isProfileTabId(requestedTab) && visibleTabIds.has(requestedTab)) {
      return requestedTab
    }

    return 'profile'
  })
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

  const [formData, setFormData] = useState(() => createProfileFormData(user))
  const [passwordData, setPasswordData] = useState<PasswordFormData>(INITIAL_PASSWORD_FORM_DATA)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    setFormData(createProfileFormData(user))
  }, [user])

  useEffect(() => {
    if (isProfileTabId(requestedTab) && visibleTabIds.has(requestedTab)) {
      setActiveTab(requestedTab)
      return
    }

    if (!visibleTabIds.has(activeTab)) {
      setActiveTab('profile')
    }
  }, [activeTab, requestedTab, visibleTabIds])

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

  function handleTabChange(nextTab: ProfileTabId) {
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

  function updateProfileField(field: keyof ProfileFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function startEditingProfile() {
    setIsEditing(true)
  }

  function cancelEditingProfile() {
    setIsEditing(false)
    setProfileError(null)
  }

  async function saveProfile() {
    setProfileError(null)
    setProfileSuccess(false)

    if (!formData.firstName.trim()) {
      setProfileError('Vui lòng nhập họ.')
      return
    }

    if (!formData.lastName.trim()) {
      setProfileError('Vui lòng nhập tên.')
      return
    }

    setProfileLoading(true)

    try {
      const updated = await authService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        defaultAddress: formData.address.trim(),
      })

      setUser({ ...user!, ...updated })
      setIsEditing(false)
      setProfileSuccess(true)
      window.setTimeout(() => setProfileSuccess(false), 3000)
    } catch (error: unknown) {
      setProfileError(mapProfileUpdateError(error))
    } finally {
      setProfileLoading(false)
    }
  }

  function updatePasswordField(field: keyof PasswordFormData, value: string) {
    setPasswordData((current) => ({ ...current, [field]: value }))
  }

  async function submitPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!passwordData.currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.')
      return
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('Mật khẩu mới xác nhận không khớp.')
      return
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại.')
      return
    }

    setPasswordError(null)
    setPasswordSuccess(false)
    setPasswordLoading(true)

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordSuccess(true)
      setPasswordData(INITIAL_PASSWORD_FORM_DATA)
    } catch (error: unknown) {
      setPasswordError(mapPasswordError(error))
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleRemoveWishlist(productId: string) {
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

  async function handleToggleVisibility(item: Product, action: 'hide' | 'show') {
    setTogglingId(item.id)

    try {
      if (action === 'hide') {
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

  async function handleDeleteListing(id: string) {
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

  async function handleLogout() {
    await logout()
    navigate(ROUTES.HOME)
  }

  return {
    user,
    activeTab,
    visibleTabs,
    profileState: {
      formData,
      isEditing,
      isLoading: profileLoading,
      error: profileError,
      success: profileSuccess,
      startEditing: startEditingProfile,
      cancelEditing: cancelEditingProfile,
      updateField: updateProfileField,
      save: saveProfile,
    },
    securityState: {
      formData: passwordData,
      isLoading: passwordLoading,
      error: passwordError,
      success: passwordSuccess,
      updateField: updatePasswordField,
      submit: submitPasswordChange,
    },
    wishlistState: {
      items: wishlistItems,
      isLoading: wishlistLoading,
      removingId: removingWishlistId,
      remove: handleRemoveWishlist,
    },
    listingState: {
      items: listings,
      isLoading: listingsLoading,
      togglingId,
      toggleVisibility: handleToggleVisibility,
      deleteListing: handleDeleteListing,
    },
    actions: {
      changeTab: handleTabChange,
      logout: handleLogout,
    },
  }
}
