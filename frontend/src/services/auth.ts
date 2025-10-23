import { api, setAccessToken } from './api';
import type { User, LoginCredentials, RegisterCredentials } from '@/types';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials, {
      requiresAuth: false,
    });
    setAccessToken(response.accessToken);
    return response;
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', credentials, {
      requiresAuth: false,
    });
    setAccessToken(response.accessToken);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', undefined, { parseJson: false });
    } finally {
      setAccessToken(null);
    }
  },

  async refreshToken(): Promise<RefreshResponse | null> {
    try {
      const response = await api.post<RefreshResponse>(
        '/auth/refresh',
        undefined,
        { requiresAuth: false }
      );
      if (response?.accessToken) {
        setAccessToken(response.accessToken);
      }
      return response;
    } catch (error) {
      setAccessToken(null);
      return null;
    }
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me');
  },
};
