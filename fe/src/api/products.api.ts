import { deleteResult, getResult, http, patchResult, compactParams } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { Product, ProductFilterRequest, ProductMutationInput } from '@/types/product'

function appendFormField(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') {
    return
  }

  formData.append(key, String(value))
}

function buildProductFormData(input: ProductMutationInput) {
  const formData = new FormData()

  appendFormField(formData, 'title', input.title)
  appendFormField(formData, 'description', input.description)
  appendFormField(formData, 'price', input.price)
  appendFormField(formData, 'originalPrice', input.originalPrice)
  appendFormField(formData, 'brakeTypeId', input.brakeTypeId)
  appendFormField(formData, 'frameMaterialId', input.frameMaterialId)
  appendFormField(formData, 'brandId', input.brandId)
  appendFormField(formData, 'categoryId', input.categoryId)
  appendFormField(formData, 'frameSize', input.frameSize)
  appendFormField(formData, 'wheelSize', input.wheelSize)
  appendFormField(formData, 'groupset', input.groupset)
  appendFormField(formData, 'condition', input.condition)
  appendFormField(formData, 'province', input.province)
  appendFormField(formData, 'district', input.district)

  input.images?.forEach((image) => {
    formData.append('images', image)
  })

  return formData
}

export const productsApi = {
  search(params: ProductFilterRequest & { page?: number; size?: number }) {
    return getResult<PageResult<Product>>('/api/products', {
      params: compactParams(params),
    })
  },

  getById(productId: string) {
    return getResult<Product>(`/api/products/${productId}`)
  },

  getMine(page = 0, size = 12) {
    return getResult<PageResult<Product>>('/api/products/my', {
      params: { page, size },
    })
  },

  async create(payload: ProductMutationInput) {
    const response = await http.post('/api/products', buildProductFormData(payload), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.result as Product
  },

  async update(productId: string, payload: ProductMutationInput) {
    const response = await http.put(`/api/products/${productId}`, buildProductFormData(payload), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.result as Product
  },

  delete(productId: string) {
    return deleteResult<string>(`/api/products/${productId}`)
  },

  hide(productId: string) {
    return patchResult<Product>(`/api/products/${productId}/hide`)
  },

  show(productId: string) {
    return patchResult<Product>(`/api/products/${productId}/show`)
  },
}
