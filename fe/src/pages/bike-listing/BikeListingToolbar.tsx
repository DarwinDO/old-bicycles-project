import { Grid3X3, List, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { AdministrativeOption } from '@/lib/vietnamese-provinces'
import { ALL_LOCATION_VALUE, type BikeListingViewMode } from './constants'

interface BikeListingToolbarProps {
  districtOptions: AdministrativeOption[]
  districtOptionsLoading: boolean
  filtersContent: React.ReactNode
  provinceOptions: AdministrativeOption[]
  provinceOptionsLoading: boolean
  searchInput: string
  selectedDistrictName: string | undefined
  selectedProvinceName: string | undefined
  selectedWardName: string | undefined
  viewMode: BikeListingViewMode
  wardOptions: AdministrativeOption[]
  wardOptionsLoading: boolean
  onDistrictChange: (value: string) => void
  onProvinceChange: (value: string) => void
  onSearchInputChange: (value: string) => void
  onSearchSubmit: () => void
  onViewModeChange: (viewMode: BikeListingViewMode) => void
  onWardChange: (value: string) => void
}

export function BikeListingToolbar({
  districtOptions,
  districtOptionsLoading,
  filtersContent,
  provinceOptions,
  provinceOptionsLoading,
  searchInput,
  selectedDistrictName,
  selectedProvinceName,
  selectedWardName,
  viewMode,
  wardOptions,
  wardOptionsLoading,
  onDistrictChange,
  onProvinceChange,
  onSearchInputChange,
  onSearchSubmit,
  onViewModeChange,
  onWardChange,
}: BikeListingToolbarProps) {
  const districtDisabled = !selectedProvinceName || districtOptionsLoading
  const wardDisabled = !selectedDistrictName || wardOptionsLoading

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm xe đạp..."
            className="h-11 pl-10"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onSearchSubmit()}
          />
        </div>

        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={selectedProvinceName ?? ALL_LOCATION_VALUE}
            onValueChange={onProvinceChange}
            disabled={provinceOptionsLoading}
          >
            <SelectTrigger className="h-11 pl-10 text-left">
              <SelectValue placeholder={provinceOptionsLoading ? 'Đang tải tỉnh / thành phố...' : 'Tỉnh / thành phố'} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ALL_LOCATION_VALUE}>Tất cả tỉnh / thành</SelectItem>
              {provinceOptions.map((option) => (
                <SelectItem key={option.code} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={selectedDistrictName ?? ALL_LOCATION_VALUE}
            onValueChange={onDistrictChange}
            disabled={districtDisabled}
          >
            <SelectTrigger className="h-11 pl-10 text-left">
              <SelectValue
                placeholder={
                  !selectedProvinceName
                    ? 'Quận / huyện'
                    : districtOptionsLoading
                      ? 'Đang tải quận / huyện...'
                      : 'Quận / huyện'
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ALL_LOCATION_VALUE}>Tất cả quận / huyện</SelectItem>
              {districtOptions.map((option) => (
                <SelectItem key={option.code} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={selectedWardName ?? ALL_LOCATION_VALUE}
            onValueChange={onWardChange}
            disabled={wardDisabled}
          >
            <SelectTrigger className="h-11 pl-10 text-left">
              <SelectValue
                placeholder={
                  !selectedDistrictName
                    ? 'Phường / xã'
                    : wardOptionsLoading
                      ? 'Đang tải phường / xã...'
                      : 'Phường / xã'
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ALL_LOCATION_VALUE}>Tất cả phường / xã</SelectItem>
              {wardOptions.map((option) => (
                <SelectItem key={option.code} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="h-11 sm:col-span-2 xl:col-span-1" onClick={onSearchSubmit}>
          Tìm kiếm
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{filtersContent}</div>
          </SheetContent>
        </Sheet>

        <div className="hidden items-center rounded-lg border sm:ml-auto sm:flex">
          <Button
            variant="ghost"
            size="icon"
            className={cn('rounded-r-none', viewMode === 'grid' && 'bg-muted')}
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn('rounded-l-none', viewMode === 'list' && 'bg-muted')}
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
