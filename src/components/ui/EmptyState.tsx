import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">{description}</p>
      )}
      {action && (
        <Button className="mt-4" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
