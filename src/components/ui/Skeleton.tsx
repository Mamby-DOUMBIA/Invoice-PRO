import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-slate-200 dark:bg-slate-700 rounded', className)} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}
        </div>
      </div>
    </div>
  )
}
