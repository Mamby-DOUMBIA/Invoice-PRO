import { cn } from '@/utils/cn'
import type { DocumentStatus } from '@/types/database'

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
    draft:          { label: 'Brouillon',    className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    sent:           { label: 'Envoyé',       className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
    accepted:       { label: 'Accepté',      className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
    refused:        { label: 'Refusé',       className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    expired:        { label: 'Expiré',       className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    converted:      { label: 'Converti',     className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
    paid:           { label: 'Payée',        className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
    partially_paid: { label: 'Part. payée',  className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
    unpaid:         { label: 'Impayée',      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    overdue:        { label: 'En retard',    className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
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
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    success: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    danger:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    info:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    purple:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
