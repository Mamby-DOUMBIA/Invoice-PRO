import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div className={cn(
      'bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_28px_rgba(30,45,80,.055)]',
      'dark:bg-slate-900 dark:border-slate-800 dark:shadow-none',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  )
}

export function KPICard({
  title, value, subtitle, icon, trend, color = 'blue'
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}) {
  const colors = {
    blue:   'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    green:  'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    orange: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red:    'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    purple: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  }
  return (
    <Card className="flex items-start gap-4 transition-transform duration-200 hover:-translate-y-0.5">
      {icon && (
        <div className={cn('p-3 rounded-xl flex-shrink-0', colors[color])}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono-nums mt-0.5">
          {value}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs mt-1 font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </Card>
  )
}
