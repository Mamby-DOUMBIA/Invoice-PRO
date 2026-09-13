import { useState } from 'react'
import { useReceipts } from '@/hooks/usePayments'
import { Receipt, FileText } from 'lucide-react'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { InvoicePDFViewer } from '@/components/pdf/InvoicePDFViewer'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'
import { PAYMENT_METHODS } from '@/constants'
import type { Receipt as ReceiptType } from '@/types/database'

type ReceiptWithRels = ReceiptType & {
  clients: { name: string; company_name?: string | null; address?: string | null; phone?: string | null; email?: string | null } | null
  invoices: { number: string; total_ttc?: number } | null
}

export function ReceiptsPage() {
  const org = useCurrentOrg()
  const { data: receipts = [], isLoading } = useReceipts()
  const [viewingReceipt, setViewingReceipt] = useState<ReceiptWithRels | null>(null)

  const currency = org?.currency ?? 'XOF'
  const methodLabel = (m: string) => PAYMENT_METHODS.find(p => p.value === m)?.label ?? m

  const columns = [
    { key: 'number', header: 'N° Reçu', render: (r: ReceiptWithRels) => <span className="font-mono-nums font-semibold text-blue-600">{r.number}</span> },
    { key: 'client', header: 'Client', render: (r: ReceiptWithRels) => <span>{r.clients?.name ?? '—'}</span> },
    { key: 'invoice', header: 'Facture associée', render: (r: ReceiptWithRels) => <span className="font-mono-nums text-sm">{r.invoices?.number ?? '—'}</span> },
    { key: 'date', header: 'Date', render: (r: ReceiptWithRels) => formatDate(r.date) },
    { key: 'method', header: 'Mode', render: (r: ReceiptWithRels) => <span className="text-sm">{methodLabel(r.method)}</span> },
    {
      key: 'amount', header: 'Montant encaissé', align: 'right' as const,
      render: (r: ReceiptWithRels) => <span className="font-mono-nums font-bold text-green-700 dark:text-green-400">{formatCurrency(r.amount, currency)}</span>,
    },
    {
      key: 'pdf', header: '', align: 'right' as const,
      render: (r: ReceiptWithRels) => (
        <button
          onClick={(e) => { e.stopPropagation(); setViewingReceipt(r) }}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
          title="Imprimer / Télécharger le reçu"
        >
          <FileText className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reçus de paiement</h1>
        <p className="text-sm text-slate-400 mt-0.5">{receipts.length} reçu{receipts.length !== 1 ? 's' : ''}</p>
      </div>

      {receipts.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title="Aucun reçu"
          description="Les reçus sont créés automatiquement lors de l'enregistrement d'un paiement sur une facture."
        />
      ) : (
        <Table
          columns={columns}
          data={receipts}
          loading={isLoading}
          onRowClick={r => setViewingReceipt(r)}
        />
      )}

      {/* PDF Modal */}
      {viewingReceipt && (
        <Modal open={!!viewingReceipt} onClose={() => setViewingReceipt(null)} size="xl">
          <div className="h-[80vh]">
            {org && (
              <InvoicePDFViewer
                invoice={{
                  number: viewingReceipt.number,
                  date: viewingReceipt.date,
                  reference: viewingReceipt.reference ?? `Paiement facture ${viewingReceipt.invoices?.number ?? ''}`,
                  notes: `Reçu de paiement délivré pour l'encaissement d'un montant de ${formatCurrency(viewingReceipt.amount, currency)} par ${methodLabel(viewingReceipt.method)}.${viewingReceipt.notes ? `\nNote: ${viewingReceipt.notes}` : ''}`,
                  currency,
                  subtotal_ht: viewingReceipt.amount,
                  total_discount: 0,
                  total_tax: 0,
                  total_ttc: viewingReceipt.amount,
                  amount_paid: viewingReceipt.amount,
                  amount_due: 0,
                  status: 'paid',
                  items: [
                    {
                      id: viewingReceipt.id,
                      description: `Règlement facture ${viewingReceipt.invoices?.number ?? '—'} (Mode: ${methodLabel(viewingReceipt.method)})`,
                      quantity: 1,
                      unit: 'paiement',
                      unit_price: viewingReceipt.amount,
                      discount_pct: 0,
                      discount_amt: 0,
                      tax_rate: 0,
                      line_ht: viewingReceipt.amount,
                      line_tax: 0,
                      line_ttc: viewingReceipt.amount,
                    }
                  ],
                  clients: viewingReceipt.clients as any,
                }}
                org={org}
                documentTitle="REÇU DE PAIEMENT"
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
