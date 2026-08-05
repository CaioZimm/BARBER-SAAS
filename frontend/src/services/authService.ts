import api from '../lib/axios'
import type { User, LoginFormData, RegisterFormData, AuthResponse } from '../interfaces'

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
}
