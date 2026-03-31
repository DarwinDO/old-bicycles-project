import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotificationUnreadCount } from './use-notification-unread-count'

const mocks = vi.hoisted(() => ({
  getUnreadCountMock: vi.fn(),
  useAuthMock: vi.fn(),
  useLocationMock: vi.fn(),
  getTokenMock: vi.fn(),
  connectMock: vi.fn(),
  subscribeToNotificationsMock: vi.fn(),
  disconnectMock: vi.fn(),
}))

vi.mock('@/api/notifications.api', () => ({
  notificationsApi: {
    getUnreadCount: mocks.getUnreadCountMock,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mocks.useAuthMock,
}))

vi.mock('@/services/authService', () => ({
  authService: {
    getToken: mocks.getTokenMock,
  },
}))

vi.mock('@/sockets/notification.stomp', () => ({
  createNotificationSocketClient: () => ({
    connect: mocks.connectMock,
    subscribeToNotifications: mocks.subscribeToNotificationsMock,
    disconnect: mocks.disconnectMock,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useLocation: mocks.useLocationMock,
  }
})

describe('useNotificationUnreadCount', () => {
  beforeEach(() => {
    mocks.getUnreadCountMock.mockReset()
    mocks.useAuthMock.mockReset()
    mocks.useLocationMock.mockReset()
    mocks.getTokenMock.mockReset()
    mocks.connectMock.mockReset()
    mocks.subscribeToNotificationsMock.mockReset()
    mocks.disconnectMock.mockReset()
    mocks.useLocationMock.mockReturnValue({ pathname: '/' })
    mocks.getTokenMock.mockReturnValue('token-123')
    mocks.connectMock.mockResolvedValue(undefined)
    mocks.subscribeToNotificationsMock.mockReturnValue(vi.fn())
    mocks.disconnectMock.mockResolvedValue(undefined)
  })

  it('returns unread count from the API for the active user', async () => {
    mocks.useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-1' },
    })
    mocks.getUnreadCountMock.mockResolvedValue(5)

    const { result } = renderHook(() => useNotificationUnreadCount())

    await waitFor(() => {
      expect(result.current).toBe(5)
    })
  })

  it('resets stale unread count immediately when the authenticated user changes', async () => {
    mocks.useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-1' },
    })
    mocks.getUnreadCountMock.mockResolvedValue(3)

    const { result, rerender } = renderHook(() => useNotificationUnreadCount())

    await waitFor(() => {
      expect(result.current).toBe(3)
    })

    const deferredSecondCount: { resolve: ((value: number) => void) | null } = {
      resolve: null,
    }
    mocks.useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-2' },
    })
    mocks.getUnreadCountMock.mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          deferredSecondCount.resolve = resolve
        }),
    )

    act(() => {
      rerender()
    })

    expect(result.current).toBe(0)

    if (deferredSecondCount.resolve) {
      deferredSecondCount.resolve(1)
    }

    await waitFor(() => {
      expect(result.current).toBe(1)
    })
  })

  it('increments unread count immediately when a realtime notification arrives', async () => {
    mocks.useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-1' },
    })
    mocks.getUnreadCountMock.mockResolvedValue(2)

    const notificationListeners: Array<() => void> = []
    mocks.subscribeToNotificationsMock.mockImplementation((listener: () => void) => {
      notificationListeners.push(listener)
      return vi.fn()
    })

    const { result } = renderHook(() => useNotificationUnreadCount())

    await waitFor(() => {
      expect(result.current).toBe(2)
    })

    mocks.getUnreadCountMock.mockResolvedValue(3)

    await act(async () => {
      notificationListeners[0]?.()
    })

    await waitFor(() => {
      expect(result.current).toBe(3)
    })
  })
})
