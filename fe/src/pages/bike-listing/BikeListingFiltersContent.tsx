import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Brand, Category } from '@/types/reference-data'
import { CONDITIONS, type BikeConditionValue } from './constants'

interface FilterSectionProps {
  title: string
  children: React.ReactNode
}

interface BikeListingFiltersContentProps {
  brands: Brand[]
  categories: Category[]
  maxPrice: string
  minPrice: string
  selectedBrandId: string
  selectedCategoryId: string
  selectedCondition: string
  verifiedOnly: boolean
  onApplyPrice: () => void
  onCategoryChange: (categoryId: string) => void
  onMaxPriceChange: (value: string) => void
  onMinPriceChange: (value: string) => void
  onToggleBrand: (brandId: string) => void
  onToggleCondition: (condition: BikeConditionValue) => void
  onVerifiedOnlyChange: (checked: boolean) => void
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground">{title}</h4>
      {children}
    </div>
  )
}

export function BikeListingFiltersContent({
  brands,
  categories,
  maxPrice,
  minPrice,
  selectedBrandId,
  selectedCategoryId,
  selectedCondition,
  verifiedOnly,
  onApplyPrice,
  onCategoryChange,
  onMaxPriceChange,
  onMinPriceChange,
  onToggleBrand,
  onToggleCondition,
  onVerifiedOnlyChange,
}: BikeListingFiltersContentProps) {
  return (
    <div className="space-y-6">
      <FilterSection title="Danh mục">
        <div className="space-y-1">
          <button
            className={cn(
              'w-full rounded px-2 py-1.5 text-left text-sm transition-colors',
              !selectedCategoryId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
            onClick={() => onCategoryChange('')}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={cn(
                'w-full rounded px-2 py-1.5 text-left text-sm transition-colors',
                selectedCategoryId === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Thương hiệu">
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {brands.map((brand) => (
            <label key={brand.id} className="flex cursor-pointer items-center gap-2 py-0.5">
              <input
                type="checkbox"
                checked={selectedBrandId === brand.id}
                onChange={() => onToggleBrand(brand.id)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">{brand.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Tình trạng">
        <div className="space-y-1">
          {CONDITIONS.map((condition) => (
            <label key={condition.value} className="flex cursor-pointer items-center gap-2 py-0.5">
              <input
                type="checkbox"
                checked={selectedCondition === condition.value}
                onChange={() => onToggleCondition(condition.value)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">{condition.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Khoảng giá (VNĐ)">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            className="text-sm"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            className="text-sm"
          />
        </div>
        <Button size="sm" variant="outline" className="w-full" onClick={onApplyPrice}>
          Áp dụng
        </Button>
      </FilterSection>

      <Separator />

      <FilterSection title="Khác">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => onVerifiedOnlyChange(event.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <span className="flex items-center gap-1 text-sm">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Chỉ xe đã kiểm định
          </span>
        </label>
      </FilterSection>
    </div>
  )
}
