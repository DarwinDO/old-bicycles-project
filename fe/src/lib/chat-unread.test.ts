import { afterEach, describe, expect, it } from 'vitest'
import {
  clearStoredChatUnreadCount,
  getStoredChatUnreadCount,
  incrementStoredChatUnreadCount,
  setStoredChatUnreadCount,
} from './chat-unread'

describe('chat-unread storage helpers', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('starts with zero when nothing is stored', () => {
    expect(getStoredChatUnreadCount()).toBe(0)
  })

  it('increments unread count and persists it', () => {
    expect(incrementStoredChatUnreadCount()).toBe(1)
    expect(incrementStoredChatUnreadCount()).toBe(2)
    expect(getStoredChatUnreadCount()).toBe(2)
  })

  it('clears unread count when reset', () => {
    setStoredChatUnreadCount(5)
    clearStoredChatUnreadCount()
    expect(getStoredChatUnreadCount()).toBe(0)
  })

  it('clamps unread count to avoid huge badge values', () => {
    setStoredChatUnreadCount(500)
    expect(getStoredChatUnreadCount()).toBe(99)
  })
})
