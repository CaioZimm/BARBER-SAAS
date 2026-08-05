import { cn } from '../../utils'

interface BadgeProps {
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW'
  className?: string
}

const statusConfig = {
  SCHEDULED: { label: 'Agendado', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  COMPLETED: { label: 'Concluído', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  CANCELED: { label: 'Cancelado', className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  NO_SHOW: { label: 'Não compareceu', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export default function StatusBadge({ status, className }: BadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', config.className, className)}>
      {config.label}
    </span>
  )
}
