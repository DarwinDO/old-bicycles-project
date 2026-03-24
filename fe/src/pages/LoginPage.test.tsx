import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'

const { loginMock, navigateMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: null }),
  }
})

describe('LoginPage', () => {
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
})
