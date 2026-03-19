import { useEffect, useState } from 'react'
import { Building2, CreditCard, Landmark, Loader2, Save } from 'lucide-react'
import { payoutsApi } from '@/api/payouts.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ProfileFormState {
  bankCode: string
  bankBin: string
  accountNumber: string
  accountName: string
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

export function PayoutProfileSection() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileFormState>({
    bankCode: '',
    bankBin: '',
    accountNumber: '',
    accountName: '',
  })

  useEffect(() => {
    let ignore = false

    async function loadProfile() {
      setLoading(true)

      try {
        const profile = await payoutsApi.getMyProfile()

        if (ignore) {
          return
        }

        setForm({
          bankCode: profile?.bankCode ?? '',
          bankBin: profile?.bankBin ?? '',
          accountNumber: profile?.accountNumber ?? '',
          accountName: profile?.accountName ?? '',
        })
        setUpdatedAt(profile?.updatedAt ?? null)
        setError(null)
      } catch (requestError) {
        if (!ignore) {
          setError(getErrorMessage(requestError, 'Không thể tải payout profile lúc này.'))
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      ignore = true
    }
  }, [])

  async function handleSave() {
    setSaving(true)
    setSuccess(null)

    try {
      const profile = await payoutsApi.upsertMyProfile(form)
      setUpdatedAt(profile.updatedAt ?? null)
      setError(null)
      setSuccess('Đã lưu payout profile thành công.')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể lưu payout profile lúc này.'))
    } finally {
      setSaving(false)
    }
  }

  const formattedUpdatedAt = updatedAt
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(updatedAt))
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tài khoản nhận tiền</CardTitle>
        <CardDescription>
          Thông tin này được dùng khi admin hoàn tiền thủ công cho buyer hoặc giải ngân tiền cọc cho seller.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải payout profile...
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên ngân hàng</label>
                <div className="relative">
                  <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={form.bankCode}
                    onChange={(event) => setForm((current) => ({ ...current, bankCode: event.target.value }))}
                    className="pl-9"
                    placeholder="Ví dụ: TPBank"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bank BIN</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={form.bankBin}
                    onChange={(event) => setForm((current) => ({ ...current, bankBin: event.target.value }))}
                    className="pl-9"
                    placeholder="Ví dụ: 970423"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số tài khoản</label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={form.accountNumber}
                    onChange={(event) => setForm((current) => ({ ...current, accountNumber: event.target.value }))}
                    className="pl-9"
                    placeholder="Ví dụ: 00000645722"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tên chủ tài khoản</label>
                <Input
                  value={form.accountName}
                  onChange={(event) => setForm((current) => ({ ...current, accountName: event.target.value }))}
                  placeholder="Ví dụ: NGUYEN HOANG VIET DO"
                />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <p>
                Admin sẽ dùng thông tin này để tạo VietQR/hướng dẫn chuyển khoản cho payout thủ công. Sau khi công ty
                chuyển tiền thật, hệ thống mới ghi nhận mã giao dịch ngân hàng (`bankRef`) và đánh dấu payout hoàn tất.
              </p>
              {formattedUpdatedAt && <p className="mt-2">Cập nhật lần cuối: {formattedUpdatedAt}</p>}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu payout profile
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
