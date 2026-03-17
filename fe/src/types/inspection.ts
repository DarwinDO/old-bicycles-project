export interface InspectionEvaluationRequest {
  frameScore: number
  forkScore: number
  brakesScore: number
  drivetrainScore: number
  wheelsScore: number
  wearPercentage: number
  expertNotes?: string
  passed: boolean
}

export interface Inspection {
  id: string
  productId: string
  inspectorId: string
  overallScore?: number | null
  frameScore?: number | null
  forkScore?: number | null
  brakesScore?: number | null
  drivetrainScore?: number | null
  wheelsScore?: number | null
  wearPercentage?: number | null
  expertNotes?: string | null
  passed?: boolean | null
  reportFileUrl?: string | null
  validUntil?: string | null
  createdAt: string
}
