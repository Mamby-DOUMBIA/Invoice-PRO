import { useMemo } from 'react'
import { useWatch, useFormContext } from 'react-hook-form'
import { calcDocumentTotals, applyRounding } from '@/utils/calc'
import { formatCurrency } from '@/utils/format'

interface Props {
  currency: string
  amountPaid?: number
}

export function DocumentTotalsBox({ currency, amountPaid = 0 }: Props) {
  const { control } = useFormContext()
  const items = useWatch({ control, name: 'items' }) ?? []

  const totals = useMemo(() => {
    const raw = calcDocumentTotals(items)
    return applyRounding(raw, currency)
  }, [items, currency])

  const amountDue = Math.max(0, totals.total_ttc - amountPaid)

  return (
    <div className="ml-auto w-full max-w-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
      <Row label="Sous-total HT" value={formatCurrency(totals.subtotal_ht, currency)} />
      {totals.total_discount > 0 && (
        <Row label="Remise" value={`- ${formatCurrency(totals.total_discount, currency)}`} className="text-orange-600" />
      )}
      {totals.taxable_base !== totals.subtotal_ht && (
        <Row label="Base imposable" value={formatCurrency(totals.taxable_base, currency)} />
      )}
      <Row label="TVA" value={formatCurrency(totals.total_tax, currency)} />
      <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
        <Row label="Total TTC" value={formatCurrency(totals.total_ttc, currency)} bold />
      </div>
      {amountPaid > 0 && (
        <>
          <Row label="Payé" value={formatCurrency(amountPaid, currency)} className="text-green-600" />
          <Row label="Reste à payer" value={formatCurrency(amountDue, currency)} bold className="text-blue-700 dark:text-blue-400" />
        </>
      )}
    </div>
  )
}

function Row({ label, value, bold, className }: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`font-mono-nums ${bold ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'} ${className ?? ''}`}>
        {value}
      </span>
    </div>
  )
}
