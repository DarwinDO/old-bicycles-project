import { describe, expect, it } from 'vitest'
import {
  appendLiveMessage,
  getConversationPartner,
  getConversationPreview,
  isOwnMessage,
  normalizeMessagesChronologically,
  shouldShowConversationInList,
  sortConversationsNewestFirst,
} from '@/lib/chat-display'
import type { ChatMessage, Conversation } from '@/types/chat'

const sampleConversation: Conversation = {
  id: 'conversation-1',
  productId: 'product-1',
  productTitle: 'Xe đạp touring',
  buyerId: 'buyer-1',
  buyerName: 'Nguyễn Minh Buyer',
  sellerId: 'seller-1',
  sellerName: 'Trần Hà Seller',
  lastMessage: 'Mình hẹn xem xe chiều nay nhé',
  updatedAt: '2026-03-17T10:00:00.000Z',
}

const earlyMessage: ChatMessage = {
  id: 'message-1',
  conversationId: 'conversation-1',
  senderId: 'buyer-1',
  senderName: 'Nguyễn Minh Buyer',
  content: 'Chào bạn, xe còn không?',
  createdAt: '2026-03-17T09:00:00.000Z',
}

const lateMessage: ChatMessage = {
  id: 'message-2',
  conversationId: 'conversation-1',
  senderId: 'seller-1',
  senderName: 'Trần Hà Seller',
  content: 'Xe vẫn còn nhé.',
  createdAt: '2026-03-17T09:05:00.000Z',
}

describe('chat-display helpers', () => {
  it('returns the opposite participant for buyer and seller views', () => {
    expect(getConversationPartner(sampleConversation, 'buyer-1')).toEqual({
      id: 'seller-1',
      name: 'Trần Hà Seller',
    })

    expect(getConversationPartner(sampleConversation, 'seller-1')).toEqual({
      id: 'buyer-1',
      name: 'Nguyễn Minh Buyer',
    })
  })

  it('falls back when there is no last message', () => {
    expect(
      getConversationPreview({
        ...sampleConversation,
        lastMessage: '',
      }),
    ).toBe('Chưa có tin nhắn nào.')
  })

  it('hides empty conversations from the list unless they are currently selected', () => {
    const emptyConversation: Conversation = {
      ...sampleConversation,
      id: 'conversation-empty',
      lastMessage: null,
    }

    expect(shouldShowConversationInList(sampleConversation, null)).toBe(true)
    expect(shouldShowConversationInList(emptyConversation, null)).toBe(false)
    expect(shouldShowConversationInList(emptyConversation, 'conversation-empty')).toBe(true)
  })

  it('sorts conversations from newest to oldest', () => {
    const olderConversation: Conversation = {
      ...sampleConversation,
      id: 'conversation-2',
      updatedAt: '2026-03-16T10:00:00.000Z',
    }

    expect(sortConversationsNewestFirst([olderConversation, sampleConversation]).map((item) => item.id)).toEqual([
      'conversation-1',
      'conversation-2',
    ])
  })

  it('normalizes messages into ascending chronological order', () => {
    expect(normalizeMessagesChronologically([lateMessage, earlyMessage]).map((item) => item.id)).toEqual([
      'message-1',
      'message-2',
    ])
  })

  it('appends a live message only once', () => {
    const withIncoming = appendLiveMessage([earlyMessage], lateMessage)
    const withDuplicate = appendLiveMessage(withIncoming, lateMessage)

    expect(withIncoming.map((item) => item.id)).toEqual(['message-1', 'message-2'])
    expect(withDuplicate.map((item) => item.id)).toEqual(['message-1', 'message-2'])
  })

  it('detects whether the current user owns a message', () => {
    expect(isOwnMessage(earlyMessage, 'buyer-1')).toBe(true)
    expect(isOwnMessage(earlyMessage, 'seller-1')).toBe(false)
  })
})
