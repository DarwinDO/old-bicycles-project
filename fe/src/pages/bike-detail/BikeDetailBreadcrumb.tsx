import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

interface BikeDetailBreadcrumbProps {
  isAdminDetailView: boolean
  listPageHref: string
  listPageLabel: string
  productTitle: string
  onBackToAdminListings: () => void
}

export function BikeDetailBreadcrumb({
  isAdminDetailView,
  listPageHref,
  listPageLabel,
  productTitle,
  onBackToAdminListings,
}: BikeDetailBreadcrumbProps) {
  return (
    <div className="border-b bg-muted/40">
      <div className="container mx-auto space-y-3 px-4 py-3">
        {isAdminDetailView && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 px-0 text-muted-foreground hover:text-foreground"
            onClick={onBackToAdminListings}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại duyệt tin đăng
          </Button>
        )}

        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to={ROUTES.HOME} className="hover:text-foreground">Trang chủ</Link>
          <span>/</span>
          <Link to={listPageHref} className="hover:text-foreground">{listPageLabel}</Link>
          <span>/</span>
          <span className="line-clamp-1 text-foreground">{productTitle}</span>
        </nav>
      </div>
    </div>
  )
}
