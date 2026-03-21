import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productsApi } from '@/api/products.api'
import { buildMarketSearchParams, readMarketSearchState } from '@/lib/market-search'
import type { Product, ProductFilterRequest } from '@/types/product'
import {
  ALL_LOCATION_VALUE,
  CONDITIONS,
  PAGE_SIZE,
  BikeListingActiveFilters,
  BikeListingFilterSidebar,
  BikeListingFiltersContent,
  BikeListingHeader,
  BikeListingResults,
  BikeListingToolbar,
  useAdministrativeLocations,
  useBikeListingReferenceData,
  type BikeConditionValue,
} from './bike-listing'

export default function BikeListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearchState = useMemo(() => readMarketSearchState(searchParams), [searchParams])
  const { brands, categories } = useBikeListingReferenceData()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [keyword, setKeyword] = useState(initialSearchState.keyword)
  const [searchInput, setSearchInput] = useState(initialSearchState.keyword)
  const [province, setProvince] = useState(initialSearchState.province)
  const [district, setDistrict] = useState(initialSearchState.district)
  const [ward, setWard] = useState(initialSearchState.ward)
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialSearchState.categoryId)
  const [selectedCondition, setSelectedCondition] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const {
    districtOptions,
    districtOptionsLoading,
    provinceOptions,
    provinceOptionsLoading,
    selectedDistrictOption,
    selectedProvinceOption,
    selectedWardOption,
    wardOptions,
    wardOptionsLoading,
  } = useAdministrativeLocations({ province, district, ward })

  useEffect(() => {
    const nextState = readMarketSearchState(searchParams)
    setKeyword(nextState.keyword)
    setSearchInput(nextState.keyword)
    setProvince(nextState.province)
    setDistrict(nextState.district)
    setWard(nextState.ward)
    setSelectedCategoryId(nextState.categoryId)
    setPage(0)
  }, [searchParams])

  const updateSearchUrl = useCallback(
    (nextState: Partial<{ keyword: string; province: string; district: string; ward: string; categoryId: string }>) => {
      const params = buildMarketSearchParams({
        keyword: nextState.keyword ?? keyword,
        province: nextState.province ?? province,
        district: nextState.district ?? district,
        ward: nextState.ward ?? ward,
        categoryId: nextState.categoryId ?? selectedCategoryId,
      })

      setSearchParams(params, { replace: true })
    },
    [district, keyword, province, selectedCategoryId, setSearchParams, ward],
  )

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const filters: ProductFilterRequest & { page: number; size: number } = {
      page,
      size: PAGE_SIZE,
    }

    if (keyword) filters.keyword = keyword
    if (province) filters.province = province
    if (district) filters.district = district
    if (ward) filters.ward = ward
    if (selectedBrandId) filters.brandId = selectedBrandId
    if (selectedCategoryId) filters.categoryId = selectedCategoryId
    if (selectedCondition) filters.condition = selectedCondition as ProductFilterRequest['condition']
    if (verifiedOnly) filters.hasInspection = true
    if (minPrice) filters.minPrice = Number(minPrice)
    if (maxPrice) filters.maxPrice = Number(maxPrice)

    try {
      const result = await productsApi.search(filters)
      setProducts(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setError('Không thể tải danh sách xe. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [district, keyword, maxPrice, minPrice, page, province, selectedBrandId, selectedCategoryId, selectedCondition, verifiedOnly, ward])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const handleSearchSubmit = () => {
    const nextKeyword = searchInput.trim()
    setPage(0)
    setKeyword(nextKeyword)
    updateSearchUrl({ keyword: nextKeyword, province, district, ward })
  }

  const handleCategoryChange = (categoryId: string) => {
    setPage(0)
    setSelectedCategoryId(categoryId)
    updateSearchUrl({ categoryId })
  }

  const clearFilters = () => {
    setSearchInput('')
    setKeyword('')
    setProvince('')
    setDistrict('')
    setWard('')
    setSelectedBrandId('')
    setSelectedCategoryId('')
    setSelectedCondition('')
    setVerifiedOnly(false)
    setMinPrice('')
    setMaxPrice('')
    setPage(0)
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const activeFiltersCount = [
    keyword,
    province,
    district,
    ward,
    selectedBrandId,
    selectedCategoryId,
    selectedCondition,
    verifiedOnly ? 'verified' : '',
    minPrice,
    maxPrice,
  ].filter(Boolean).length

  const selectedCategoryName = categories.find((category) => category.id === selectedCategoryId)?.name
  const selectedBrandName = brands.find((brand) => brand.id === selectedBrandId)?.name
  const selectedConditionLabel = CONDITIONS.find((condition) => condition.value === selectedCondition)?.label

  const filtersContent = (
    <BikeListingFiltersContent
      brands={brands}
      categories={categories}
      maxPrice={maxPrice}
      minPrice={minPrice}
      selectedBrandId={selectedBrandId}
      selectedCategoryId={selectedCategoryId}
      selectedCondition={selectedCondition}
      verifiedOnly={verifiedOnly}
      onApplyPrice={() => {
        setPage(0)
        void fetchProducts()
      }}
      onCategoryChange={handleCategoryChange}
      onMaxPriceChange={setMaxPrice}
      onMinPriceChange={setMinPrice}
      onToggleBrand={(brandId) => {
        setSelectedBrandId((current) => (current === brandId ? '' : brandId))
        setPage(0)
      }}
      onToggleCondition={(condition: BikeConditionValue) => {
        setSelectedCondition((current) => (current === condition ? '' : condition))
        setPage(0)
      }}
      onVerifiedOnlyChange={(checked) => {
        setVerifiedOnly(checked)
        setPage(0)
      }}
    />
  )

  return (
    <div className="min-h-screen bg-background">
      <BikeListingHeader isLoading={isLoading} totalElements={totalElements} />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          <BikeListingFilterSidebar activeFiltersCount={activeFiltersCount} onClearFilters={clearFilters}>
            {filtersContent}
          </BikeListingFilterSidebar>

          <div className="min-w-0 flex-1">
            <BikeListingToolbar
              districtOptions={districtOptions}
              districtOptionsLoading={districtOptionsLoading}
              filtersContent={filtersContent}
              provinceOptions={provinceOptions}
              provinceOptionsLoading={provinceOptionsLoading}
              searchInput={searchInput}
              selectedDistrictName={selectedDistrictOption?.name}
              selectedProvinceName={selectedProvinceOption?.name}
              selectedWardName={selectedWardOption?.name}
              viewMode={viewMode}
              wardOptions={wardOptions}
              wardOptionsLoading={wardOptionsLoading}
              onDistrictChange={(value) => {
                const nextDistrict = value === ALL_LOCATION_VALUE ? '' : value
                setPage(0)
                setDistrict(nextDistrict)
                setWard('')
                updateSearchUrl({ district: nextDistrict, ward: '' })
              }}
              onProvinceChange={(value) => {
                const nextProvince = value === ALL_LOCATION_VALUE ? '' : value
                setPage(0)
                setProvince(nextProvince)
                setDistrict('')
                setWard('')
                updateSearchUrl({ province: nextProvince, district: '', ward: '' })
              }}
              onSearchInputChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
              onViewModeChange={setViewMode}
              onWardChange={(value) => {
                const nextWard = value === ALL_LOCATION_VALUE ? '' : value
                setPage(0)
                setWard(nextWard)
                updateSearchUrl({ ward: nextWard })
              }}
            />

            <BikeListingActiveFilters
              district={district}
              hasFilters={activeFiltersCount > 0}
              keyword={keyword}
              maxPrice={maxPrice}
              minPrice={minPrice}
              province={province}
              selectedBrandName={selectedBrandName}
              selectedCategoryName={selectedCategoryName}
              selectedConditionLabel={selectedConditionLabel}
              verifiedOnly={verifiedOnly}
              ward={ward}
              onClearBrand={() => setSelectedBrandId('')}
              onClearCategory={() => handleCategoryChange('')}
              onClearCondition={() => setSelectedCondition('')}
              onClearDistrict={() => {
                setDistrict('')
                setWard('')
                setPage(0)
                updateSearchUrl({ district: '', ward: '' })
              }}
              onClearKeyword={() => {
                setSearchInput('')
                setKeyword('')
                setPage(0)
                updateSearchUrl({ keyword: '' })
              }}
              onClearPrice={() => {
                setMinPrice('')
                setMaxPrice('')
              }}
              onClearProvince={() => {
                setProvince('')
                setDistrict('')
                setWard('')
                setPage(0)
                updateSearchUrl({ province: '', district: '', ward: '' })
              }}
              onClearVerifiedOnly={() => setVerifiedOnly(false)}
              onClearWard={() => {
                setWard('')
                setPage(0)
                updateSearchUrl({ ward: '' })
              }}
            />

            <BikeListingResults
              activeFiltersCount={activeFiltersCount}
              error={error}
              isLoading={isLoading}
              page={page}
              products={products}
              totalPages={totalPages}
              viewMode={viewMode}
              onClearFilters={clearFilters}
              onPageChange={setPage}
              onRetry={() => void fetchProducts()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
