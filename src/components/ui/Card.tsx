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
      'bg-white rounded-xl border border-slate-200 shadow-sm',
      'dark:bg-slate-900 dark:border-slate-800',
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
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return (
    <Card className="flex items-start gap-4">
      {icon && (
        <div className={cn('p-3 rounded-xl flex-shrink-0', colors[color])}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono-nums mt-0.5">
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
