import { getResult, postResult } from '@/lib/http'
import type { Inspection, InspectionEvaluationRequest } from '@/types/inspection'

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
}
