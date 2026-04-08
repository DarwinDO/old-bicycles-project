import { describe, expect, it } from 'vitest'
import {
  getMissingRequiredImageTypes,
  validateSellBikeForm,
  validateSellBikeStep,
} from '@/lib/sell-bike-form'

const completeForm = {
  title: 'Giant TCR',
  categoryId: 'road-bikes',
  brandId: 'giant',
  condition: 'used',
  frameSize: 'M',
  wheelSize: '700c',
  brakeTypeId: 'disc',
  frameMaterialId: 'carbon',
  groupsetId: 'shimano-105',
  price: '25000000',
  originalPrice: '',
  province: 'Hà Nội',
  images: [{ type: 'main' }, { type: 'groupset' }, { type: 'serial' }] as Array<{
    type: 'main' | 'groupset' | 'serial' | 'other'
  }>,
}

describe('sell-bike-form validation', () => {
  it('returns missing required fields for step 1', () => {
    expect(
      validateSellBikeStep(1, {
        ...completeForm,
        title: '',
        categoryId: '',
        brandId: '',
        condition: '',
      }),
    ).toEqual({
      title: 'Vui lòng nhập tiêu đề tin đăng.',
      categoryId: 'Vui lòng chọn danh mục.',
      brandId: 'Vui lòng chọn thương hiệu.',
      condition: 'Vui lòng chọn tình trạng xe.',
    })
  })

  it('returns missing required fields for step 2', () => {
    expect(
      validateSellBikeStep(2, {
        ...completeForm,
        frameSize: '',
        wheelSize: '',
        brakeTypeId: '',
        frameMaterialId: '',
        groupsetId: '',
      }),
    ).toEqual({
      frameSize: 'Vui lòng chọn size khung.',
      wheelSize: 'Vui lòng chọn kích thước bánh.',
      brakeTypeId: 'Vui lòng chọn loại phanh.',
      frameMaterialId: 'Vui lòng chọn chất liệu khung.',
      groupsetId: 'Vui lòng chọn bộ truyền động.',
    })
  })

  it('detects missing required image slots for step 3', () => {
    expect(getMissingRequiredImageTypes([{ type: 'main' }])).toEqual(['groupset', 'serial'])
    expect(
      validateSellBikeStep(3, {
        ...completeForm,
        images: [{ type: 'main' }],
      }),
    ).toEqual({
      images: 'Vui lòng tải đủ 3 ảnh bắt buộc: toàn thân xe, bộ truyền động và số khung.',
    })
  })

  it('can validate edit flow image step with at least one image', () => {
    expect(
      validateSellBikeStep(
        3,
        {
          ...completeForm,
          images: [],
        },
        { imageRequirement: 'atLeastOne' },
      ),
    ).toEqual({
      images: 'Vui lòng giữ lại hoặc tải lên ít nhất 1 ảnh cho tin đăng.',
    })
  })

  it('requires a valid price and province for step 4', () => {
    expect(
      validateSellBikeStep(4, {
        ...completeForm,
        price: '0',
        province: '',
      }),
    ).toEqual({
      price: 'Vui lòng nhập giá bán hợp lệ.',
      province: 'Vui lòng chọn tỉnh / thành phố.',
    })
  })

  it('rejects selling price above 1000 tỷ', () => {
    expect(
      validateSellBikeStep(4, {
        ...completeForm,
        price: '1000000000001',
      }),
    ).toEqual({
      price: 'Giá bán không được vượt quá 1.000 tỷ VND.',
    })
  })

  it('rejects original price above 1000 tỷ', () => {
    expect(
      validateSellBikeStep(4, {
        ...completeForm,
        originalPrice: '1000000000001',
      }),
    ).toEqual({
      originalPrice: 'Giá gốc không được vượt quá 1.000 tỷ VND.',
    })
  })

  it('accepts original price exactly at 1000 tỷ', () => {
    expect(
      validateSellBikeStep(4, {
        ...completeForm,
        originalPrice: '1000000000000',
      }),
    ).toEqual({})
  })

  it('returns the first invalid step when validating the full form', () => {
    expect(
      validateSellBikeForm({
        ...completeForm,
        title: '',
        images: [],
      }),
    ).toEqual({
      step: 1,
      errors: {
        title: 'Vui lòng nhập tiêu đề tin đăng.',
      },
    })
  })

  it('returns step 2 first when technical fields are missing', () => {
    expect(
      validateSellBikeForm({
        ...completeForm,
        frameSize: '',
      }),
    ).toEqual({
      step: 2,
      errors: {
        frameSize: 'Vui lòng chọn size khung.',
      },
    })
  })

  it('returns step 3 first for edit flow when image list is empty', () => {
    expect(
      validateSellBikeForm(
        {
          ...completeForm,
          images: [],
        },
        { imageRequirement: 'atLeastOne' },
      ),
    ).toEqual({
      step: 3,
      errors: {
        images: 'Vui lòng giữ lại hoặc tải lên ít nhất 1 ảnh cho tin đăng.',
      },
    })
  })
})
