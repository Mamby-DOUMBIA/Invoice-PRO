import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Plus, Pencil, Trash2, Eye, Copy, X, BellRing, Download } from 'lucide-react'
import { useInvoices, useDeleteInvoice, useCancelInvoice } from '@/hooks/useInvoices'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, Pagination } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReminderModal } from '@/components/shared/ReminderModal'
import { exportInvoicesToCSV } from '@/utils/export'
import type { InvoiceWithClient } from '@/hooks/useInvoices'
import type { DocumentStatus } from '@/types/database'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'sent', label: 'Envoyée' },
  { value: 'paid', label: 'Payée' },
  { value: 'partially_paid', label: 'Part. payée' },
  { value: 'unpaid', label: 'Impayée' },
  { value: 'overdue', label: 'En retard' },
  { value: 'cancelled', label: 'Annulée' },
]

export function InvoicesPage() {
  const navigate = useNavigate()
  const org = useCurrentOrg()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<InvoiceWithClient | null>(null)
  const [cancelling, setCancelling] = useState<InvoiceWithClient | null>(null)
  const [reminding, setReminding] = useState<InvoiceWithClient | null>(null)

  const { data, isLoading } = useInvoices({ search, status: status === 'all' ? undefined : status, page })
  const deleteInvoice = useDeleteInvoice()
  const cancelInvoice = useCancelInvoice()

  const invoices = data?.data ?? []
  const total = data?.total ?? 0
  const currency = org?.currency ?? 'XOF'

  const columns = [
    {
      key: 'number',
      header: 'N° Facture',
      render: (inv: InvoiceWithClient) => (
        <span className="font-mono-nums font-semibold text-blue-600">{inv.number}</span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (inv: InvoiceWithClient) => (
        <div>
          <p className="font-medium">{inv.clients?.name ?? '—'}</p>
          {inv.clients?.company_name && <p className="text-xs text-slate-400">{inv.clients.company_name}</p>}
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (inv: InvoiceWithClient) => formatDate(inv.date) },
    {
      key: 'due_date',
      header: 'Échéance',
      render: (inv: InvoiceWithClient) => (
        <span className={inv.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
          {formatDate(inv.due_date)}
        </span>
      ),
    },
    {
      key: 'total_ttc',
      header: 'Total TTC',
      align: 'right' as const,
      render: (inv: InvoiceWithClient) => (
        <span className="font-mono-nums font-semibold">{formatCurrency(inv.total_ttc, currency)}</span>
      ),
    },
    {
      key: 'amount_due',
      header: 'Reste',
      align: 'right' as const,
      render: (inv: InvoiceWithClient) => (
        <span className={`font-mono-nums ${inv.amount_due > 0 ? 'text-orange-600 font-semibold' : 'text-green-600'}`}>
          {formatCurrency(inv.amount_due, currency)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (inv: InvoiceWithClient) => <StatusBadge status={inv.status as DocumentStatus} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (inv: InvoiceWithClient) => (
        <div className="flex items-center gap-0.5 justify-end">
          {inv.amount_due > 0 && inv.status !== 'cancelled' && (
            <button
              onClick={(e) => { e.stopPropagation(); setReminding(inv) }}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
              title="Relancer le paiement"
            >
              <BellRing className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv.id}`) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Voir">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv.id}/edit`) }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Modifier">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv.id}/duplicate`) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Dupliquer">
            <Copy className="w-4 h-4" />
          </button>
          {inv.status !== 'cancelled' && (
            <button onClick={(e) => { e.stopPropagation(); setCancelling(inv) }}
              className="p-1.5 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors" title="Annuler">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setDeleting(inv) }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Supprimer">
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Factures</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} facture{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {invoices.length > 0 && (
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportInvoicesToCSV(invoices, currency)}
            >
              Exporter CSV
            </Button>
          )}
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/invoices/new')}>
            Nouvelle facture
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Rechercher par numéro..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          leftIcon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="w-48"
        />
      </div>

      {invoices.length === 0 && !isLoading ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="Aucune facture"
          description="Créez votre première facture en moins de 60 secondes."
          action={{ label: '+ Nouvelle facture', onClick: () => navigate('/invoices/new') }}
        />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={invoices}
            loading={isLoading}
            onRowClick={inv => navigate(`/invoices/${inv.id}`)}
          />
          <Pagination page={page} total={total} perPage={20} onChange={setPage} />
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await deleteInvoice.mutateAsync(deleting.id); setDeleting(null) } }}
        title="Supprimer la facture"
        message={`Supprimer définitivement la facture "${deleting?.number}" ?`}
        loading={deleteInvoice.isPending}
      />
      <ConfirmModal
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={async () => { if (cancelling) { await cancelInvoice.mutateAsync(cancelling.id); setCancelling(null) } }}
        title="Annuler la facture"
        message={`Annuler la facture "${cancelling?.number}" ?`}
        confirmLabel="Annuler la facture"
        loading={cancelInvoice.isPending}
      />
      {reminding && (
        <ReminderModal
          open={!!reminding}
          onClose={() => setReminding(null)}
          invoice={reminding}
        />
      )}
    </div>
  )
}
