import type { ReactNode } from 'react'
import { cn } from '../../utils'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-800 bg-zinc-900 p-5',
        onClick && 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  color?: 'amber' | 'green' | 'blue' | 'purple'
}

export function StatCard({ title, value, icon, description, color = 'amber' }: StatCardProps) {
  const colors = {
    amber: 'text-amber-400 bg-amber-400/10',
    green: 'text-green-400 bg-green-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center', colors[color])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
