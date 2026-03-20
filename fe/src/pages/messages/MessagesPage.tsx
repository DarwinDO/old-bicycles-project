import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConversationList } from '@/components/messages/ConversationList'
import { ChatWindow } from '@/components/messages/ChatWindow'
import { chatApi } from '@/api/chat.api'
import { useAuth } from '@/contexts/AuthContext'
import type { Conversation } from '@/types/chat'

export default function MessagesPage() {
  const { isAuthenticated } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const [isBootstrappingConversation, setIsBootstrappingConversation] = useState(false)

  const productId = searchParams.get('productId')

  useEffect(() => {
    if (!productId || !isAuthenticated) {
      return
    }

    let cancelled = false
    const targetProductId = productId

    async function bootstrapConversation() {
      setIsBootstrappingConversation(true)
      setBootstrapError(null)

      try {
        const conversation = await chatApi.createOrGet(targetProductId)

        if (cancelled) {
          return
        }

        setSelectedConversation(conversation)

        setSearchParams((currentParams) => {
          const nextParams = new URLSearchParams(currentParams)
          nextParams.delete('productId')
          return nextParams
        }, { replace: true })
      } catch {
        if (!cancelled) {
          setBootstrapError('Không thể bắt đầu cuộc trò chuyện từ tin đăng này lúc này.')
        }
      } finally {
        if (!cancelled) {
          setIsBootstrappingConversation(false)
        }
      }
    }

    void bootstrapConversation()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, productId, setSearchParams])

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {bootstrapError && (
        <div className="absolute inset-x-0 top-0 z-20 border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {bootstrapError}
        </div>
      )}

      <div
        className={`
          ${selectedConversation ? 'hidden md:flex' : 'flex'}
          w-full md:w-80 lg:w-96 flex-col border-r bg-muted/20
        `}
      >
        <ConversationList
          selectedId={selectedConversation?.id ?? null}
          onSelect={setSelectedConversation}
        />
      </div>

      <div
        className={`
          ${selectedConversation ? 'flex' : 'hidden md:flex'}
          relative flex-1 flex-col bg-background
        `}
      >
        {isBootstrappingConversation && !selectedConversation && (
          <div className="absolute inset-x-0 top-0 z-10 border-b bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Đang tạo cuộc trò chuyện từ trang chi tiết xe...
          </div>
        )}
        <ChatWindow
          key={selectedConversation?.id ?? 'empty'}
          conversation={selectedConversation}
          onBack={() => setSelectedConversation(null)}
        />
      </div>
    </div>
  )
}
