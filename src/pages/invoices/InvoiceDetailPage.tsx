import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, Share2, DollarSign, ArrowLeft, FileText, BellRing } from 'lucide-react'
import { useInvoice } from '@/hooks/useInvoices'
import { usePayments, useCreatePayment } from '@/hooks/usePayments'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PaymentForm } from '../payments/PaymentForm'
import { ShareModal } from '@/components/shared/ShareModal'
import { ReminderModal } from '@/components/shared/ReminderModal'
import { InvoicePDFViewer } from '@/components/pdf/InvoicePDFViewer'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'
import type { DocumentStatus, InvoiceItem } from '@/types/database'
import { PAYMENT_METHODS } from '@/constants'

export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const org = useCurrentOrg()
  const [showPayment, setShowPayment] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showPDF, setShowPDF] = useState(false)
  const [showReminder, setShowReminder] = useState(false)

  const { data: invoice, isLoading } = useInvoice(id)
  const { data: payments = [] } = usePayments(id)
  const createPayment = useCreatePayment()

  if (isLoading) return <div className="animate-pulse p-8 text-slate-400">Chargement…</div>
  if (!invoice) return <div className="p-8 text-slate-400">Facture introuvable</div>

  const currency = org?.currency ?? 'XOF'
  const invoiceClient = invoice.clients as Record<string, string> | null
  const methodLabel = (m: string) => PAYMENT_METHODS.find(p => p.value === m)?.label ?? m

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono-nums">
                {invoice.number}
              </h1>
              <StatusBadge status={invoice.status as DocumentStatus} />
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{invoiceClient?.name ?? '—'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={<DollarSign className="w-4 h-4" />}
                onClick={() => setShowPayment(true)}
              >
                Paiement
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                icon={<BellRing className="w-4 h-4" />}
                onClick={() => setShowReminder(true)}
              >
                Relancer
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => setShowPDF(true)}
          >
            PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Share2 className="w-4 h-4" />}
            onClick={() => setShowShare(true)}
          >
            Partager
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => navigate(`/invoices/${id}/edit`)}
          >
            Modifier
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPIBox label="Total TTC" value={formatCurrency(invoice.total_ttc, currency)} color="blue" />
        <KPIBox label="Payé" value={formatCurrency(invoice.amount_paid, currency)} color="green" />
        <KPIBox
          label="Reste"
          value={formatCurrency(invoice.amount_due, currency)}
          color={invoice.amount_due > 0 ? 'orange' : 'green'}
        />
        <KPIBox label="TVA" value={formatCurrency(invoice.total_tax, currency)} color="gray" />
      </div>

      {/* Info + Client */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Informations</h3>
          <dl className="space-y-2 text-sm">
            <InfoRow label="Date" value={formatDate(invoice.date)} />
            <InfoRow label="Échéance" value={formatDate(invoice.due_date)} />
            {invoice.reference && <InfoRow label="Référence" value={invoice.reference} />}
            {invoice.payment_terms && <InfoRow label="Conditions" value={invoice.payment_terms} />}
          </dl>
        </Card>
        <Card>
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Client</h3>
          {invoiceClient ? (
            <dl className="space-y-2 text-sm">
              <InfoRow label="Nom" value={invoiceClient.name} />
              {invoiceClient.company_name && <InfoRow label="Entreprise" value={invoiceClient.company_name} />}
              {invoiceClient.email && <InfoRow label="Email" value={invoiceClient.email} />}
              {invoiceClient.phone && <InfoRow label="Téléphone" value={invoiceClient.phone} />}
            </dl>
          ) : (
            <p className="text-slate-400">—</p>
          )}
        </Card>
      </div>

      {/* Lines table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                {['Description', 'Qté', 'Prix HT', 'Remise', 'TVA', 'Total TTC'].map(h => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs text-slate-500 font-semibold uppercase ${
                      h === 'Description' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(invoice.invoice_items as InvoiceItem[] | undefined)?.map(item => (
                <tr key={item.id} className="bg-white dark:bg-slate-900">
                  <td className="px-4 py-3 font-medium">{item.description}</td>
                  <td className="px-4 py-3 text-right font-mono-nums">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-right font-mono-nums">{formatCurrency(item.unit_price, currency)}</td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {item.discount_pct > 0 ? `${item.discount_pct}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">{item.tax_rate}%</td>
                  <td className="px-4 py-3 text-right font-mono-nums font-semibold">
                    {formatCurrency(item.line_ttc ?? 0, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals summary */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <TotalRow label="Sous-total HT" value={formatCurrency(invoice.subtotal_ht, currency)} />
            {invoice.total_discount > 0 && (
              <TotalRow label="Remise" value={`- ${formatCurrency(invoice.total_discount, currency)}`} />
            )}
            <TotalRow label="TVA" value={formatCurrency(invoice.total_tax, currency)} />
            <TotalRow label="Total TTC" value={formatCurrency(invoice.total_ttc, currency)} bold />
            {invoice.amount_paid > 0 && (
              <TotalRow
                label="Payé"
                value={formatCurrency(invoice.amount_paid, currency)}
                className="text-green-600"
              />
            )}
            {invoice.amount_due > 0 && (
              <TotalRow
                label="Reste à payer"
                value={formatCurrency(invoice.amount_due, currency)}
                className="text-orange-600 font-bold"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Notes */}
      {(invoice.notes || invoice.conditions) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {invoice.notes && (
            <Card>
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Notes</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{invoice.notes}</p>
            </Card>
          )}
          {invoice.conditions && (
            <Card>
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Conditions</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{invoice.conditions}</p>
            </Card>
          )}
        </div>
      )}

      {/* Payments history */}
      {payments.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Historique des paiements
          </h3>
          <div className="space-y-2">
            {payments.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-2.5"
              >
                <div>
                  <span className="font-medium">{methodLabel(p.method)}</span>
                  {p.reference && (
                    <span className="text-slate-400 ml-2">Réf: {p.reference}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono-nums font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(p.amount, currency)}
                  </span>
                  <p className="text-xs text-slate-400">{formatDate(p.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modals */}
      <Modal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        title="Enregistrer un paiement"
        size="md"
      >
        <PaymentForm
          invoice={invoice}
          currency={currency}
          onSave={async (data) => {
            await createPayment.mutateAsync(data)
            setShowPayment(false)
          }}
          onCancel={() => setShowPayment(false)}
          saving={createPayment.isPending}
        />
      </Modal>

      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        documentType="facture"
        documentNumber={invoice.number}
        clientName={invoiceClient?.name ?? ''}
        amount={invoice.total_ttc}
        currency={currency}
        invoiceId={invoice.id}
      />

      {showPDF && (
        <Modal
          open={showPDF}
          onClose={() => setShowPDF(false)}
          title={`Facture ${invoice.number}`}
          size="full"
        >
          <InvoicePDFViewer
            invoice={{
              ...invoice,
              invoice_items: invoice.invoice_items as InvoiceItem[],
              clients: invoiceClient,
            }}
            org={org!}
          />
        </Modal>
      )}

      {showReminder && (
        <ReminderModal
          open={showReminder}
          onClose={() => setShowReminder(false)}
          invoice={invoice as any}
        />
      )}
    </div>
  )
}

/* ─── Small sub-components ─── */
function KPIBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    green:  'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    gray:   'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color] ?? colors['gray']}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold font-mono-nums mt-1">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-slate-400 w-28 flex-shrink-0">{label}</dt>
      <dd className="text-slate-700 dark:text-slate-300 font-medium">{value}</dd>
    </div>
  )
}

function TotalRow({
  label, value, bold, className,
}: {
  label: string; value: string; bold?: boolean; className?: string
}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono-nums ${bold ? 'font-bold text-slate-900 dark:text-white' : ''} ${className ?? ''}`}>
        {value}
      </span>
    </div>
  )
}
