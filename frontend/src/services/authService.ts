import type { User, LoginFormData, RegisterFormData, AuthResponse } from '../interfaces'
import api from '../lib/axios'

export const authService = {
  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me')
    return data
  },
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials)
    return data
  },
  register: async (userData: RegisterFormData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', userData)
    return data
  },
  registerClient: async (userData: { name: string; email: string; phone: string; password: string }): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register-client', userData)
    return data
  },
  updateProfile: async (userData: { name: string; email: string; bio?: string; phone?: string; photo?: string; password?: string }): Promise<User> => {
    const { data } = await api.put('/auth/me', userData)
    return data
  },
}