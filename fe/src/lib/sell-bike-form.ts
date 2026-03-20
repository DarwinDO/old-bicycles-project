export type SellBikeStep = 1 | 2 | 3 | 4
export type SellBikeImageType = 'main' | 'groupset' | 'serial' | 'other'
export type SellBikeValidationErrorKey =
  | 'title'
  | 'categoryId'
  | 'brandId'
  | 'condition'
  | 'images'
  | 'price'
  | 'province'

export type SellBikeValidationErrors = Partial<Record<SellBikeValidationErrorKey, string>>

export interface SellBikeValidationState {
  title: string
  categoryId: string
  brandId: string
  condition: string
  price: string
  province: string
  images: Array<{ type: SellBikeImageType }>
}

const REQUIRED_IMAGE_TYPES: SellBikeImageType[] = ['main', 'groupset', 'serial']

export function getMissingRequiredImageTypes(images: Array<{ type: SellBikeImageType }>) {
  const imageTypes = new Set(images.map((image) => image.type))

  return REQUIRED_IMAGE_TYPES.filter((type) => !imageTypes.has(type))
}

export function validateSellBikeStep(
  step: SellBikeStep,
  formData: SellBikeValidationState,
): SellBikeValidationErrors {
  const errors: SellBikeValidationErrors = {}

  if (step === 1) {
    if (!formData.title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề tin đăng.'
    }

    if (!formData.categoryId.trim()) {
      errors.categoryId = 'Vui lòng chọn danh mục.'
    }

    if (!formData.brandId.trim()) {
      errors.brandId = 'Vui lòng chọn thương hiệu.'
    }

    if (!formData.condition.trim()) {
      errors.condition = 'Vui lòng chọn tình trạng xe.'
    }
  }

  if (step === 3 && getMissingRequiredImageTypes(formData.images).length > 0) {
    errors.images = 'Vui lòng tải đủ 3 ảnh bắt buộc: toàn thân xe, bộ truyền động và số khung.'
  }

  if (step === 4) {
    const parsedPrice = Number(formData.price)

    if (!formData.price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = 'Vui lòng nhập giá bán hợp lệ.'
    }

    if (!formData.province.trim()) {
      errors.province = 'Vui lòng chọn tỉnh / thành phố.'
    }
  }

  return errors
}

export function validateSellBikeForm(formData: SellBikeValidationState) {
  const stepOrder: SellBikeStep[] = [1, 3, 4]

  for (const step of stepOrder) {
    const errors = validateSellBikeStep(step, formData)

    if (Object.keys(errors).length > 0) {
      return { step, errors }
    }
  }

  return null
}
