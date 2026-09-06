import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from './useAuth'
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from 'date-fns'

export function useDashboardStats(period: 'month' | 'quarter' | 'year' = 'month') {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['dashboard-stats', org?.id, period],
    enabled: !!org?.id,
    queryFn: async () => {
      const now = new Date()
      let dateFrom: string, dateTo: string
      if (period === 'month') {
        dateFrom = format(startOfMonth(now), 'yyyy-MM-dd')
        dateTo = format(endOfMonth(now), 'yyyy-MM-dd')
      } else if (period === 'quarter') {
        dateFrom = format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd')
        dateTo = format(endOfMonth(now), 'yyyy-MM-dd')
      } else {
        dateFrom = format(startOfYear(now), 'yyyy-MM-dd')
        dateTo = format(endOfYear(now), 'yyyy-MM-dd')
      }

      const [invRes, quoteRes, payRes] = await Promise.all([
        supabase.from('invoices')
          .select('total_ttc, amount_paid, amount_due, status, date')
          .eq('organization_id', org!.id)
          .neq('status', 'cancelled')
          .gte('date', dateFrom)
          .lte('date', dateTo),
        supabase.from('quotes')
          .select('status')
          .eq('organization_id', org!.id)
          .gte('date', dateFrom),
        supabase.from('payments')
          .select('amount, date')
          .eq('organization_id', org!.id)
          .gte('date', dateFrom),
      ])

      const invoices = invRes.data ?? []
      const quotes = quoteRes.data ?? []
      const payments = payRes.data ?? []

      const revenue = invoices.reduce((s, i) => s + (i.total_ttc ?? 0), 0)
      const collected = payments.reduce((s, p) => s + (p.amount ?? 0), 0)
      const outstanding = invoices.filter(i => ['unpaid', 'partially_paid', 'sent'].includes(i.status)).reduce((s, i) => s + (i.amount_due ?? 0), 0)
      const overdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount_due ?? 0), 0)
      const invoicesCount = invoices.length
      const paidCount = invoices.filter(i => i.status === 'paid').length
      const quotesTotal = quotes.length
      const quotesConverted = quotes.filter(q => q.status === 'converted').length
      const conversionRate = quotesTotal > 0 ? Math.round((quotesConverted / quotesTotal) * 100) : 0
      const avgInvoice = invoicesCount > 0 ? revenue / invoicesCount : 0

      return { revenue, collected, outstanding, overdue, invoicesCount, paidCount, quotesTotal, conversionRate, avgInvoice }
    },
  })
}

export function useRevenueChart(months = 6) {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['revenue-chart', org?.id, months],
    enabled: !!org?.id,
    queryFn: async () => {
      const result = []
      const now = new Date()
      for (let i = months - 1; i >= 0; i--) {
        const d = subMonths(now, i)
        const from = format(startOfMonth(d), 'yyyy-MM-dd')
        const to = format(endOfMonth(d), 'yyyy-MM-dd')
        const { data } = await supabase
          .from('invoices')
          .select('total_ttc')
          .eq('organization_id', org!.id)
          .neq('status', 'cancelled')
          .gte('date', from).lte('date', to)
        const revenue = (data ?? []).reduce((s, inv) => s + (inv.total_ttc ?? 0), 0)
        result.push({ month: format(d, 'MMM'), revenue })
      }
      return result
    },
  })
}

export function useTopClients(limit = 5) {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['top-clients', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('client_id, total_ttc, clients(name)')
        .eq('organization_id', org!.id)
        .neq('status', 'cancelled')
      if (!data) return []
      const map = new Map<string, { name: string; total: number }>()
      data.forEach(inv => {
        if (!inv.client_id) return
        const clientObj = inv.clients as { name: string } | { name: string }[] | null
        const name = Array.isArray(clientObj) ? clientObj[0]?.name ?? '—' : (clientObj?.name ?? '—')
        const existing = map.get(inv.client_id) ?? { name, total: 0 }
        map.set(inv.client_id, { name, total: existing.total + (inv.total_ttc ?? 0) })
      })
      return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, limit)
    },
  })
}

export function useRecentInvoices(limit = 5) {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['recent-invoices', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('number, total_ttc, status, date, clients(name)')
        .eq('organization_id', org!.id)
        .order('created_at', { ascending: false })
        .limit(limit)
      return data ?? []
    },
  })
}
