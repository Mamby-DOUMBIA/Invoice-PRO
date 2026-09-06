import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAuthInit } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import '@/i18n'
// i18n is initialised lazily on first use
// Only import when needed to keep initial bundle small

// Auth pages — lightweight, not lazy
import { LoginPage }          from '@/pages/auth/LoginPage'
import { SignupPage }         from '@/pages/auth/SignupPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { OnboardingPage }     from '@/pages/onboarding/OnboardingPage'

// App pages — lazy for code-splitting
const DashboardPage      = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const InvoicesPage       = lazy(() => import('@/pages/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })))
const InvoiceFormPage    = lazy(() => import('@/pages/invoices/InvoiceFormPage').then(m => ({ default: m.InvoiceFormPage })))
const InvoiceDetailPage  = lazy(() => import('@/pages/invoices/InvoiceDetailPage').then(m => ({ default: m.InvoiceDetailPage })))
const QuotesPage         = lazy(() => import('@/pages/quotes/QuotesPage').then(m => ({ default: m.QuotesPage })))
const ReceiptsPage       = lazy(() => import('@/pages/receipts/ReceiptsPage').then(m => ({ default: m.ReceiptsPage })))
const PurchaseOrdersPage = lazy(() => import('@/pages/purchase-orders/PurchaseOrdersPage').then(m => ({ default: m.PurchaseOrdersPage })))
const PurchaseOrderFormPage = lazy(() => import('@/pages/purchase-orders/PurchaseOrderFormPage').then(m => ({ default: m.PurchaseOrderFormPage })))
const ClientsPage        = lazy(() => import('@/pages/clients/ClientsPage').then(m => ({ default: m.ClientsPage })))
const ProductsPage       = lazy(() => import('@/pages/products/ProductsPage').then(m => ({ default: m.ProductsPage })))
const PaymentsPage       = lazy(() => import('@/pages/payments/PaymentsPage').then(m => ({ default: m.PaymentsPage })))
const StatisticsPage     = lazy(() => import('@/pages/statistics/StatisticsPage').then(m => ({ default: m.StatisticsPage })))
const HistoryPage        = lazy(() => import('@/pages/history/HistoryPage').then(m => ({ default: m.HistoryPage })))
const SettingsPage       = lazy(() => import('@/pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false },
  },
})

/** Initialises auth listener once at app root */
function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInit()
  return <>{children}</>
}

/**
 * For pages that require authentication + an organisation.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized, loading, organization } = useAuthStore()
  if (loading || !initialized) return <PageLoader />
  if (!user) return <Navigate to="/auth/login" replace />
  if (!organization) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

/**
 * For /onboarding — needs user, no org yet.
 */
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized, loading, organization } = useAuthStore()
  if (loading || !initialized) return <PageLoader />
  if (!user) return <Navigate to="/auth/login" replace />
  if (organization) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

/**
 * For public pages (login, signup) — show immediately, redirect once auth known.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized, loading, organization } = useAuthStore()
  // Don't block on first render — show login page immediately
  if (loading) return <PageLoader />
  if (initialized && user && organization) return <Navigate to="/dashboard" replace />
  if (initialized && user && !organization) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Chargement…</p>
      </div>
    </div>
  )
}

function Fallback() {
  return <PageLoader />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ── Public auth routes ── */}
            <Route path="/auth/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/auth/signup"          element={<PublicRoute><SignupPage /></PublicRoute>} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

            {/* ── Onboarding — needs user, no org yet ── */}
            <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

            {/* ── Protected app routes — needs user + org ── */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard"
                element={<Suspense fallback={<Fallback />}><DashboardPage /></Suspense>} />

              <Route path="/invoices"
                element={<Suspense fallback={<Fallback />}><InvoicesPage /></Suspense>} />
              <Route path="/invoices/new"
                element={<Suspense fallback={<Fallback />}><InvoiceFormPage /></Suspense>} />
              <Route path="/invoices/:id"
                element={<Suspense fallback={<Fallback />}><InvoiceDetailPage /></Suspense>} />
              <Route path="/invoices/:id/edit"
                element={<Suspense fallback={<Fallback />}><InvoiceFormPage /></Suspense>} />

              <Route path="/quotes"
                element={<Suspense fallback={<Fallback />}><QuotesPage /></Suspense>} />
              <Route path="/quotes/new"
                element={<Suspense fallback={<Fallback />}><InvoiceFormPage /></Suspense>} />

              <Route path="/receipts"
                element={<Suspense fallback={<Fallback />}><ReceiptsPage /></Suspense>} />
              <Route path="/purchase-orders"
                element={<Suspense fallback={<Fallback />}><PurchaseOrdersPage /></Suspense>} />
              <Route path="/purchase-orders/new"
                element={<Suspense fallback={<Fallback />}><PurchaseOrderFormPage /></Suspense>} />
              <Route path="/clients"
                element={<Suspense fallback={<Fallback />}><ClientsPage /></Suspense>} />
              <Route path="/products"
                element={<Suspense fallback={<Fallback />}><ProductsPage /></Suspense>} />
              <Route path="/payments"
                element={<Suspense fallback={<Fallback />}><PaymentsPage /></Suspense>} />
              <Route path="/statistics"
                element={<Suspense fallback={<Fallback />}><StatisticsPage /></Suspense>} />
              <Route path="/history"
                element={<Suspense fallback={<Fallback />}><HistoryPage /></Suspense>} />
              <Route path="/settings"
                element={<Suspense fallback={<Fallback />}><SettingsPage /></Suspense>} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
