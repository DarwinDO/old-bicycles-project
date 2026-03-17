import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { inspectionsApi } from '@/api/inspections.api'

interface ScoreItem {
  id: 'frame' | 'fork' | 'brakes' | 'drivetrain' | 'wheels'
  label: string
  score: number
}

const INITIAL_SCORES: ScoreItem[] = [
  { id: 'frame', label: 'Khung (Frame)', score: 5 },
  { id: 'fork', label: 'Phuộc (Fork)', score: 5 },
  { id: 'brakes', label: 'Phanh (Brakes)', score: 5 },
  { id: 'drivetrain', label: 'Truyền động (Drivetrain)', score: 5 },
  { id: 'wheels', label: 'Bánh xe (Wheels)', score: 5 },
]

export default function InspectionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [scores, setScores] = useState<ScoreItem[]>(INITIAL_SCORES)
  const [chainWear, setChainWear] = useState('10')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScoreChange = (scoreId: string, value: number) => {
    setScores((prev) => prev.map((s) => (s.id === scoreId ? { ...s, score: value } : s)))
  }

  const overallScore = (scores.reduce((acc, s) => acc + s.score, 0) / scores.length).toFixed(1)

  const handleSubmit = async (passed: boolean) => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      await inspectionsApi.evaluate(id, {
        frameScore: scores.find((s) => s.id === 'frame')!.score,
        forkScore: scores.find((s) => s.id === 'fork')!.score,
        brakesScore: scores.find((s) => s.id === 'brakes')!.score,
        drivetrainScore: scores.find((s) => s.id === 'drivetrain')!.score,
        wheelsScore: scores.find((s) => s.id === 'wheels')!.score,
        wearPercentage: Number(chainWear),
        expertNotes: notes.trim() || undefined,
        passed,
      })
      navigate('/inspector/history')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Gửi kết quả thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Kiểm định xe #{id}</h2>
          <p className="text-muted-foreground">Điền đầy đủ thông tin kiểm định và xác nhận kết quả.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border bg-destructive/10 text-destructive p-4 text-sm">{error}</div>
      )}

      {/* Scoring */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Đánh giá từng hạng mục (1–5)</h3>
        {scores.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <label className="text-sm text-foreground">{item.label}</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleScoreChange(item.id, value)}
                  className={`w-10 h-10 rounded-lg border transition-colors ${
                    item.score === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted border-border hover:bg-muted/80'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <label className="text-sm text-foreground">% mòn xích líp</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={chainWear}
              onChange={(e) => setChainWear(e.target.value)}
              className="w-20 text-center"
              min="0"
              max="100"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="font-semibold text-foreground">Điểm tổng thể</span>
          <span className="text-2xl font-bold text-primary">{overallScore}/5</span>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Ghi chú chuyên gia</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nhập ghi chú về tình trạng xe..."
          className="w-full h-32 p-3 bg-muted border border-border rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => handleSubmit(true)}
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Đạt chuẩn (Passed)
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Không đạt (Failed)
        </Button>
      </div>
    </div>
  )
}
