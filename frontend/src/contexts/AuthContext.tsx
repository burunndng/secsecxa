import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { setAccessToken, setRefreshTokenHandler } from '@/services/api';
import type { User, LoginCredentials, RegisterCredentials } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccessToken = async () => {
    const response = await authService.refreshToken();
    return response?.accessToken ?? null;
  };

  useEffect(() => {
    setRefreshTokenHandler(refreshAccessToken);

    const initialize = async () => {
      try {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          setAccessToken(refreshedToken);
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth state', error);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      setRefreshTokenHandler(null);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    setAccessToken(response.accessToken);
    setRefreshTokenHandler(refreshAccessToken);
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await authService.register(credentials);
    setUser(response.user);
    setAccessToken(response.accessToken);
    setRefreshTokenHandler(refreshAccessToken);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRefreshTokenHandler(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
