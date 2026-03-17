import api from '@/lib/axios';

// ─── Backend Response Wrapper ─────────────────────────────────────────────────
// All API responses follow: { code: number, message: string, result: T }
interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ─── Types ───────────────────────────────────────────────────────────────────

// User shape returned by backend
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Computed helper for display
  name?: string;
  phone?: string;
  address?: string;         // mapped from defaultAddress
  avatar?: string;          // mapped from avatarUrl
  role?: string;
  status?: string;
  verified?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: string;
  avatarUrl?: string;
}

// Helper: normalise User from backend (compute display `name`, `address`, `avatar`)
function normaliseUser(u: User): User {
  return {
    ...u,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    address: u.address ?? (u as unknown as Record<string, string>).defaultAddress,
    avatar: u.avatar ?? (u as unknown as Record<string, string>).avatarUrl,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const authService = {
  // POST /api/auth/login
  login: async (data: LoginRequest): Promise<LoginResult> => {
    const response = await api.post<ApiResponse<LoginResult>>('/api/auth/login', data);
    const { accessToken, refreshToken, user, tokenType, expiresIn } = response.data.result;
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    return { accessToken, refreshToken, tokenType, expiresIn, user: normaliseUser(user) };
  },

  // POST /api/auth/register
  register: async (data: RegisterRequest): Promise<void> => {
    await api.post('/api/auth/register', data);
  },

  // POST /api/auth/logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  // GET /api/auth/me
  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/api/auth/me');
    return normaliseUser(response.data.result);
  },

  // POST /api/auth/refresh
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh', { refreshToken });
    const { accessToken } = response.data.result;
    localStorage.setItem(TOKEN_KEY, accessToken);
    return accessToken;
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post('/api/auth/forgot-password', data);
  },

  // POST /api/auth/reset-password
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/api/auth/reset-password', data);
  },

  // PATCH /api/auth/change-password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.patch('/api/auth/change-password', data);
  },

  // PATCH /api/auth/profile
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>('/api/auth/profile', data);
    return normaliseUser(response.data.result);
  },

  // GET /api/auth/verify-email?token=...
  verifyEmail: async (token: string): Promise<void> => {
    await api.get('/api/auth/verify-email', { params: { token } });
  },

  // Helpers
  getToken: () => localStorage.getItem(TOKEN_KEY),
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};
