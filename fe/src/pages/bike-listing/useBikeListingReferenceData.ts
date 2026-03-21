import { useEffect, useState } from 'react'
import { referenceDataApi } from '@/api/reference-data.api'
import type { Brand, Category } from '@/types/reference-data'

export function useBikeListingReferenceData() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([referenceDataApi.getBrands(), referenceDataApi.getCategories()])
      .then(([loadedBrands, loadedCategories]) => {
        setBrands(loadedBrands)
        setCategories(loadedCategories)
      })
      .catch(() => {
        setBrands([])
        setCategories([])
      })
  }, [])

  return { brands, categories }
}
