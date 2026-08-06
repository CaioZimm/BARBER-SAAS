import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from './lib/react-query'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './routes'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#18181b', // zinc-900
                color: '#fff',
                border: '1px solid #27272a' // zinc-800
              }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App