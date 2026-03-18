import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  MockStompClient,
  mockClients,
  mockSockJsFactory,
} = vi.hoisted(() => {
  interface MockSubscription {
    destination: string
    unsubscribe: ReturnType<typeof vi.fn>
  }

  const mockClients: MockStompClient[] = []

  class MockStompClient {
    connected = false
    active = false
    subscriptions: MockSubscription[] = []
    onConnect?: () => void
    onStompError?: (frame: { headers: Record<string, string> }) => void
    onWebSocketError?: () => void
    onWebSocketClose?: () => void
    onDisconnect?: () => void
    activate = vi.fn(() => {
      this.active = true
    })
    deactivate = vi.fn(async () => {
      this.active = false
      this.connected = false
      this.onDisconnect?.()
    })
    subscribe = vi.fn((destination: string) => {
      const subscription: MockSubscription = {
        destination,
        unsubscribe: vi.fn(),
      }
      this.subscriptions.push(subscription)
      return subscription
    })
    publish = vi.fn()

    constructor() {
      mockClients.push(this)
    }

    simulateConnect() {
      this.connected = true
      this.onConnect?.()
    }

    simulateDisconnect() {
      this.connected = false
      this.onWebSocketClose?.()
    }
  }

  return {
    MockStompClient,
    mockClients,
    mockSockJsFactory: vi.fn(),
  }
})

vi.mock('@stomp/stompjs', () => ({
  Client: MockStompClient,
}))

vi.mock('sockjs-client', () => ({
  default: mockSockJsFactory,
}))

import { createChatSocketClient } from './chat.stomp'

describe('createChatSocketClient', () => {
  beforeEach(() => {
    mockClients.length = 0
    mockSockJsFactory.mockReset()
  })

  it('resubscribes desired destinations after reconnect', async () => {
    const socketClient = createChatSocketClient('token-123')
    const connectPromise = socketClient.connect()
    const mockClient = mockClients[0]

    expect(mockClient.activate).toHaveBeenCalledTimes(1)

    mockClient.simulateConnect()
    await connectPromise

    const unsubscribeConversation = socketClient.subscribeToConversation('conversation-1', vi.fn())
    const unsubscribeInbox = socketClient.subscribeToInbox(vi.fn())

    expect(mockClient.subscribe).toHaveBeenNthCalledWith(1, '/topic/conversation/conversation-1', expect.any(Function))
    expect(mockClient.subscribe).toHaveBeenNthCalledWith(2, '/user/queue/messages', expect.any(Function))

    mockClient.simulateDisconnect()
    mockClient.simulateConnect()

    expect(mockClient.subscribe).toHaveBeenNthCalledWith(3, '/topic/conversation/conversation-1', expect.any(Function))
    expect(mockClient.subscribe).toHaveBeenNthCalledWith(4, '/user/queue/messages', expect.any(Function))

    unsubscribeConversation()
    unsubscribeInbox()
  })

  it('notifies connection listeners when socket state changes', async () => {
    const socketClient = createChatSocketClient('token-123')
    const states: boolean[] = []
    const unsubscribeListener = socketClient.addConnectionListener((connected) => {
      states.push(connected)
    })

    const connectPromise = socketClient.connect()
    const mockClient = mockClients[0]

    mockClient.simulateConnect()
    await connectPromise
    mockClient.simulateDisconnect()

    unsubscribeListener()

    expect(states).toEqual([false, true, false])
  })
})
