import { api } from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  async register(name: string, email: string, password: string, password_confirm: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
      password_confirm,
    });
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  async updateProfile(name: string): Promise<User> {
    const res = await api.put<User>('/auth/profile', { name });
    return res.data;
  },

  async updatePassword(current_password: string, new_password: string, new_password_confirm: string): Promise<{ message: string }> {
    const res = await api.put<{ message: string }>('/auth/password', {
      current_password,
      new_password,
      new_password_confirm,
    });
    return res.data;
  },
};
