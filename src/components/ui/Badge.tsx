import { cn } from '@/utils/cn'
import type { DocumentStatus } from '@/types/database'

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  draft:          { label: 'Brouillon',    className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  sent:           { label: 'Envoyé',       className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  accepted:       { label: 'Accepté',      className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  refused:        { label: 'Refusé',       className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  expired:        { label: 'Expiré',       className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  converted:      { label: 'Converti',     className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  paid:           { label: 'Payée',        className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  partially_paid: { label: 'Part. payée',  className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  unpaid:         { label: 'Impayée',      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  overdue:        { label: 'En retard',    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  cancelled:      { label: 'Annulée',      className: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 line-through' },
}

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', cfg.className)}>
      {cfg.label}
    </span>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger:  'bg-red-100 text-red-700',
    info:    'bg-blue-100 text-blue-700',
    purple:  'bg-purple-100 text-purple-700',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
