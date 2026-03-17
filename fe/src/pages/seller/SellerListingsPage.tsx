import { useState, useEffect, useCallback } from 'react'
import {
  Package, Search, PlusCircle, PenSquare, EyeOff, Eye, Trash2, ShieldCheck, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES, buildRoute } from '@/constants/routes'
import { productsApi } from '@/api/products.api'
import { inspectionsApi } from '@/api/inspections.api'
import type { Product, ProductStatus } from '@/types/product'

const PAGE_SIZE = 10

const STATUS_LABEL: Record<ProductStatus, string> = {
  pending: 'Chờ duyệt',
  active: 'Đang bán',
  hidden: 'Đã ẩn',
  sold: 'Đã bán',
  pending_inspection: 'Chờ kiểm định',
  inspected_passed: 'Đã kiểm định ✓',
  inspected_failed: 'Kiểm định thất bại',
}

const STATUS_CLASS: Record<ProductStatus, string> = {
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  hidden: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  sold: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  pending_inspection: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  inspected_passed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  inspected_failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(dateStr))
}

export default function SellerListingsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null) // productId being acted on
  const [searchQuery, setSearchQuery] = useState('')

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await productsApi.getMine(page, PAGE_SIZE)
      setProducts(result.content)
      setTotalPages(result.totalPages)
    } catch {
      setError('Không thể tải danh sách tin đăng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleHide = async (productId: string) => {
    setActionLoading(productId)
    try {
      await productsApi.hide(productId)
      await fetchProducts()
    } catch {
      // silent — keep existing list
    } finally {
      setActionLoading(null)
    }
  }

  const handleShow = async (productId: string) => {
    setActionLoading(productId)
    try {
      await productsApi.show(productId)
      await fetchProducts()
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (productId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tin "${title}"? Hành động này không thể hoàn tác.`)) return
    setActionLoading(productId)
    try {
      await productsApi.delete(productId)
      await fetchProducts()
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  const handleRequestInspection = async (productId: string) => {
    setActionLoading(productId)
    try {
      await inspectionsApi.request(productId)
      await fetchProducts()
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between shrink-0 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý tin đăng</h2>
          <p className="text-muted-foreground">Sửa, ẩn, xóa hoặc yêu cầu kiểm định xe của bạn.</p>
        </div>
        <Link to={ROUTES.SELL}>
          <Button className="w-full sm:w-auto gap-2">
            <PlusCircle className="h-4 w-4" /> Đăng tin mới
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo tên xe..."
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 flex items-center justify-between">
          {error}
          <Button variant="ghost" size="sm" onClick={fetchProducts}>Thử lại</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sản phẩm</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Giá</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Ngày đăng</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    {searchQuery ? 'Không tìm thấy tin đăng phù hợp.' : 'Bạn chưa có tin đăng nào.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isActing = actionLoading === product.id
                  const canEdit = product.status !== 'sold'
                  const canHide = product.status === 'active' || product.status === 'inspected_passed'
                  const canShow = product.status === 'hidden'
                  const canRequestInspection = product.status === 'active'

                  return (
                    <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.title}
                              className="h-10 w-10 rounded object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center rounded bg-secondary/50 shrink-0">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground line-clamp-1">{product.title}</p>
                            <p className="text-xs text-muted-foreground truncate">#{product.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle font-medium whitespace-nowrap">{formatPrice(product.price)}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[product.status]}`}>
                          {STATUS_LABEL[product.status]}
                        </span>
                        {product.status === 'hidden' && (
                          <p className="text-xs text-muted-foreground mt-1">Hiện lại → về Chờ duyệt</p>
                        )}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground hidden md:table-cell whitespace-nowrap">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex justify-end gap-1">
                          {isActing ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              {canEdit && (
                                <Link to={buildRoute.sellerEditProduct(product.id)}>
                                  <Button variant="ghost" size="icon" title="Chỉnh sửa">
                                    <PenSquare className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {canHide && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Ẩn tin"
                                  onClick={() => handleHide(product.id)}
                                >
                                  <EyeOff className="h-4 w-4" />
                                </Button>
                              )}
                              {canShow && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Hiện lại (về Chờ duyệt)"
                                  onClick={() => handleShow(product.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              {canRequestInspection && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Yêu cầu kiểm định"
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:bg-emerald-950/30"
                                  onClick={() => handleRequestInspection(product.id)}
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                </Button>
                              )}
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Xóa tin"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDelete(product.id, product.title)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trước
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || isLoading}
          >
            Tiếp
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
