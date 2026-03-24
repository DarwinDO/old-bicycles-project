import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, Loader2, Sparkles } from 'lucide-react'
import { assistantApi } from '@/api/assistant.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { AssistantMessagePayload } from '@/types/assistant'

interface UiMessage extends AssistantMessagePayload {
  id: string
}

function buildSuggestions(role?: string | null) {
  switch (role) {
    case 'seller':
      return [
        'Tin đăng của tôi chưa public vì sao?',
        'Tôi cần làm gì khi payout profile chưa đủ?',
        'Inspection failed thì nên sửa gì trước?',
      ]
    case 'buyer':
      return [
        'Đơn gần đây của tôi đang ở bước nào?',
        'Khi nào tôi nên gửi refund?',
        'Payment hết hạn thì hệ thống xử lý ra sao?',
      ]
    case 'inspector':
      return [
        'Vai trò của tôi trong flow inspection hiện tại là gì?',
        'Khi nào sản phẩm được public sau inspection?',
        'Inspection pass và fail ảnh hưởng listing như thế nào?',
      ]
    case 'admin':
      return [
        'Pending listing và pending inspection khác nhau thế nào?',
        'Refund pending transfer hiện được xử lý ra sao?',
        'Flow inspection bắt buộc trước public đang như thế nào?',
      ]
    default:
      return [
        'Tôi nên bắt đầu mua xe từ đâu?',
        'BikeExchange đang bảo vệ buyer và seller như thế nào?',
        'Tôi có thể xem quy trình giao dịch ở đâu?',
      ]
  }
}

export default function AssistantPage() {
  const { user } = useAuth()
  const suggestions = useMemo(() => buildSuggestions(user?.role), [user?.role])
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: `Xin chào ${user?.firstName || user?.name || 'bạn'}. Tôi có thể giải thích trạng thái đơn hàng, tin đăng, inspection, refund hoặc payout theo dữ liệu hiện tại của tài khoản này.`,
    },
  ])
  const [draft, setDraft] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitMessage(content: string) {
    const trimmed = content.trim()
    if (!trimmed || isSubmitting) {
      return
    }

    const nextUserMessage: UiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }

    const nextConversation = [...messages, nextUserMessage]
    setMessages(nextConversation)
    setDraft('')
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await assistantApi.chat({
        messages: nextConversation
          .filter((message) => message.id !== 'assistant-welcome')
          .map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
      })

      setMessages([
        ...nextConversation,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
        },
      ])
    } catch {
      setError('Trợ lý AI đang tạm thời chưa phản hồi được. Hãy thử lại sau hoặc kiểm tra cấu hình AI Gateway ở backend.')
      setMessages(nextConversation)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Trợ lý BikeExchange
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Hỏi tình trạng thật của tài khoản</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Trợ lý này đọc context hiện tại của tài khoản đang đăng nhập để giải thích đơn hàng, listing,
              inspection, refund và payout. Nó không tự thao tác thay bạn.
            </p>
          </div>

          <Card className="w-full max-w-sm border-primary/15 bg-primary/5 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Gợi ý nên hỏi</CardTitle>
              <CardDescription>Chọn một câu hỏi mẫu để bắt đầu nhanh hơn.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="outline"
                  className="h-auto whitespace-normal text-left"
                  onClick={() => void submitMessage(item)}
                  disabled={isSubmitting}
                >
                  {item}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg">Phiên trao đổi hiện tại</CardTitle>
            <CardDescription>
              Nếu bạn muốn tự kiểm tra thủ công, vẫn có thể mở{' '}
              <Link to={ROUTES.PROFILE} className="font-medium text-primary underline-offset-4 hover:underline">
                hồ sơ
              </Link>{' '}
              hoặc{' '}
              <Link to={ROUTES.GUIDE} className="font-medium text-primary underline-offset-4 hover:underline">
                hướng dẫn
              </Link>
              .
            </CardDescription>
          </CardHeader>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-4 p-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'max-w-3xl rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
                    message.role === 'assistant'
                      ? 'self-start border bg-muted/40 text-foreground'
                      : 'self-end bg-primary text-primary-foreground',
                  )}
                >
                  {message.content}
                </div>
              ))}

              {isSubmitting && (
                <div className="inline-flex max-w-fit items-center gap-2 rounded-2xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Trợ lý đang phân tích context hiện tại...
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            {error && (
              <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                void submitMessage(draft)
              }}
            >
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ví dụ: Vì sao đơn gần đây của tôi đang chờ admin duyệt hoàn tiền?"
                className="min-h-[96px] resize-none"
                disabled={isSubmitting}
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Hãy hỏi ngắn gọn và bám vào tình trạng tài khoản hoặc quy trình thật của hệ thống.
                </p>
                <Button type="submit" disabled={isSubmitting || !draft.trim()}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                  Gửi
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
