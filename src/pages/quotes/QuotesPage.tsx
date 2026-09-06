import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileCheck, Search, Plus, Pencil, Trash2, RefreshCw, Eye } from 'lucide-react'
import { useQuotes, useDeleteQuote, useConvertQuoteToInvoice, useUpdateQuoteStatus } from '@/hooks/useQuotes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, Pagination } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import type { QuoteWithClient } from '@/hooks/useQuotes'
import type { DocumentStatus } from '@/types/database'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'

export function QuotesPage() {
  const navigate = useNavigate()
  const org = useCurrentOrg()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [converting, setConverting] = useState<QuoteWithClient | null>(null)
  const [deleting, setDeleting] = useState<QuoteWithClient | null>(null)

  const { data, isLoading } = useQuotes({ search, status: status === 'all' ? undefined : status, page })
  const deleteQuote = useDeleteQuote()
  const convertQuote = useConvertQuoteToInvoice()
  const updateStatus = useUpdateQuoteStatus()

  const quotes = data?.data ?? []
  const total = data?.total ?? 0
  const currency = org?.currency ?? 'XOF'

  const columns = [
    { key: 'number', header: 'N° Devis', render: (q: QuoteWithClient) => <span className="font-mono-nums font-semibold text-blue-600">{q.number}</span> },
    {
      key: 'client', header: 'Client',
      render: (q: QuoteWithClient) => (
        <div>
          <p className="font-medium">{q.clients?.name ?? '—'}</p>
          {q.clients?.company_name && <p className="text-xs text-slate-400">{q.clients.company_name}</p>}
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (q: QuoteWithClient) => formatDate(q.date) },
    { key: 'expiry_date', header: 'Expiration', render: (q: QuoteWithClient) => formatDate(q.expiry_date) },
    {
      key: 'total_ttc', header: 'Total TTC', align: 'right' as const,
      render: (q: QuoteWithClient) => <span className="font-mono-nums font-semibold">{formatCurrency(q.total_ttc, currency)}</span>,
    },
    { key: 'status', header: 'Statut', render: (q: QuoteWithClient) => <StatusBadge status={q.status as DocumentStatus} /> },
    {
      key: 'actions', header: '', align: 'right' as const,
      render: (q: QuoteWithClient) => (
        <div className="flex items-center gap-0.5 justify-end">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/quotes/${q.id}`) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          {q.status !== 'converted' && q.status !== 'cancelled' && (
            <button onClick={(e) => { e.stopPropagation(); setConverting(q) }}
              className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors" title="Convertir en facture">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setDeleting(q) }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Devis</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} devis</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/quotes/new')}>
          Nouveau devis
        </Button>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} className="flex-1" />
        <Select
          options={[
            { value: 'all', label: 'Tous les statuts' },
            { value: 'draft', label: 'Brouillon' },
            { value: 'sent', label: 'Envoyé' },
            { value: 'accepted', label: 'Accepté' },
            { value: 'refused', label: 'Refusé' },
            { value: 'expired', label: 'Expiré' },
            { value: 'converted', label: 'Converti' },
          ]}
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-44"
        />
      </div>

      {quotes.length === 0 && !isLoading ? (
        <EmptyState icon={<FileCheck className="w-8 h-8" />} title="Aucun devis" action={{ label: '+ Nouveau devis', onClick: () => navigate('/quotes/new') }} />
      ) : (
        <div className="space-y-4">
          <Table columns={columns} data={quotes} loading={isLoading} onRowClick={q => navigate(`/quotes/${q.id}`)} />
          <Pagination page={page} total={total} perPage={20} onChange={setPage} />
        </div>
      )}

      <ConfirmModal
        open={!!converting}
        onClose={() => setConverting(null)}
        onConfirm={async () => {
          if (converting) {
            const inv = await convertQuote.mutateAsync(converting.id)
            setConverting(null)
            if (inv) navigate(`/invoices/${inv.id}`)
          }
        }}
        title="Convertir en facture"
        message={`Convertir le devis "${converting?.number}" en facture ?`}
        confirmLabel="Convertir"
        loading={convertQuote.isPending}
      />

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await deleteQuote.mutateAsync(deleting.id); setDeleting(null) } }}
        title="Supprimer le devis"
        message={`Supprimer le devis "${deleting?.number}" ?`}
        loading={deleteQuote.isPending}
      />
    </div>
  )
}
