import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@barber:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('@barber:refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
        
        localStorage.setItem('@barber:token', data.token)
        localStorage.setItem('@barber:refreshToken', data.refreshToken)

        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        originalRequest.headers.Authorization = `Bearer ${data.token}`

        processQueue(null, data.token)
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('@barber:token')
        localStorage.removeItem('@barber:refreshToken')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
