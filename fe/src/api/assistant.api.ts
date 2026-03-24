import { postResult } from '@/lib/http'
import type { AssistantChatRequest, AssistantChatResponse } from '@/types/assistant'

export const assistantApi = {
  chat(payload: AssistantChatRequest) {
    return postResult<AssistantChatResponse, AssistantChatRequest>('/api/assistant/chat', payload)
  },
}
