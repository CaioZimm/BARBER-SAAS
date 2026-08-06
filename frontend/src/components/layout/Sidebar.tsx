import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, Scissors, Settings, LogOut, Menu, X, Store } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'
import { cn } from '../../utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/servicos', icon: Scissors, label: 'Serviços' },
  { to: '/equipe', icon: Users, label: 'Equipe' },
  { to: '/assinatura', icon: Store, label: 'Assinatura' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Scissors size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{user?.tenant?.name || 'BarberSaaS'}</h1>
            <p className="text-xs text-zinc-500">Painel do Barbeiro</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {user?.role === 'SUPER_ADMIN' && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Super Admin
              </p>
            </div>
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                )
              }
            >
              <LayoutDashboard size={18} />
              <span>Administração</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-red-300 hover:text-red-100 hover:bg-red-600/50 transition-colors cursor-pointer bg-red-500/40 "
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Scissors size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">{user?.tenant?.name || 'BarberSaaS'}</span>
        </div>
        <button
          className="p-2 bg-zinc-900 rounded-lg text-white border border-zinc-800 hover:bg-zinc-800 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        'lg:hidden fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-zinc-800 z-50 transform transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-950 border-r border-zinc-800 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}
