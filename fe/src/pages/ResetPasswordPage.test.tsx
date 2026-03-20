import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ResetPasswordPage from './ResetPasswordPage'

const { navigateMock, resetPasswordMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  resetPasswordMock: vi.fn(),
}))

vi.mock('@/services/authService', () => ({
  authService: {
    resetPassword: resetPasswordMock,
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    resetPasswordMock.mockReset()
  })

  it('preserves plus signs in reset tokens from the email link', async () => {
    resetPasswordMock.mockResolvedValueOnce('Password reset successfully.')
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc+123']} >
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/^Mật khẩu mới$/i), 'StrongPass1')
    await user.type(screen.getByLabelText(/^Xác nhận mật khẩu mới$/i), 'StrongPass1')
    await user.click(screen.getByRole('button', { name: /Đặt lại mật khẩu/i }))

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        token: 'abc+123',
        newPassword: 'StrongPass1',
      })
    })
  })

  it('accepts resetToken from redirected links', async () => {
    resetPasswordMock.mockResolvedValueOnce('Password reset successfully.')
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/reset-password?resetToken=redirect-token']} >
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/^Mật khẩu mới$/i), 'StrongPass1')
    await user.type(screen.getByLabelText(/^Xác nhận mật khẩu mới$/i), 'StrongPass1')
    await user.click(screen.getByRole('button', { name: /Đặt lại mật khẩu/i }))

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        token: 'redirect-token',
        newPassword: 'StrongPass1',
      })
    })
  })
})
