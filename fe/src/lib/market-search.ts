export interface MarketSearchState {
  keyword: string
  province: string
  categoryId: string
}

export function readMarketSearchState(searchParams: URLSearchParams): MarketSearchState {
  return {
    keyword: searchParams.get('keyword') ?? '',
    province: searchParams.get('province') ?? '',
    categoryId: searchParams.get('categoryId') ?? '',
  }
}

export function buildMarketSearchParams(state: Partial<MarketSearchState>) {
  const nextParams = new URLSearchParams()

  if (state.keyword?.trim()) {
    nextParams.set('keyword', state.keyword.trim())
  }

  if (state.province?.trim()) {
    nextParams.set('province', state.province.trim())
  }

  if (state.categoryId?.trim()) {
    nextParams.set('categoryId', state.categoryId.trim())
  }

  return nextParams
}
