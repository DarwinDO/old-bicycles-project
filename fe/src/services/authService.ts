import { authApi } from '@/api/auth.api'
import { clearAuthSession, getAccessToken, getRefreshToken, hasAccessToken, setAuthSession } from '@/lib/auth-storage'
import type {
  AuthSession,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from '@/types/auth'

export type User = AuthUser
export type {
  AuthSession,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from '@/types/auth'

export const authService = {
  async login(request: LoginRequest): Promise<AuthSession> {
    const session = await authApi.login(request)

    setAuthSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    })

    return session
  },

  async register(request: RegisterRequest): Promise<void> {
    await authApi.register(request)
  },

  async logout(): Promise<void> {
    try {
      if (hasAccessToken()) {
        await authApi.logout()
      }
    } finally {
      clearAuthSession()
    }
  },

  getMe() {
    return authApi.getCurrentUser()
  },

  async refreshToken(): Promise<string> {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      throw new Error('Missing refresh token')
    }

    const session = await authApi.refreshSession(refreshToken)

    setAuthSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    })

    return session.accessToken
  },

  forgotPassword(request: ForgotPasswordRequest) {
    return authApi.forgotPassword(request)
  },

  resetPassword(request: ResetPasswordRequest) {
    return authApi.resetPassword(request)
  },

  changePassword(request: ChangePasswordRequest) {
    return authApi.changePassword(request)
  },

  updateProfile(request: UpdateProfileRequest) {
    return authApi.updateProfile(request)
  },

  verifyEmail(token: string) {
    return authApi.verifyEmail(token)
  },

  getToken: getAccessToken,
  isAuthenticated: hasAccessToken,
}
