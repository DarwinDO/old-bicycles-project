import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { ChatMessage, SendChatMessageRequest } from '@/types/chat'

export interface ChatSocketClient {
  connect: () => Promise<void>
  subscribeToConversation: (conversationId: string, onMessage: (message: ChatMessage) => void) => () => void
  subscribeToInbox: (onMessage: (message: ChatMessage) => void) => () => void
  sendMessage: (payload: SendChatMessageRequest) => void
  disconnect: () => Promise<void>
  isConnected: () => boolean
}

function getSocketBaseUrl() {
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!configuredApiBaseUrl) {
    return window.location.origin
  }

  return configuredApiBaseUrl.replace(/\/api\/?$/, '')
}

function parseMessage(frame: IMessage): ChatMessage {
  return JSON.parse(frame.body) as ChatMessage
}

export function createChatSocketClient(token: string): ChatSocketClient {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${getSocketBaseUrl()}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
      authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
  })

  const subscriptions = new Set<StompSubscription>()

  return {
    connect() {
      if (client.connected) {
        return Promise.resolve()
      }

      return new Promise<void>((resolve, reject) => {
        client.onConnect = () => resolve()
        client.onStompError = (frame) => reject(new Error(frame.headers.message ?? 'STOMP connection failed'))
        client.onWebSocketError = () => reject(new Error('WebSocket connection failed'))
        client.activate()
      })
    },

    subscribeToConversation(conversationId, onMessage) {
      const subscription = client.subscribe(`/topic/conversation/${conversationId}`, (frame) => {
        onMessage(parseMessage(frame))
      })

      subscriptions.add(subscription)

      return () => {
        subscription.unsubscribe()
        subscriptions.delete(subscription)
      }
    },

    subscribeToInbox(onMessage) {
      const subscription = client.subscribe('/user/queue/messages', (frame) => {
        onMessage(parseMessage(frame))
      })

      subscriptions.add(subscription)

      return () => {
        subscription.unsubscribe()
        subscriptions.delete(subscription)
      }
    },

    sendMessage(payload) {
      client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(payload),
      })
    },

    async disconnect() {
      subscriptions.forEach((subscription) => subscription.unsubscribe())
      subscriptions.clear()

      if (!client.active) {
        return
      }

      await client.deactivate()
    },

    isConnected() {
      return client.connected
    },
  }
}
