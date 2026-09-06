import { useAllPayments } from '@/hooks/usePayments'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { CreditCard } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'
import { PAYMENT_METHODS } from '@/constants'

export function PaymentsPage() {
  const org = useCurrentOrg()
  const { data: payments = [], isLoading } = useAllPayments()
  const currency = org?.currency ?? 'XOF'
  const methodLabel = (m: string) => PAYMENT_METHODS.find(p => p.value === m)?.label ?? m

  const columns = [
    { key: 'date', header: 'Date', render: (p: Record<string, unknown>) => formatDate(p.date as string) },
    {
      key: 'invoice', header: 'Facture',
      render: (p: Record<string, unknown>) => {
        const inv = p.invoices as { number: string; clients: { name: string } | null } | null
        return (
          <div>
            <p className="font-mono-nums font-semibold text-sm">{inv?.number ?? '—'}</p>
            <p className="text-xs text-slate-400">{inv?.clients?.name ?? '—'}</p>
          </div>
        )
      },
    },
    { key: 'method', header: 'Mode', render: (p: Record<string, unknown>) => <span className="text-sm">{methodLabel(p.method as string)}</span> },
    { key: 'reference', header: 'Référence', render: (p: Record<string, unknown>) => <span className="text-sm text-slate-400">{(p.reference as string) ?? '—'}</span> },
    {
      key: 'amount', header: 'Montant', align: 'right' as const,
      render: (p: Record<string, unknown>) => (
        <span className="font-mono-nums font-bold text-green-700 dark:text-green-400 text-sm">
          {formatCurrency(p.amount as number, currency)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paiements</h1>
        <p className="text-sm text-slate-400 mt-0.5">{payments.length} paiement{payments.length !== 1 ? 's' : ''}</p>
      </div>

      {payments.length === 0 && !isLoading ? (
        <EmptyState icon={<CreditCard className="w-8 h-8" />} title="Aucun paiement" description="Les paiements enregistrés sur vos factures apparaîtront ici." />
      ) : (
        <Table columns={columns} data={payments as unknown as ({ id: string } & Record<string, unknown>)[]} loading={isLoading} />
      )}
    </div>
  )
}
