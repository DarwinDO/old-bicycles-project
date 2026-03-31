import { BuyerOrdersView } from '@/components/profile/BuyerOrdersView'
import { PayoutProfileSection } from '@/components/profile/PayoutProfileSection'
import { SellerListingsSection } from '@/components/profile/SellerListingsSection'
import { SellerReviewsSection } from '@/components/profile/SellerReviewsSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileHero } from './profile/ProfileHero'
import { ProfileInfoSection } from './profile/ProfileInfoSection'
import { ProfileSecuritySection } from './profile/ProfileSecuritySection'
import { ProfileSidebar } from './profile/ProfileSidebar'
import { ProfileWishlistSection } from './profile/ProfileWishlistSection'
import { useProfilePage } from './profile/useProfilePage'

export default function ProfilePage() {
  const profilePage = useProfilePage()

  if (!profilePage.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHero user={profilePage.user} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <ProfileSidebar
            activeTab={profilePage.activeTab}
            visibleTabs={profilePage.visibleTabs}
            onTabChange={profilePage.actions.changeTab}
            onLogout={profilePage.actions.logout}
          />

          <div className="flex-1">
            {profilePage.activeTab === 'profile' ? (
              <ProfileInfoSection
                user={profilePage.user}
                formData={profilePage.profileState.formData}
                isEditing={profilePage.profileState.isEditing}
                isLoading={profilePage.profileState.isLoading}
                error={profilePage.profileState.error}
                success={profilePage.profileState.success}
                onStartEditing={profilePage.profileState.startEditing}
                onCancelEditing={profilePage.profileState.cancelEditing}
                onSave={profilePage.profileState.save}
                onFieldChange={profilePage.profileState.updateField}
              />
            ) : null}

            {profilePage.activeTab === 'security' ? (
              <ProfileSecuritySection
                formData={profilePage.securityState.formData}
                isLoading={profilePage.securityState.isLoading}
                error={profilePage.securityState.error}
                success={profilePage.securityState.success}
                onSubmit={profilePage.securityState.submit}
                onFieldChange={profilePage.securityState.updateField}
              />
            ) : null}

            {profilePage.activeTab === 'orders' ? <BuyerOrdersView /> : null}

            {profilePage.activeTab === 'listings' ? (
              <SellerListingsSection
                listings={profilePage.listingState.items}
                listingsLoading={profilePage.listingState.isLoading}
                togglingId={profilePage.listingState.togglingId}
                onToggleVisibility={profilePage.listingState.toggleVisibility}
                onDeleteListing={profilePage.listingState.deleteListing}
              />
            ) : null}

            {profilePage.activeTab === 'wishlist' ? (
              <ProfileWishlistSection
                items={profilePage.wishlistState.items}
                isLoading={profilePage.wishlistState.isLoading}
                removingId={profilePage.wishlistState.removingId}
                onRemove={profilePage.wishlistState.remove}
              />
            ) : null}

            {profilePage.activeTab === 'reviews' ? (
              profilePage.user.role === 'seller' ? (
                <SellerReviewsSection sellerId={profilePage.user.id} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá từ người mua</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center text-muted-foreground">
                      Chưa có đánh giá nào.
                    </div>
                  </CardContent>
                </Card>
              )
            ) : null}

            {profilePage.activeTab === 'payout' ? <PayoutProfileSection /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
