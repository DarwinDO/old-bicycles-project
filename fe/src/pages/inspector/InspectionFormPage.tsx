import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, ExternalLink, Loader2, Paperclip, ShieldCheck, XCircle } from 'lucide-react'
import { inspectionsApi } from '@/api/inspections.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Inspection, InspectionEvaluationRequest } from '@/types/inspection'
import type { Product } from '@/types/product'

interface ScoreItem {
  id: keyof Pick<
    InspectionEvaluationRequest,
    'frameScore' | 'forkScore' | 'brakesScore' | 'drivetrainScore' | 'wheelsScore'
  >
  label: string
  score: number
}

const INITIAL_SCORES: ScoreItem[] = [
  { id: 'frameScore', label: 'Khung (Frame)', score: 5 },
  { id: 'forkScore', label: 'Phuộc (Fork)', score: 5 },
  { id: 'brakesScore', label: 'Phanh (Brakes)', score: 5 },
  { id: 'drivetrainScore', label: 'Truyền động (Drivetrain)', score: 5 },
  { id: 'wheelsScore', label: 'Bánh xe (Wheels)', score: 5 },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function buildScoresFromInspection(inspection: Inspection | null): ScoreItem[] {
  return INITIAL_SCORES.map((item) => ({
    ...item,
    score: inspection?.[item.id] ?? item.score,
  }))
}

export default function InspectionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [scores, setScores] = useState<ScoreItem[]>(INITIAL_SCORES)
  const [wearPercentage, setWearPercentage] = useState('10')
  const [notes, setNotes] = useState('')
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadContext() {
      if (!id) {
        return
      }

      setLoading(true)

      try {
        const [productResult, inspectionResult] = await Promise.all([
          inspectionsApi.getProductContext(id),
          inspectionsApi.getByProduct(id),
        ])

        if (ignore) {
          return
        }

        setProduct(productResult)
        setInspection(inspectionResult)
        setScores(buildScoresFromInspection(inspectionResult))
        setWearPercentage(String(inspectionResult?.wearPercentage ?? 10))
        setNotes(inspectionResult?.expertNotes ?? '')
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setError(getErrorMessage(requestError, 'Không thể tải thông tin kiểm định cho xe này.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadContext()

    return () => {
      ignore = true
    }
  }, [id])

  const overallScore = useMemo(() => {
    const average = scores.reduce((total, item) => total + item.score, 0) / scores.length
    return average.toFixed(1)
  }, [scores])

  function handleScoreChange(scoreId: ScoreItem['id'], value: number) {
    setScores((current) =>
      current.map((scoreItem) =>
        scoreItem.id === scoreId ? { ...scoreItem, score: value } : scoreItem,
      ),
    )
  }

  async function handleSubmit(passed: boolean) {
    if (!id) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (reportFile) {
        const uploadedInspection = await inspectionsApi.uploadReport(id, reportFile)
        setInspection(uploadedInspection)
      }

      const payload: InspectionEvaluationRequest = {
        frameScore: scores.find((item) => item.id === 'frameScore')!.score,
        forkScore: scores.find((item) => item.id === 'forkScore')!.score,
        brakesScore: scores.find((item) => item.id === 'brakesScore')!.score,
        drivetrainScore: scores.find((item) => item.id === 'drivetrainScore')!.score,
        wheelsScore: scores.find((item) => item.id === 'wheelsScore')!.score,
        wearPercentage: Number(wearPercentage),
        expertNotes: notes.trim() || undefined,
        passed,
      }

      await inspectionsApi.evaluate(id, payload)
      navigate('/inspector/history')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Gửi kết quả kiểm định thất bại. Vui lòng thử lại.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Phiếu kiểm định</h2>
          <p className="text-muted-foreground">
            Điền điểm cho từng hạng mục, ghi chú nhận xét và xác nhận xe đạt hay không đạt.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="h-40 overflow-hidden rounded-xl bg-muted lg:w-64">
                {product?.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ShieldCheck className="h-10 w-10 opacity-40" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{product?.title ?? `Xe #${id}`}</h3>
                <p className="text-sm text-muted-foreground">
                  Người bán: {product?.seller ? `${product.seller.firstName} ${product.seller.lastName}` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Giá đăng: {product ? formatCurrency(product.price) : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tỉnh thành: {product?.province || 'Chưa cập nhật'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Yêu cầu gửi lúc: {formatDateTime(inspection?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Chấm điểm từng hạng mục</h3>
                <p className="text-sm text-muted-foreground">
                  Thang điểm ở đây là từ 1 đến 5, trong đó 5 là tốt nhất.
                </p>
              </div>

              {scores.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-medium text-foreground">{item.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleScoreChange(item.id, value)}
                        className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${
                          item.score === value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <label className="text-sm font-medium text-foreground">% hao mòn chung</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={wearPercentage}
                    onChange={(event) => setWearPercentage(event.target.value)}
                    className="w-24 text-center"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-semibold text-foreground">Điểm tổng thể</span>
                <span className="text-2xl font-bold text-primary">{overallScore}/5</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-foreground">Ghi chú chuyên gia</h3>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ghi nhận các lỗi quan trọng, khuyến nghị sửa chữa hoặc điểm mạnh của xe..."
              className="mt-4 h-36 w-full rounded-lg border border-border bg-muted p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="mt-6 space-y-3 border-t border-border pt-4">
              <div>
                <h4 className="font-medium text-foreground">Báo cáo đính kèm</h4>
                <p className="text-sm text-muted-foreground">
                  Có thể tải lên file PDF hoặc tài liệu scan để seller xem lại sau khi có kết quả kiểm định.
                </p>
              </div>

              <Input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={(event) => setReportFile(event.target.files?.[0] ?? null)}
              />

              {reportFile && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Paperclip className="h-4 w-4" />
                  <span>{reportFile.name}</span>
                </div>
              )}

              {inspection?.reportFileUrl && !reportFile && (
                <a
                  href={inspection.reportFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Xem báo cáo hiện tại
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Đạt chuẩn
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Không đạt
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
