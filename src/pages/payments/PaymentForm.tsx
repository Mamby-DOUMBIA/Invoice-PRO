import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { PAYMENT_METHODS } from '@/constants'
import type { Invoice } from '@/types/database'
import type { PaymentInput } from '@/hooks/usePayments'
import { formatCurrency } from '@/utils/format'

const schema = z.object({
  amount: z.number({ invalid_type_error: 'Montant requis' }).positive('Montant positif requis'),
  method: z.enum(['cash', 'orange_money', 'moov_money', 'wave', 'bank_transfer', 'check', 'card', 'other']),
  date: z.string(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  invoice: Invoice
  currency: string
  onSave: (data: PaymentInput) => Promise<void>
  onCancel: () => void
  saving?: boolean
}

export function PaymentForm({ invoice, currency, onSave, onCancel, saving }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: invoice.amount_due > 0 ? invoice.amount_due : invoice.total_ttc,
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(data: FormData) {
    await onSave({
      invoice_id: invoice.id,
      amount: data.amount,
      method: data.method,
      date: data.date,
      reference: data.reference || null,
      notes: data.notes || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Summary */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Facture</span>
          <span className="font-mono-nums font-semibold">{invoice.number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total TTC</span>
          <span className="font-mono-nums">{formatCurrency(invoice.total_ttc, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Déjà payé</span>
          <span className="font-mono-nums text-green-600">
            {formatCurrency(invoice.amount_paid, currency)}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
          <span className="font-medium">Reste à payer</span>
          <span className="font-mono-nums font-bold text-orange-600">
            {formatCurrency(invoice.amount_due, currency)}
          </span>
        </div>
      </div>

      <Input
        label="Montant reçu"
        type="number"
        step="0.01"
        min="0"
        required
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />
      <Select
        label="Mode de paiement"
        required
        options={PAYMENT_METHODS}
        {...register('method')}
      />
      <Input label="Date" type="date" required {...register('date')} />
      <Input label="Référence" placeholder="N° transaction, chèque…" {...register('reference')} />
      <Textarea label="Notes" rows={2} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" loading={saving}>Enregistrer le paiement</Button>
      </div>
    </form>
  )
}
