import { MapPin, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_LOCATION_VALUE } from './home.constants'
import type { HomeLocationState, HomeSearchActions, HomeSearchState } from './useHomePageData'

const HERO_BADGES = [
  'Mọi tin đăng đều đã qua kiểm định',
  'Đặt cọc và xác nhận giao dịch an toàn',
  'Hoàn tiền và giải ngân đối soát kỹ lưỡng',
]

interface HomeHeroSectionProps {
  searchState: HomeSearchState
  locationState: HomeLocationState
  searchActions: HomeSearchActions
  onSearch: () => void
}

export function HomeHeroSection({
  searchState,
  locationState,
  searchActions,
  onSearch,
}: HomeHeroSectionProps) {
  const { keyword, province, district, ward } = searchState
  const {
    provinceOptions,
    districtOptions,
    wardOptions,
    provinceOptionsLoading,
    districtOptionsLoading,
    wardOptionsLoading,
  } = locationState

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1920')] bg-cover bg-center opacity-10" />
      <div className="container relative mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Nền tảng mua bán xe đạp thể thao cũ có kiểm định
          </h1>
          <p className="mt-6 text-lg text-white/90 md:text-xl">
            Tìm kiếm linh hoạt, an tâm giao dịch với mọi tin đăng đã được ban quản trị kiểm
            định kỹ lưỡng.
          </p>

          <Card className="mt-10 p-2 shadow-xl">
            <CardContent className="p-0">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(3,minmax(0,0.8fr))_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên xe, thương hiệu hoặc model"
                    className="h-12 pl-10"
                    value={keyword}
                    onChange={(event) => searchActions.setKeyword(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && onSearch()}
                  />
                </div>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select
                    value={province || ALL_LOCATION_VALUE}
                    onValueChange={(value) =>
                      searchActions.setProvince(value === ALL_LOCATION_VALUE ? '' : value)
                    }
                  >
                    <SelectTrigger className="h-12 pl-10 text-left">
                      <SelectValue
                        placeholder={
                          provinceOptionsLoading
                            ? 'Đang tải tỉnh / thành phố...'
                            : 'Tỉnh / thành phố'
                        }
                      />
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
                    value={district || ALL_LOCATION_VALUE}
                    onValueChange={(value) =>
                      searchActions.setDistrict(value === ALL_LOCATION_VALUE ? '' : value)
                    }
                    disabled={!province || districtOptionsLoading}
                  >
                    <SelectTrigger className="h-12 pl-10 text-left">
                      <SelectValue
                        placeholder={
                          !province
                            ? 'Chọn quận / huyện'
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
                    value={ward || ALL_LOCATION_VALUE}
                    onValueChange={(value) =>
                      searchActions.setWard(value === ALL_LOCATION_VALUE ? '' : value)
                    }
                    disabled={!district || wardOptionsLoading}
                  >
                    <SelectTrigger className="h-12 pl-10 text-left">
                      <SelectValue
                        placeholder={
                          !district
                            ? 'Chọn phường / xã'
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

                <Button
                  size="lg"
                  className="h-12 px-8 sm:col-span-2 xl:col-span-1"
                  onClick={onSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Tìm kiếm
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {HERO_BADGES.map((badge) => (
              <Badge key={badge} variant="secondary" className="px-3 py-1.5 text-sm">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
