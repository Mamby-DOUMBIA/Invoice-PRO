import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, Share2, ArrowLeft, FileText, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react'
import { usePurchaseOrder, useUpdatePOStatus, useConvertPOToInvoice, useDeletePurchaseOrder } from '@/hooks/usePurchaseOrders'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { ShareModal } from '@/components/shared/ShareModal'
import { InvoicePDFViewer } from '@/components/pdf/InvoicePDFViewer'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'
import type { DocumentStatus, PurchaseOrderItem } from '@/types/database'

export function PurchaseOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const org = useCurrentOrg()
  const [showShare, setShowShare] = useState(false)
  const [showPDF, setShowPDF] = useState(false)
  const [converting, setConverting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: po, isLoading } = usePurchaseOrder(id)
  const updateStatus = useUpdatePOStatus()
  const convertPO = useConvertPOToInvoice()
  const deletePO = useDeletePurchaseOrder()

  if (isLoading) return <div className="animate-pulse p-8 text-slate-400">Chargement…</div>
  if (!po) return <div className="p-8 text-slate-400">Bon de commande introuvable</div>

  const currency = org?.currency ?? 'XOF'
  const poClient = po.clients as Record<string, string> | null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/purchase-orders')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono-nums">
                {po.number}
              </h1>
              <StatusBadge status={po.status as DocumentStatus} />
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{poClient?.name ?? '—'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {po.status !== 'converted' && po.status !== 'cancelled' && (
            <Button
              variant="primary"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              loading={convertPO.isPending}
              onClick={() => setConverting(true)}
            >
              Convertir en facture
            </Button>
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
          {po.status !== 'converted' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => navigate(`/purchase-orders/${id}/edit`)}
            >
              Modifier
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setDeleting(true)}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {po.converted_to_invoice_id && (
        <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Ce bon de commande a été converti en facture.</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/invoices/${po.converted_to_invoice_id}`)}
          >
            Voir la facture
          </Button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KPIBox label="Total HT" value={formatCurrency(po.subtotal_ht ?? 0, currency)} color="slate" />
        <KPIBox label="Total Taxe" value={formatCurrency(po.total_tax ?? 0, currency)} color="amber" />
        <KPIBox label="Total TTC" value={formatCurrency(po.total_ttc ?? 0, currency)} color="blue" />
      </div>

      {/* Details Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-400 block text-xs">Date d'émission</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(po.date)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Date prévue de livraison</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(po.expected_date)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Référence</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{po.reference || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Statut</span>
            <div className="mt-1">
              <select
                value={po.status}
                onChange={e => updateStatus.mutate({ id: po.id, status: e.target.value })}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="refused">Refusé</option>
                <option value="converted">Converti</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Items table */}
      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Articles du bon de commande</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs text-left">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Qté</th>
                <th className="pb-2 text-right">Prix HT</th>
                <th className="pb-2 text-right">TVA</th>
                <th className="pb-2 text-right">Total TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {po.purchase_order_items?.map((item: PurchaseOrderItem) => (
                <tr key={item.id}>
                  <td className="py-2.5">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{item.description}</p>
                  </td>
                  <td className="py-2.5 text-right font-mono-nums text-slate-600 dark:text-slate-300">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-2.5 text-right font-mono-nums text-slate-600 dark:text-slate-300">
                    {formatCurrency(item.unit_price, currency)}
                  </td>
                  <td className="py-2.5 text-right font-mono-nums text-slate-400 text-xs">
                    {item.tax_rate}%
                  </td>
                  <td className="py-2.5 text-right font-mono-nums font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.line_ttc ?? 0, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {po.notes && (
        <Card>
          <span className="text-slate-400 block text-xs font-semibold uppercase mb-1">Notes / Instructions</span>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line text-sm">{po.notes}</p>
        </Card>
      )}

      {/* PDF Modal */}
      <Modal open={showPDF} onClose={() => setShowPDF(false)} size="xl">
        <div className="h-[80vh]">
          {org && (
            <InvoicePDFViewer
              invoice={{
                ...po,
                invoice_items: po.purchase_order_items as any,
                clients: poClient,
              }}
              org={org}
              documentTitle="BON DE COMMANDE"
            />
          )}
        </div>
      </Modal>

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          open={showShare}
          onClose={() => setShowShare(false)}
          documentType="bon de commande"
          documentNumber={po.number}
          clientName={poClient?.name ?? ''}
          amount={po.total_ttc}
          currency={po.currency}
        />
      )}

      {/* Convert Confirm Modal */}
      <ConfirmModal
        open={converting}
        onClose={() => setConverting(false)}
        onConfirm={async () => {
          const inv = await convertPO.mutateAsync(po.id)
          setConverting(false)
          if (inv?.id) navigate(`/invoices/${inv.id}`)
        }}
        title="Convertir le bon de commande en facture"
        message={`Transformer le bon de commande ${po.number} en facture ?`}
        confirmLabel="Convertir en facture"
        loading={convertPO.isPending}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          await deletePO.mutateAsync(po.id)
          setDeleting(false)
          navigate('/purchase-orders')
        }}
        title="Supprimer le bon de commande"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le bon de commande ${po.number} ?`}
        confirmLabel="Supprimer"
        loading={deletePO.isPending}
      />
    </div>
  )
}

function KPIBox({ label, value, color }: { label: string; value: string; color: 'blue' | 'slate' | 'amber' }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
  }
  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <span className="text-xs opacity-75 font-medium">{label}</span>
      <p className="text-lg font-bold font-mono-nums mt-0.5">{value}</p>
    </div>
  )
}
