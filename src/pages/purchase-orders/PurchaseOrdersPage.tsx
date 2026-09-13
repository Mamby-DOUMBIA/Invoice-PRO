import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Plus, Trash2, RefreshCw, Eye, Download } from 'lucide-react'
import { usePurchaseOrders, useDeletePurchaseOrder, useConvertPOToInvoice, type PurchaseOrderWithClient } from '@/hooks/usePurchaseOrders'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, Pagination } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { exportPurchaseOrdersToCSV } from '@/utils/export'
import type { DocumentStatus } from '@/types/database'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'

export function PurchaseOrdersPage() {
  const navigate = useNavigate()
  const org = useCurrentOrg()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [converting, setConverting] = useState<PurchaseOrderWithClient | null>(null)
  const [deleting, setDeleting] = useState<PurchaseOrderWithClient | null>(null)

  const { data, isLoading } = usePurchaseOrders({ search, status: status === 'all' ? undefined : status, page })
  const deletePO = useDeletePurchaseOrder()
  const convertPO = useConvertPOToInvoice()

  const orders = data?.data ?? []
  const total = data?.total ?? 0
  const currency = org?.currency ?? 'XOF'

  const columns = [
    {
      key: 'number',
      header: 'N° BC',
      render: (p: PurchaseOrderWithClient) => (
        <span className="font-mono-nums font-semibold text-blue-600">{p.number}</span>
      ),
    },
    {
      key: 'client',
      header: 'Fournisseur / Client',
      render: (p: PurchaseOrderWithClient) => (
        <div>
          <p className="font-medium">{p.clients?.name ?? '—'}</p>
          {p.clients?.company_name && <p className="text-xs text-slate-400">{p.clients.company_name}</p>}
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (p: PurchaseOrderWithClient) => formatDate(p.date) },
    { key: 'expected_date', header: 'Date prévue', render: (p: PurchaseOrderWithClient) => formatDate(p.expected_date) },
    {
      key: 'total_ttc',
      header: 'Total TTC',
      align: 'right' as const,
      render: (p: PurchaseOrderWithClient) => (
        <span className="font-mono-nums font-semibold">{formatCurrency(p.total_ttc, currency)}</span>
      ),
    },
    { key: 'status', header: 'Statut', render: (p: PurchaseOrderWithClient) => <StatusBadge status={p.status as DocumentStatus} /> },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (p: PurchaseOrderWithClient) => (
        <div className="flex items-center gap-0.5 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/purchase-orders/${p.id}`) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            title="Détail"
          >
            <Eye className="w-4 h-4" />
          </button>
          {p.status !== 'converted' && p.status !== 'cancelled' && (
            <button
              onClick={(e) => { e.stopPropagation(); setConverting(p) }}
              className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
              title="Convertir en facture"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setDeleting(p) }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bons de commande</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} bon{total !== 1 ? 's' : ''} de commande</p>
        </div>
        <div className="flex items-center gap-2">
          {orders.length > 0 && (
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportPurchaseOrdersToCSV(orders, currency)}
            >
              Exporter CSV
            </Button>
          )}
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/purchase-orders/new')}>
            Nouveau BC
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Rechercher par numéro..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
        <Select
          options={[
            { value: 'all', label: 'Tous les statuts' },
            { value: 'draft', label: 'Brouillon' },
            { value: 'sent', label: 'Envoyé' },
            { value: 'accepted', label: 'Accepté' },
            { value: 'refused', label: 'Refusé' },
            { value: 'converted', label: 'Converti' },
          ]}
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-44"
        />
      </div>

      {orders.length === 0 && !isLoading ? (
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8" />}
          title="Aucun bon de commande"
          description="Créez et suivez vos bons de commande auprès de vos clients ou fournisseurs."
          action={{ label: '+ Nouveau bon de commande', onClick: () => navigate('/purchase-orders/new') }}
        />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={orders}
            loading={isLoading}
            onRowClick={p => navigate(`/purchase-orders/${p.id}`)}
          />
          <Pagination page={page} total={total} perPage={20} onChange={setPage} />
        </div>
      )}

      {/* Convert Confirm Modal */}
      <ConfirmModal
        open={!!converting}
        onClose={() => setConverting(null)}
        onConfirm={async () => {
          if (converting) {
            const inv = await convertPO.mutateAsync(converting.id)
            setConverting(null)
            if (inv?.id) navigate(`/invoices/${inv.id}`)
          }
        }}
        title="Convertir en facture"
        message={`Convertir le bon de commande "${converting?.number}" en facture commerciale ?`}
        confirmLabel="Convertir"
        loading={convertPO.isPending}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await deletePO.mutateAsync(deleting.id)
            setDeleting(null)
          }
        }}
        title="Supprimer le bon de commande"
        message={`Supprimer définitivement le bon de commande "${deleting?.number}" ?`}
        confirmLabel="Supprimer"
        loading={deletePO.isPending}
      />
    </div>
  )
}
