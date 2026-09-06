import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[.98]'
    const variants = {
      primary: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white hover:from-indigo-600 hover:to-indigo-800 shadow-[0_8px_18px_rgba(61,90,254,.22)]',
      secondary: 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 active:bg-slate-100 shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
      ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800',
      danger: 'bg-gradient-to-br from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 shadow-sm',
      outline: 'border border-indigo-400 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 dark:text-indigo-300 dark:border-indigo-400/60 dark:hover:bg-indigo-950/40',
    }
    const sizes = {
      sm: 'h-9 px-3.5 text-xs',
      md: 'h-11 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    }
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
