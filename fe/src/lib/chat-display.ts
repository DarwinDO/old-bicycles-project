import type { ChatMessage, Conversation } from '@/types/chat'

export function getConversationPartner(conversation: Conversation, currentUserId: string) {
  const isBuyer = conversation.buyerId === currentUserId

  return {
    id: isBuyer ? conversation.sellerId : conversation.buyerId,
    name: isBuyer ? conversation.sellerName : conversation.buyerName,
  }
}

export function getConversationPreview(conversation: Conversation) {
  return conversation.lastMessage?.trim() || 'Chưa có tin nhắn nào.'
}

export function shouldShowConversationInList(_conversation: Conversation, _selectedId: string | null) {
  return true
}

export function getConversationUnreadCount(conversation: Conversation, selectedId: string | null) {
  if (conversation.id === selectedId) {
    return 0
  }

  return Math.max(0, conversation.unreadCount ?? 0)
}

export function formatConversationTimestamp(value: string) {
  const date = new Date(value)
  const now = new Date()
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  return new Intl.DateTimeFormat(
    'vi-VN',
    isSameDay
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {
          day: '2-digit',
          month: '2-digit',
        },
  ).format(date)
}

export function formatMessageTimestamp(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function sortConversationsNewestFirst(conversations: Conversation[]) {
  return [...conversations].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  })
}

export function normalizeMessagesChronologically(messages: ChatMessage[]) {
  return [...messages].sort((left, right) => {
    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  })
}

export function appendLiveMessage(messages: ChatMessage[], incomingMessage: ChatMessage) {
  if (messages.some((message) => message.id === incomingMessage.id)) {
    return messages
  }

  return normalizeMessagesChronologically([...messages, incomingMessage])
}

export function isOwnMessage(message: ChatMessage, currentUserId: string) {
  return message.senderId === currentUserId
}
