import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MessagesPage from './MessagesPage'

const { createOrGetMock } = vi.hoisted(() => ({
  createOrGetMock: vi.fn(),
}))

vi.mock('@/api/chat.api', () => ({
  chatApi: {
    createOrGet: createOrGetMock,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'buyer-1', role: 'buyer' },
  }),
}))

vi.mock('@/components/messages/ConversationList', () => ({
  ConversationList: ({ onSelect }: { onSelect: (value: { id: string; productTitle: string }) => void }) => (
    <button onClick={() => onSelect({ id: 'conversation-1', productTitle: 'Xe đạp kiểm thử' })}>Danh sách hội thoại</button>
  ),
}))

vi.mock('@/components/messages/ChatWindow', () => ({
  ChatWindow: ({ conversation }: { conversation: { id: string } | null }) => (
    <div>{conversation ? `ChatWindow:${conversation.id}` : 'ChatWindow:empty'}</div>
  ),
}))

describe('MessagesPage', () => {
  it('bootstraps conversation from productId query', async () => {
    createOrGetMock.mockResolvedValueOnce({
      id: 'conversation-bootstrapped',
      productId: 'product-1',
      productTitle: 'Xe đạp kiểm thử',
      buyerId: 'buyer-1',
      buyerName: 'Người mua',
      sellerId: 'seller-1',
      sellerName: 'Người bán',
      lastMessage: null,
      updatedAt: new Date().toISOString(),
    })

    render(
      <MemoryRouter initialEntries={['/messages?productId=product-1']}>
        <MessagesPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(createOrGetMock).toHaveBeenCalledWith('product-1')
    })

    await screen.findByText('ChatWindow:conversation-bootstrapped')
  })
})
