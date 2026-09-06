import { useState } from 'react'
import { useDashboardStats, useRevenueChart, useTopClients } from '@/hooks/useStats'
import { KPICard } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react'

type Period = 'month' | 'quarter' | 'year'

export function StatisticsPage() {
  const org = useCurrentOrg()
  const [period, setPeriod] = useState<Period>('month')
  const currency = org?.currency ?? 'XOF'

  const { data: stats } = useDashboardStats(period)
  const { data: chartData = [] } = useRevenueChart(12)
  const { data: topClients = [] } = useTopClients(8)

  const pieData = stats ? [
    { name: 'Encaissé', value: stats.collected, color: '#16a34a' },
    { name: 'À recevoir', value: stats.outstanding, color: '#f59e0b' },
    { name: 'En retard', value: stats.overdue, color: '#dc2626' },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Statistiques</h1>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(['month', 'quarter', 'year'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
              {p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="CA" value={formatCurrency(stats.revenue, currency)} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
          <KPICard title="Encaissé" value={formatCurrency(stats.collected, currency)} icon={<DollarSign className="w-5 h-5" />} color="green" />
          <KPICard title="À recevoir" value={formatCurrency(stats.outstanding, currency)} icon={<Clock className="w-5 h-5" />} color="orange" />
          <KPICard title="En retard" value={formatCurrency(stats.overdue, currency)} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Évolution CA mensuel</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatCurrency(v, currency)} width={90} />
              <Tooltip formatter={(v: number) => formatCurrency(v, currency)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="CA" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Répartition</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" outerRadius={80} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false} fontSize={10}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Top clients */}
      {topClients.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Top clients</h2>
          <div className="space-y-3">
            {topClients.map((c, i) => {
              const maxTotal = topClients[0]?.total ?? 1
              const pct = (c.total / maxTotal) * 100
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{c.name}</span>
                      <span className="text-sm font-mono-nums font-bold text-slate-900 dark:text-white ml-2">{formatCurrency(c.total, currency)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
