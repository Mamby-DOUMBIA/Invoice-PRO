import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, FileCheck, Receipt, ShoppingCart,
  Users, Package, CreditCard, BarChart3, History, Settings,
  Plus, LogOut, ChevronLeft, ChevronRight, Bell, Moon, Sun
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/invoices',         icon: FileText,         label: 'Factures' },
  { to: '/quotes',           icon: FileCheck,        label: 'Devis' },
  { to: '/receipts',         icon: Receipt,          label: 'Reçus' },
  { to: '/purchase-orders',  icon: ShoppingCart,     label: 'Bons de commande' },
  { to: '/clients',          icon: Users,            label: 'Clients' },
  { to: '/products',         icon: Package,          label: 'Produits & Services' },
  { to: '/payments',         icon: CreditCard,       label: 'Paiements' },
  { to: '/statistics',       icon: BarChart3,        label: 'Statistiques' },
  { to: '/history',          icon: History,          label: 'Historique' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  darkMode: boolean
  onToggleDark: () => void
}

export function Sidebar({ collapsed, onToggle, darkMode, onToggleDark }: SidebarProps) {
  const navigate = useNavigate()
  const { organization, reset } = useAuthStore()

  async function handleLogout() {
    await supabase.auth.signOut()
    reset()
    navigate('/auth/login')
    toast.success('Déconnecté')
  }

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-40 flex flex-col bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center h-[76px] px-4 border-b border-slate-200/80 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_7px_16px_rgba(61,90,254,.24)]">
            <FileText className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white truncate">InvoicePro</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={collapsed ? 'Étendre' : 'Réduire'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* CTA New Invoice */}
      <div className="px-3 pt-5 pb-3">
        <button
          onClick={() => navigate('/invoices/new')}
          className={cn(
            'w-full flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-xl font-bold transition-all duration-200 shadow-[0_8px_18px_rgba(61,90,254,.22)] active:scale-[.98]',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 text-sm'
          )}
          title="Nouvelle facture"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Nouvelle facture'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-1 border-t border-slate-200/80 dark:border-slate-800 pt-3">
        <NavLink
          to="/settings"
          title={collapsed ? 'Paramètres' : undefined}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
            isActive
              ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
            collapsed && 'justify-center px-2'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Paramètres</span>}
        </NavLink>

        <button
          onClick={onToggleDark}
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
          className={cn(
            'w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          {darkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{darkMode ? 'Mode clair' : 'Mode sombre'}</span>}
        </button>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Déconnexion' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && 'Déconnexion'}
        </button>

        {!collapsed && organization && (
          <div className="px-2.5 py-2 mt-1">
            <p className="text-xs text-slate-400 truncate font-medium">{organization.name}</p>
            <p className="text-xs text-slate-300 dark:text-slate-600">{organization.currency}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

// Mobile bottom nav
export function BottomNav() {
  const mobileItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { to: '/invoices',  icon: FileText,        label: 'Documents' },
    { to: '/clients',   icon: Users,           label: 'Clients' },
    { to: '/statistics',icon: BarChart3,       label: 'Stats' },
    { to: '/settings',  icon: Settings,        label: 'Param.' },
  ]
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex md:hidden">
      {mobileItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => cn(
            'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors',
            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// FAB mobile
export function FABMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const items = [
    { label: 'Facture',  onClick: () => navigate('/invoices/new') },
    { label: 'Devis',    onClick: () => navigate('/quotes/new') },
    { label: 'Client',   onClick: () => navigate('/clients?new=1') },
    { label: 'Produit',  onClick: () => navigate('/products?new=1') },
  ]
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-2 md:hidden">
      {open && items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.onClick(); setOpen(false) }}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
        >
          {item.label}
        </button>
      ))}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light hover:bg-blue-700 transition-colors"
        aria-label="Nouveau document"
      >
        {open ? '×' : '+'}
      </button>
    </div>
  )
}
