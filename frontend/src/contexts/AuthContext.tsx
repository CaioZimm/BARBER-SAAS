import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'
import type { User, RegisterFormData } from '../interfaces'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('@barber:token')
    if (storedToken) {
      setToken(storedToken)
      authService.me()
        .then((user) => setUser(user))
        .catch(() => {
          localStorage.removeItem('@barber:token')
          localStorage.removeItem('@barber:refreshToken')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password })
    localStorage.setItem('@barber:token', data.token)
    if (data.refreshToken) localStorage.setItem('@barber:refreshToken', data.refreshToken)
    setToken(data.token)
    setUser({ ...data.user, ...(data.tenant ? { tenant: data.tenant } : {}) })
  }

  const register = async (formData: RegisterFormData) => {
    const data = await authService.register(formData)
    localStorage.setItem('@barber:token', data.token)
    if (data.refreshToken) localStorage.setItem('@barber:refreshToken', data.refreshToken)
    setToken(data.token)
    setUser({ ...data.user, ...(data.tenant ? { tenant: data.tenant } : {}) })
  }

  const logout = () => {
    localStorage.removeItem('@barber:token')
    localStorage.removeItem('@barber:refreshToken')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
