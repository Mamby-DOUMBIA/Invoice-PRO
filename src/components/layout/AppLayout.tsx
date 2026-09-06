import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, BottomNav, FABMenu } from './Sidebar'
import { cn } from '@/utils/cn'
import { Toaster } from 'react-hot-toast'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('sidebar_collapsed') === 'true'
  )
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('invoicepro_theme') === 'dark' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('invoicepro_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleSidebar = () => {
    setCollapsed(v => {
      localStorage.setItem('sidebar_collapsed', String(!v))
      return !v
    })
  }

  return (
    <div className={cn('flex min-h-screen bg-transparent dark:bg-slate-950', darkMode && 'dark')}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleSidebar}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
        />
      </div>

      {/* Main */}
      <main className={cn(
        'flex-1 min-w-0 transition-all duration-200',
        collapsed ? 'md:ml-16' : 'md:ml-60',
        'pb-20 md:pb-0'
      )}>
        <div className="app-page-enter min-h-full p-4 md:p-7 lg:p-10 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile */}
      <BottomNav />
      <FABMenu />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'dark:!bg-slate-800 dark:!text-slate-100',
        }}
      />
    </div>
  )
}
