import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'

const { loginMock, navigateMock, resendVerificationMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  navigateMock: vi.fn(),
  resendVerificationMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
    resendVerification: resendVerificationMock,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: null }),
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset()
    navigateMock.mockReset()
    resendVerificationMock.mockReset()
  })

  it('renders the email/password login form without social login buttons', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Đăng nhập với Google/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Đăng nhập với Facebook/i })).not.toBeInTheDocument()
  })

  it('submits email/password credentials and redirects after successful login', async () => {
    loginMock.mockResolvedValueOnce(undefined)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'buyer.alpha@oldbicycle.dev' },
    })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'Password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'buyer.alpha@oldbicycle.dev',
        password: 'Password1',
      })
    })

    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true })
  })

  it('shows resend verification recovery when backend rejects unverified email login', async () => {
    loginMock.mockRejectedValueOnce({
      response: {
        data: {
          code: 1024,
          message: 'Please verify your email before logging in',
        },
      },
    })
    resendVerificationMock.mockResolvedValueOnce(
      'Nếu tài khoản tồn tại và chưa được xác thực, hệ thống đã gửi lại email xác thực.',
    )

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'buyer.alpha@oldbicycle.dev' },
    })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'Password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(await screen.findByText('Tài khoản này chưa xác thực email.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gửi lại email xác thực' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Gửi lại email xác thực' }))

    await waitFor(() => {
      expect(resendVerificationMock).toHaveBeenCalledWith('buyer.alpha@oldbicycle.dev')
    })

    expect(
      await screen.findByText('Nếu tài khoản tồn tại và chưa được xác thực, hệ thống đã gửi lại email xác thực.'),
    ).toBeInTheDocument()
  })
})
