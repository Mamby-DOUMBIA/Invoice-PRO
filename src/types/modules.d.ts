// Ambient declarations for packages whose .d.ts may be missing
// Only declare modules that are genuinely missing types

declare module 'react-hot-toast' {
  import * as React from 'react'
  interface ToastOptions {
    duration?: number
    className?: string
    style?: React.CSSProperties
    icon?: React.ReactNode
    iconTheme?: { primary: string; secondary: string }
    ariaProps?: { role: string; 'aria-live': string }
  }
  interface Toast {
    success(message: string, opts?: ToastOptions): string
    error(message: string, opts?: ToastOptions): string
    loading(message: string, opts?: ToastOptions): string
    dismiss(id?: string): void
    remove(id?: string): void
    promise<T>(promise: Promise<T>, messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) }, opts?: ToastOptions): Promise<T>
    (message: string, opts?: ToastOptions): string
  }
  const toast: Toast
  export default toast
  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    reverseOrder?: boolean
    gutter?: number
    containerStyle?: React.CSSProperties
    containerClassName?: string
    toastOptions?: ToastOptions
  }
  export function Toaster(props: ToasterProps): React.ReactElement
}
