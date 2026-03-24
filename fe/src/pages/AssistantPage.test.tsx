import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AssistantPage from './AssistantPage'

const { chatMock } = vi.hoisted(() => ({
  chatMock: vi.fn(),
}))

vi.mock('@/api/assistant.api', () => ({
  assistantApi: {
    chat: chatMock,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'buyer-1',
      role: 'buyer',
      firstName: 'An',
      name: 'An Buyer',
    },
  }),
}))

describe('AssistantPage', () => {
  it('sends the current conversation to the assistant API and renders the reply', async () => {
    chatMock.mockResolvedValueOnce({
      reply: 'Đơn gần đây của bạn đang chờ admin duyệt hoàn tiền.',
    })

    render(
      <MemoryRouter>
        <AssistantPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Ví dụ:/i), {
      target: { value: 'Đơn gần đây của tôi đang ở bước nào?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^Gửi$/i }))

    await waitFor(() => {
      expect(chatMock).toHaveBeenCalledTimes(1)
    })

    expect(chatMock).toHaveBeenCalledWith({
      messages: [
        {
          role: 'user',
          content: 'Đơn gần đây của tôi đang ở bước nào?',
        },
      ],
    })

    await screen.findByText('Đơn gần đây của bạn đang chờ admin duyệt hoàn tiền.')
  })
})
