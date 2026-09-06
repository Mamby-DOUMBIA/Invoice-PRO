import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, DollarSign, Clock, AlertTriangle, FileText, FileCheck, Plus, Users, Package } from 'lucide-react'
import { useDashboardStats, useRevenueChart, useTopClients, useRecentInvoices } from '@/hooks/useStats'
import { KPICard } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { DocumentStatus } from '@/types/database'

type Period = 'month' | 'quarter' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  month: 'Ce mois',
  quarter: 'Ce trimestre',
  year: 'Cette année',
}

export function DashboardPage() {
  const navigate = useNavigate()
  const org = useCurrentOrg()
  const [period, setPeriod] = useState<Period>('month')
  const currency = org?.currency ?? 'XOF'

  const { data: stats, isLoading } = useDashboardStats(period)
  const { data: chartData = [] } = useRevenueChart(6)
  const { data: topClients = [] } = useTopClients(5)
  const { data: recentInvoices = [] } = useRecentInvoices(5)

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-indigo-500 mb-2">Vue d'ensemble</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Bonjour
          </h1>
          <p className="text-slate-500 text-sm mt-1">{org?.name} <span className="text-slate-300 dark:text-slate-600">/</span> voici votre activité.</p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/invoices/new')}>
            Nouvelle facture
          </Button>
          <Button size="sm" variant="secondary" icon={<FileCheck className="w-4 h-4" />} onClick={() => navigate('/quotes/new')}>
            Devis
          </Button>
          <Button size="sm" variant="secondary" icon={<Users className="w-4 h-4" />} onClick={() => navigate('/clients')}>
            Client
          </Button>
          <Button size="sm" variant="secondary" icon={<Package className="w-4 h-4" />} onClick={() => navigate('/products')}>
            Produit
          </Button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1.5 w-fit shadow-sm">
        {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-indigo-600 text-white shadow-[0_5px_12px_rgba(61,90,254,.22)]'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Chiffre d'affaires"
            value={formatCurrency(stats?.revenue ?? 0, currency)}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
          />
          <KPICard
            title="Encaissé"
            value={formatCurrency(stats?.collected ?? 0, currency)}
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
          />
          <KPICard
            title="À recevoir"
            value={formatCurrency(stats?.outstanding ?? 0, currency)}
            icon={<Clock className="w-5 h-5" />}
            color="orange"
          />
          <KPICard
            title="En retard"
            value={formatCurrency(stats?.overdue ?? 0, currency)}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
          />
        </div>
      )}

      {/* Secondary KPIs */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatMini label="Factures émises" value={String(stats.invoicesCount)} />
          <StatMini label="Factures payées" value={String(stats.paidCount)} />
          <StatMini label="Taux de conversion" value={`${stats.conversionRate}%`} />
          <StatMini label="Panier moyen" value={formatCurrency(stats.avgInvoice, currency)} />
        </div>
      )}

      {/* Chart + Top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_10px_28px_rgba(30,45,80,.045)]">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Évolution du CA (6 mois)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatCurrency(v, currency)} width={90} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v, currency)}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />              <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top clients */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_10px_28px_rgba(30,45,80,.045)]">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Meilleurs clients</h2>
          {topClients.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{c.name}</span>
                  </div>
                  <span className="text-sm font-mono-nums font-bold text-slate-900 dark:text-white ml-2">
                    {formatCurrency(c.total, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent invoices */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_10px_28px_rgba(30,45,80,.045)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Factures récentes</h2>
          <button onClick={() => navigate('/invoices')} className="text-sm text-blue-600 hover:underline">Voir tout →</button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentInvoices.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">Aucune facture</div>
          ) : recentInvoices.map((inv) => {
            const i = inv as Record<string, unknown>
            const clientName = (i.clients as { name: string } | null)?.name ?? '—'
            return (
              <div
                key={i.number as string}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                onClick={() => navigate('/invoices')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-mono-nums font-semibold text-slate-900 dark:text-slate-100">{i.number as string}</p>
                    <p className="text-xs text-slate-400 truncate">{clientName}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-mono-nums font-bold text-slate-900 dark:text-white">
                    {formatCurrency(i.total_ttc as number, currency)}
                  </p>
                  <div className="mt-0.5">
                    <StatusBadge status={i.status as DocumentStatus} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 px-4 py-3 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white font-mono-nums mt-0.5">{value}</p>
    </div>
  )
}
