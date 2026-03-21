import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from './utils'

interface BikeListingActiveFiltersProps {
  district: string
  hasFilters: boolean
  keyword: string
  maxPrice: string
  minPrice: string
  province: string
  selectedBrandName?: string
  selectedCategoryName?: string
  selectedConditionLabel?: string
  verifiedOnly: boolean
  ward: string
  onClearBrand: () => void
  onClearCategory: () => void
  onClearCondition: () => void
  onClearDistrict: () => void
  onClearKeyword: () => void
  onClearPrice: () => void
  onClearProvince: () => void
  onClearVerifiedOnly: () => void
  onClearWard: () => void
}

function FilterBadge({
  children,
  onRemove,
}: {
  children: React.ReactNode
  onRemove: () => void
}) {
  return (
    <Badge variant="secondary" className="gap-1">
      {children}
      <X className="h-3 w-3 cursor-pointer" onClick={onRemove} />
    </Badge>
  )
}

export function BikeListingActiveFilters({
  district,
  hasFilters,
  keyword,
  maxPrice,
  minPrice,
  province,
  selectedBrandName,
  selectedCategoryName,
  selectedConditionLabel,
  verifiedOnly,
  ward,
  onClearBrand,
  onClearCategory,
  onClearCondition,
  onClearDistrict,
  onClearKeyword,
  onClearPrice,
  onClearProvince,
  onClearVerifiedOnly,
  onClearWard,
}: BikeListingActiveFiltersProps) {
  if (!hasFilters) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keyword && <FilterBadge onRemove={onClearKeyword}>Từ khóa: {keyword}</FilterBadge>}
      {province && <FilterBadge onRemove={onClearProvince}>Khu vực: {province}</FilterBadge>}
      {district && <FilterBadge onRemove={onClearDistrict}>Quận / huyện: {district}</FilterBadge>}
      {ward && <FilterBadge onRemove={onClearWard}>Phường / xã: {ward}</FilterBadge>}
      {selectedCategoryName && <FilterBadge onRemove={onClearCategory}>Danh mục: {selectedCategoryName}</FilterBadge>}
      {selectedBrandName && <FilterBadge onRemove={onClearBrand}>Thương hiệu: {selectedBrandName}</FilterBadge>}
      {selectedConditionLabel && <FilterBadge onRemove={onClearCondition}>Tình trạng: {selectedConditionLabel}</FilterBadge>}
      {verifiedOnly && <FilterBadge onRemove={onClearVerifiedOnly}>Đã kiểm định</FilterBadge>}
      {(minPrice || maxPrice) && (
        <FilterBadge onRemove={onClearPrice}>
          Giá: {minPrice ? formatPrice(Number(minPrice)) : '0'} — {maxPrice ? formatPrice(Number(maxPrice)) : '∞'}
        </FilterBadge>
      )}
    </div>
  )
}
