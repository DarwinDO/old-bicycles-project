export const PAGE_SIZE = 6
export const ALL_LOCATION_VALUE = '__all__'

export const CONDITIONS = [
  { value: 'new_90', label: 'Như mới (90%+)' },
  { value: 'used', label: 'Đã qua sử dụng' },
  { value: 'needs_repair', label: 'Cần sửa chữa' },
] as const

export type BikeConditionValue = typeof CONDITIONS[number]['value']
export type BikeListingViewMode = 'grid' | 'list'
