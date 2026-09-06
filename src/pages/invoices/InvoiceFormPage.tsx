import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { DocumentLines } from '@/components/shared/DocumentLines'
import { DocumentTotalsBox } from '@/components/shared/DocumentTotalsBox'
import { ClientSelector } from '@/components/shared/ClientSelector'
import { useCreateInvoice, useInvoice, useUpdateInvoice } from '@/hooks/useInvoices'
import { useCurrentOrg } from '@/hooks/useAuth'
import type { Client } from '@/types/database'
import { PDF_TEMPLATES } from '@/constants'
import toast from 'react-hot-toast'

const itemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().min(0.001),
  unit: z.string(),
  unit_price: z.number().min(0),
  discount_pct: z.number().min(0).max(100),
  discount_amt: z.number().min(0),
  tax_rate: z.number().min(0),
  product_id: z.string().nullable().optional(),
})

const schema = z.object({
  date: z.string(),
  due_date: z.string().optional(),
  reference: z.string().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  conditions: z.string().optional(),
  template: z.string(),
  items: z.array(itemSchema).min(1, 'Ajoutez au moins une ligne'),
})
type FormData = z.infer<typeof schema>
type LineItem = z.infer<typeof itemSchema>

export function InvoiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const org = useCurrentOrg()
  const isEditing = !!id && id !== 'new'
  const [client, setClient] = useState<Client | null>(null)

  const { data: existingInvoice } = useInvoice(isEditing ? id : undefined)
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      template: org?.default_template ?? 'classic',
      items: [{
        description: '',
        quantity: 1,
        unit: 'unité',
        unit_price: 0,
        discount_pct: 0,
        discount_amt: 0,
        tax_rate: org?.default_vat ?? 18,
        product_id: null,
      }],
    },
  })

  const { handleSubmit, register, reset, formState: { errors, isSubmitting } } = methods

  useEffect(() => {
    if (existingInvoice) {
      reset({
        date: existingInvoice.date,
        due_date: existingInvoice.due_date ?? undefined,
        reference: existingInvoice.reference ?? undefined,
        payment_terms: existingInvoice.payment_terms ?? undefined,
        notes: existingInvoice.notes ?? undefined,
        conditions: existingInvoice.conditions ?? undefined,
        template: existingInvoice.template,
        items: existingInvoice.invoice_items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_pct: item.discount_pct,
          discount_amt: item.discount_amt,
          tax_rate: item.tax_rate,
          product_id: item.product_id ?? null,
        })) ?? [],
      })
      if (existingInvoice.clients) {
        setClient(existingInvoice.clients as unknown as Client)
      }
    }
  }, [existingInvoice, reset])

  async function onSubmit(data: FormData) {
    if (!client) { toast.error('Veuillez sélectionner un client'); return }

    // Items without line-computed fields — the hook calculates them
    const items = data.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_pct: item.discount_pct,
      discount_amt: item.discount_amt,
      tax_rate: item.tax_rate,
      product_id: item.product_id ?? null,
      line_ht: 0,   // recalculated in hook
      line_tax: 0,
      line_ttc: 0,
      position: 0,
    }))

    const invoiceData = {
      client_id: client.id,
      date: data.date,
      due_date: data.due_date || null,
      reference: data.reference || null,
      payment_terms: data.payment_terms || null,
      notes: data.notes || null,
      conditions: data.conditions || null,
      template: data.template,
      currency: org?.currency ?? 'XOF',
      amount_paid: 0,
      status: 'draft' as const,
      created_by: null,
      quote_id: null,
      sent_at: null,
      paid_at: null,
      cancelled_at: null,
    }

    if (isEditing) {
      await updateInvoice.mutateAsync({ id: id!, data: invoiceData, items })
      navigate(`/invoices/${id}`)
    } else {
      const inv = await createInvoice.mutateAsync({ invoice: invoiceData, items })
      navigate(`/invoices/${inv.id}`)
    }
  }

  const currency = org?.currency ?? 'XOF'

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Modifier la facture' : 'Nouvelle facture'}
            </h1>
            {!isEditing && (
              <p className="text-sm text-slate-400 mt-0.5">Numéro généré automatiquement</p>
            )}
          </div>
          <Button variant="secondary" onClick={() => navigate(-1)}>Annuler</Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Client */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Client</h2>
            <ClientSelector value={client} onChange={setClient} />
          </Card>

          {/* Info document */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Informations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Date" type="date" required {...register('date')} />
              <Input label="Date d'échéance" type="date" {...register('due_date')} />
              <Input label="Référence" placeholder="Optionnel" {...register('reference')} />
              <Input label="Conditions de paiement" placeholder="Ex: 30 jours" {...register('payment_terms')} />
              <Select label="Modèle PDF" options={PDF_TEMPLATES} {...register('template')} />
            </div>
          </Card>

          {/* Lines */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Lignes de facturation</h2>
            {errors.items && typeof errors.items.message === 'string' && (
              <p className="text-sm text-red-500 mb-3">{errors.items.message}</p>
            )}
            <DocumentLines currency={currency} vatDefault={org?.default_vat ?? 18} />
          </Card>

          {/* Totals */}
          <div className="flex justify-end">
            <DocumentTotalsBox currency={currency} />
          </div>

          {/* Notes */}
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea label="Notes" placeholder="Notes pour le client..." rows={3} {...register('notes')} />
              <Textarea label="Conditions générales" placeholder="Conditions de paiement, retards..." rows={3} {...register('conditions')} />
            </div>
          </Card>

          {/* Footer CTA */}
          <div className="flex justify-end gap-3 py-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-950">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={isSubmitting} size="lg">
              {isEditing ? 'Enregistrer les modifications' : 'Créer la facture'}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
