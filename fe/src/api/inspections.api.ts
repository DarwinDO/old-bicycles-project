import { compactParams, getResult, postResult } from '@/lib/http'
import type {
  Inspection,
  InspectionDashboard,
  InspectionEvaluationRequest,
  InspectionHistoryItem,
  InspectionListFilters,
  InspectionRequestItem,
} from '@/types/inspection'
import type { PageResult } from '@/types/api'

export const inspectionsApi = {
  request(productId: string) {
    return postResult<Inspection>(`/api/inspections/request/${productId}`)
  },

  evaluate(productId: string, request: InspectionEvaluationRequest) {
    return postResult<Inspection, InspectionEvaluationRequest>(`/api/inspections/evaluate/${productId}`, request)
  },

  getByProduct(productId: string) {
    return getResult<Inspection>(`/api/inspections/product/${productId}`)
  },

  getDashboard() {
    return getResult<InspectionDashboard>('/api/inspections/dashboard')
  },

  getRequests(filters: InspectionListFilters) {
    return getResult<PageResult<InspectionRequestItem>>('/api/inspections/requests', {
      params: compactParams(filters),
    })
  },

  getHistory(filters: InspectionListFilters) {
    return getResult<PageResult<InspectionHistoryItem>>('/api/inspections/history', {
      params: compactParams(filters),
    })
  },
}
