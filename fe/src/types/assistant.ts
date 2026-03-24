export type AssistantMessageRole = 'user' | 'assistant'

export interface AssistantMessagePayload {
  role: AssistantMessageRole
  content: string
}

export interface AssistantChatRequest {
  messages: AssistantMessagePayload[]
}

export interface AssistantChatResponse {
  reply: string
}
