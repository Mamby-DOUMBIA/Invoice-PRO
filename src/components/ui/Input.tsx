import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '_')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50',
              'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500',
              'transition-colors',
              error ? 'border-red-400 focus:ring-red-500' : 'border-slate-200',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-slate-400">{rightIcon}</span>
          )}
        </div>
        {error && <p id={`${inputId}-error`} role="alert" className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="text-xs text-slate-500">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
