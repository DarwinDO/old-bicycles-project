export interface Brand {
  id: string
  name: string
  logoUrl?: string | null
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string | null
  parentName?: string | null
  createdAt: string
}

export interface ReferenceValue {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export interface BrandUpsertRequest {
  name: string
  logoUrl?: string
}

export interface CategoryUpsertRequest {
  name: string
  slug: string
  parentId?: string
}

export interface ReferenceValueUpsertRequest {
  name: string
  description?: string
}
