import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../api/auth';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirm: string) => Promise<void>;
  logout: () => void;
  updateProfileName: (name: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('moodlog_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('moodlog_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('moodlog_token');
      if (storedToken) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
          localStorage.setItem('moodlog_user', JSON.stringify(freshUser));
        } catch {
          // Token is invalid or expired
          localStorage.removeItem('moodlog_token');
          localStorage.removeItem('moodlog_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    localStorage.setItem('moodlog_token', data.access_token);
    localStorage.setItem('moodlog_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      handleAuthSuccess(res);
      showToast(`Welcome back, ${res.user.name}`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      showToast(msg, 'error', 'Authentication Error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirm: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(name, email, password, confirm);
      handleAuthSuccess(res);
      showToast(`Account created successfully! Welcome to MoodLog, ${res.user.name}.`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      showToast(msg, 'error', 'Registration Error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('moodlog_token');
    localStorage.removeItem('moodlog_user');
    setToken(null);
    setUser(null);
    showToast('You have been logged out securely.', 'info');
  };

  const updateProfileName = async (name: string) => {
    try {
      const updated = await authApi.updateProfile(name);
      setUser(updated);
      localStorage.setItem('moodlog_user', JSON.stringify(updated));
      showToast('Profile display name updated.', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Could not update profile name.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authApi.getMe();
      setUser(freshUser);
      localStorage.setItem('moodlog_user', JSON.stringify(freshUser));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfileName,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
