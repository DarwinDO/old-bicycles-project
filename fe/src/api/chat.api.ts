import { getResult, postResult, putResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { ChatMessage, Conversation } from '@/types/chat'

export const chatApi = {
  getMine() {
    return getResult<Conversation[]>('/api/conversations/me')
  },

  createOrGet(productId: string) {
    return postResult<Conversation>('/api/conversations', undefined, {
      params: { productId },
    })
  },

  getMessages(conversationId: string, page = 0, size = 20) {
    return getResult<PageResult<ChatMessage>>(`/api/conversations/${conversationId}/messages`, {
      params: { page, size },
    })
  },

  markAsRead(conversationId: string) {
    return putResult<void>(`/api/conversations/${conversationId}/read`)
  },
}
