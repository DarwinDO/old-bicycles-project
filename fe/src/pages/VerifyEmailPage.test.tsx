import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VerifyEmailPage from './VerifyEmailPage'

const { navigateMock, setUserMock, verifyEmailMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setUserMock: vi.fn(),
  verifyEmailMock: vi.fn(),
}))

vi.mock('@/services/authService', () => ({
  authService: {
    verifyEmail: verifyEmailMock,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    setUser: setUserMock,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    setUserMock.mockReset()
    verifyEmailMock.mockReset()
  })

  it('shows invalid state when token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Liên kết không hợp lệ')).toBeInTheDocument()
    expect(verifyEmailMock).not.toHaveBeenCalled()
  })

  it('treats success query params as redirect feedback instead of confirmed verification', async () => {
    render(
      <MemoryRouter initialEntries={['/verify-email?status=success&message=Da%20xac%20thuc']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Đã nhận phản hồi xác thực')).toBeInTheDocument()
    expect(screen.getByText('Da xac thuc')).toBeInTheDocument()
    expect(
      screen.getByText(/Ứng dụng đã nhận tín hiệu thành công từ bước redirect, nhưng chưa thể tự xác nhận phiên đăng nhập/i),
    ).toBeInTheDocument()
    expect(verifyEmailMock).not.toHaveBeenCalled()
  })

  it(
    'verifies the email and redirects to login when the API returns a success message',
    async () => {
      verifyEmailMock.mockResolvedValueOnce('Email da duoc xac thuc.')

      render(
        <MemoryRouter initialEntries={['/verify-email?token=abc123']}>
          <VerifyEmailPage />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(verifyEmailMock).toHaveBeenCalledWith('abc123')
      })

      expect(await screen.findByText('Email đã được xác thực')).toBeInTheDocument()
      expect(
        screen.getByText(/Ứng dụng đã gọi API xác thực thành công. Bạn sẽ được đưa tới trang đăng nhập để kiểm tra lại tài khoản/i),
      ).toBeInTheDocument()
      expect(screen.getByText(/Nguồn xác nhận: gọi verify API bằng token/i)).toBeInTheDocument()

      await waitFor(
        () => {
          expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true })
        },
        { timeout: 6000 },
      )

      expect(setUserMock).not.toHaveBeenCalled()
    },
    12000,
  )

  it(
    'stores the authenticated user flow when verify returns a session payload',
    async () => {
      verifyEmailMock.mockResolvedValueOnce({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: 'user-1',
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          verified: true,
          name: 'Test User',
        },
      })

      render(
        <MemoryRouter initialEntries={['/verify-email?token=valid-token']}>
          <VerifyEmailPage />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(setUserMock).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'user-1',
            email: 'user@example.com',
          }),
        )
      })

      expect(await screen.findByText('Xác thực thành công')).toBeInTheDocument()
      expect(
        screen.getByText(/Sau 5 giây nữa hệ thống sẽ chuyển hướng bạn về trang chủ trong trạng thái đã đăng nhập/i),
      ).toBeInTheDocument()

      await waitFor(
        () => {
          expect(navigateMock).toHaveBeenCalledWith('/', { replace: true })
        },
        { timeout: 6000 },
      )
    },
    12000,
  )
})
