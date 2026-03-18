import { useDeferredValue, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, Eye, EyeOff, MoreHorizontal, Search } from 'lucide-react'
import { adminProductsApi } from '@/api/admin-products.api'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { DataTable } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { buildRoute } from '@/constants/routes'
import type { Product, ProductStatus } from '@/types/product'

type ListingAction = 'approve' | 'hide'
type StatusFilter = 'all' | ProductStatus

const PAGE_SIZE = 12
const initialDialogState: {
  open: boolean
  product: Product | null
  action: ListingAction
} = { open: false, product: null, action: 'approve' }

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'hidden', label: 'Đã ẩn' },
  { value: 'pending_inspection', label: 'Chờ kiểm định' },
  { value: 'inspected_passed', label: 'Đạt kiểm định' },
  { value: 'inspected_failed', label: 'Không đạt kiểm định' },
  { value: 'sold', label: 'Đã bán' },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}

function getSellerName(product: Product) {
  if (!product.seller) {
    return 'Chưa có người bán'
  }

  const fullName = `${product.seller.firstName} ${product.seller.lastName}`.trim()
  return fullName || product.seller.id
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export default function AdminListingsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery.trim())
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(initialDialogState)

  useEffect(() => {
    let ignore = false

    async function loadProducts() {
      setLoading(true)

      try {
        const result = await adminProductsApi.getAll({
          keyword: deferredSearchQuery || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          page,
          size: PAGE_SIZE,
        })

        if (ignore) {
          return
        }

        setProducts(result.content)
        setTotalPages(result.totalPages)
        setTotalElements(result.totalElements)
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setProducts([])
        setTotalPages(0)
        setTotalElements(0)
        setError(getErrorMessage(requestError, 'Không thể tải danh sách tin đăng.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      ignore = true
    }
  }, [deferredSearchQuery, page, refreshKey, statusFilter])

  function openActionDialog(product: Product, action: ListingAction) {
    setConfirmDialog({ open: true, product, action })
  }

  async function handleConfirmAction() {
    if (!confirmDialog.product) {
      return
    }

    setIsSubmittingAction(true)

    try {
      if (confirmDialog.action === 'approve') {
        await adminProductsApi.approve(confirmDialog.product.id)
      } else {
        await adminProductsApi.hide(confirmDialog.product.id)
      }

      setConfirmDialog(initialDialogState)
      setRefreshKey((value) => value + 1)
      setError(null)
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          confirmDialog.action === 'approve'
            ? 'Không thể duyệt tin đăng lúc này.'
            : 'Không thể ẩn tin đăng lúc này.',
        ),
      )
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'title',
      header: 'Tiêu đề',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.categoryName ?? 'Chưa gắn danh mục'}
          </p>
        </div>
      ),
    },
    {
      id: 'seller',
      header: 'Người bán',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{getSellerName(row.original)}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.seller?.phone ?? 'Chưa có số điện thoại'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Giá',
      cell: ({ row }) => formatPrice(row.original.price),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày đăng',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(buildRoute.bikeDetail(row.original.id))}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>

            {row.original.status !== 'active' && row.original.status !== 'sold' && (
              <DropdownMenuItem onClick={() => openActionDialog(row.original, 'approve')}>
                <Check className="mr-2 h-4 w-4" />
                {row.original.status === 'hidden' ? 'Hiện lại tin' : 'Duyệt tin'}
              </DropdownMenuItem>
            )}

            {row.original.status !== 'hidden' && (
              <DropdownMenuItem onClick={() => openActionDialog(row.original, 'hide')}>
                <EyeOff className="mr-2 h-4 w-4" />
                Ẩn tin
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Duyệt tin đăng</h2>
        <p className="text-muted-foreground">Quản lý và kiểm duyệt các tin đăng bán xe.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tin đăng..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(0)
            }}
            className="pl-9"
          />
        </div>

        <div className="w-full md:w-56">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as StatusFilter)
              setPage(0)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{loading ? 'Đang tải danh sách...' : `Tìm thấy ${totalElements} tin đăng`}</p>
          <p>
            {statusFilter === 'all'
              ? 'Đang xem tất cả trạng thái'
              : `Đang lọc: ${statusOptions.find((option) => option.value === statusFilter)?.label}`}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={products}
          pageSize={PAGE_SIZE}
          showPagination={false}
          loading={loading}
          loadingRowCount={6}
          emptyMessage={error ? 'Chưa thể hiển thị dữ liệu lúc này.' : 'Không có tin đăng phù hợp.'}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
              disabled={loading || page === 0}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={loading || totalPages === 0 || page >= totalPages - 1}
            >
              Tiếp
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((previous) => ({ ...previous, open }))}
        title={confirmDialog.action === 'approve' ? 'Duyệt tin đăng' : 'Ẩn tin đăng'}
        description={
          confirmDialog.action === 'approve'
            ? 'Bạn có chắc muốn đưa tin đăng này về trạng thái hiển thị?'
            : 'Bạn có chắc muốn ẩn tin đăng này khỏi marketplace?'
        }
        confirmText={
          isSubmittingAction
            ? 'Đang xử lý...'
            : confirmDialog.action === 'approve'
              ? 'Duyệt'
              : 'Ẩn tin'
        }
        onConfirm={handleConfirmAction}
        variant={confirmDialog.action === 'hide' ? 'destructive' : 'default'}
        confirmDisabled={isSubmittingAction}
      />
    </div>
  )
}
