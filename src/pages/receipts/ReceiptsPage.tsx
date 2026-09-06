import { useReceipts } from '@/hooks/usePayments'
import { Receipt, FileText } from 'lucide-react'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'
import { PAYMENT_METHODS } from '@/constants'
import type { Receipt as ReceiptType } from '@/types/database'

type ReceiptWithRels = ReceiptType & {
  clients: { name: string } | null
  invoices: { number: string } | null
}

export function ReceiptsPage() {
  const org = useCurrentOrg()
  const { data: receipts = [], isLoading } = useReceipts()
  const currency = org?.currency ?? 'XOF'
  const methodLabel = (m: string) => PAYMENT_METHODS.find(p => p.value === m)?.label ?? m

  const columns = [
    { key: 'number', header: 'N° Reçu', render: (r: ReceiptWithRels) => <span className="font-mono-nums font-semibold text-blue-600">{r.number}</span> },
    { key: 'client', header: 'Client', render: (r: ReceiptWithRels) => <span>{r.clients?.name ?? '—'}</span> },
    { key: 'invoice', header: 'Facture', render: (r: ReceiptWithRels) => <span className="font-mono-nums text-sm">{r.invoices?.number ?? '—'}</span> },
    { key: 'date', header: 'Date', render: (r: ReceiptWithRels) => formatDate(r.date) },
    { key: 'method', header: 'Mode', render: (r: ReceiptWithRels) => <span className="text-sm">{methodLabel(r.method)}</span> },
    {
      key: 'amount', header: 'Montant', align: 'right' as const,
      render: (r: ReceiptWithRels) => <span className="font-mono-nums font-bold text-green-700 dark:text-green-400">{formatCurrency(r.amount, currency)}</span>,
    },
    {
      key: 'pdf', header: '', align: 'right' as const,
      render: (r: ReceiptWithRels) => (
        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="PDF">
          <FileText className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reçus</h1>
        <p className="text-sm text-slate-400 mt-0.5">{receipts.length} reçu{receipts.length !== 1 ? 's' : ''}</p>
      </div>

      {receipts.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title="Aucun reçu"
          description="Les reçus sont créés automatiquement lors de l'enregistrement d'un paiement."
        />
      ) : (
        <Table columns={columns} data={receipts} loading={isLoading} />
      )}
    </div>
  )
}
