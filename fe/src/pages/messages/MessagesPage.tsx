import { useState } from 'react'
import { ConversationList } from '@/components/messages/ConversationList'
import { ChatWindow } from '@/components/messages/ChatWindow'
import type { Conversation } from '@/types/chat'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
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
        <ChatWindow
          key={selectedConversation?.id ?? 'empty'}
          conversation={selectedConversation}
          onBack={() => setSelectedConversation(null)}
        />
      </div>
    </div>
  )
}
