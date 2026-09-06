import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, History } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/utils/format'
import type { DocumentStatus } from '@/types/database'

type DocType = 'all' | 'invoice' | 'quote' | 'receipt' | 'purchase_order'

interface HistoryItem {
  id: string
  number: string
  type: string
  status: string
  date: string
  total: number
  client: string
}

function useHistory(docType: DocType, search: string, status: string) {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['history', org?.id, docType, search, status],
    enabled: !!org?.id,
    queryFn: async () => {
      const results: HistoryItem[] = []

      const buildQuery = async (table: string, typeLabel: string) => {
        let q = supabase
          .from(table)
          .select('id, number, status, date, total_ttc, clients(name)')
          .eq('organization_id', org!.id)
          .order('date', { ascending: false })
          .limit(50)
        if (search) q = q.ilike('number', `%${search}%`)
        if (status && status !== 'all') q = q.eq('status', status)
        const { data } = await q
        return (data ?? []).map((d: Record<string, unknown>) => ({
          id: d.id as string,
          number: d.number as string,
          type: typeLabel,
          status: d.status as string,
          date: d.date as string,
          total: (d.total_ttc as number) ?? 0,
          client: (() => {
            const c = d.clients
            if (!c) return '—'
            if (Array.isArray(c)) return (c as { name: string }[])[0]?.name ?? '—'
            return (c as { name: string }).name ?? '—'
          })(),
        }))
      }

      const buildReceiptQuery = async () => {
        const { data } = await supabase
          .from('receipts')
          .select('id, number, date, amount, clients(name)')
          .eq('organization_id', org!.id)
          .order('date', { ascending: false })
          .limit(50)
        return (data ?? []).map(d => ({
          id: d.id,
          number: d.number,
          type: 'Reçu',
          status: 'paid',
          date: d.date,
          total: d.amount,
          client: (() => { const c = d.clients as unknown; if (!c) return '—'; if (Array.isArray(c)) return (c as {name:string}[])[0]?.name ?? '—'; return (c as {name:string}).name ?? '—' })(),
        }))
      }

      if (docType === 'all' || docType === 'invoice') results.push(...await buildQuery('invoices', 'Facture'))
      if (docType === 'all' || docType === 'quote') results.push(...await buildQuery('quotes', 'Devis'))
      if (docType === 'all' || docType === 'receipt') results.push(...await buildReceiptQuery())
      if (docType === 'all' || docType === 'purchase_order') results.push(...await buildQuery('purchase_orders', 'Bon de commande'))

      return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
  })
}

export function HistoryPage() {
  const navigate = useNavigate()
  const org = useCurrentOrg()
  const [docType, setDocType] = useState<DocType>('all')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const { data: items = [], isLoading } = useHistory(docType, search, status)
  const currency = org?.currency ?? 'XOF'

  function handleClick(item: HistoryItem) {
    switch (item.type) {
      case 'Facture': navigate(`/invoices/${item.id}`); break
      case 'Devis': navigate(`/quotes/${item.id}`); break
      default: break
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Historique</h1>
        <p className="text-sm text-slate-400 mt-0.5">{items.length} document{items.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher par numéro..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="flex-1 min-w-48"
        />
        <Select
          options={[
            { value: 'all', label: 'Tous les types' },
            { value: 'invoice', label: 'Factures' },
            { value: 'quote', label: 'Devis' },
            { value: 'receipt', label: 'Reçus' },
            { value: 'purchase_order', label: 'Bons de commande' },
          ]}
          value={docType}
          onChange={e => setDocType(e.target.value as DocType)}
          className="w-48"
        />
        <Select
          options={[
            { value: 'all', label: 'Tous les statuts' },
            { value: 'draft', label: 'Brouillon' },
            { value: 'sent', label: 'Envoyé' },
            { value: 'paid', label: 'Payé' },
            { value: 'unpaid', label: 'Impayé' },
            { value: 'overdue', label: 'En retard' },
            { value: 'cancelled', label: 'Annulé' },
          ]}
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-44"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<History className="w-8 h-8" />} title="Aucun document" description="Votre historique apparaîtra ici." />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {items.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              onClick={() => handleClick(item)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex-shrink-0">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded font-medium">
                    {item.type}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-mono-nums font-semibold text-slate-900 dark:text-slate-100">{item.number}</p>
                  <p className="text-xs text-slate-400 truncate">{item.client} · {formatDate(item.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <StatusBadge status={item.status as DocumentStatus} />
                <span className="text-sm font-mono-nums font-bold text-slate-900 dark:text-white">
                  {formatCurrency(item.total, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
