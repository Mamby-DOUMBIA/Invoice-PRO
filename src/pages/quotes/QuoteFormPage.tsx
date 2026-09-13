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
import { useCreateQuote, useQuote, useUpdateQuote } from '@/hooks/useQuotes'
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
  expiry_date: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  conditions: z.string().optional(),
  template: z.string(),
  items: z.array(itemSchema).min(1, 'Ajoutez au moins une ligne'),
})
type FormData = z.infer<typeof schema>

export function QuoteFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const org = useCurrentOrg()
  const isEditing = !!id && id !== 'new'
  const [client, setClient] = useState<Client | null>(null)

  const { data: existingQuote } = useQuote(isEditing ? id : undefined)
  const createQuote = useCreateQuote()
  const updateQuote = useUpdateQuote()

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
    if (existingQuote) {
      reset({
        date: existingQuote.date,
        expiry_date: existingQuote.expiry_date ?? undefined,
        reference: existingQuote.reference ?? undefined,
        notes: existingQuote.notes ?? undefined,
        conditions: existingQuote.conditions ?? undefined,
        template: existingQuote.template,
        items: existingQuote.quote_items?.map(item => ({
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
      if (existingQuote.clients) {
        setClient(existingQuote.clients as unknown as Client)
      }
    }
  }, [existingQuote, reset])

  async function onSubmit(data: FormData) {
    if (!client) { toast.error('Veuillez sélectionner un client'); return }

    const items = data.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_pct: item.discount_pct,
      discount_amt: item.discount_amt,
      tax_rate: item.tax_rate,
      product_id: item.product_id ?? null,
    }))

    const quoteData = {
      client_id: client.id,
      date: data.date,
      expiry_date: data.expiry_date || null,
      reference: data.reference || null,
      notes: data.notes || null,
      conditions: data.conditions || null,
      template: data.template,
      currency: org?.currency ?? 'XOF',
      converted_to_invoice_id: null,
      created_by: null,
    }

    if (isEditing) {
      await updateQuote.mutateAsync({ id: id!, quote: quoteData, items })
      navigate(`/quotes/${id}`)
    } else {
      const q = await createQuote.mutateAsync({ quote: quoteData, items })
      navigate(`/quotes/${q.id}`)
    }
  }

  const currency = org?.currency ?? 'XOF'

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Modifier le devis' : 'Nouveau devis'}
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
              <Input label="Date d'expiration" type="date" {...register('expiry_date')} />
              <Input label="Référence" placeholder="Optionnel" {...register('reference')} />
              <Select
                label="Modèle PDF"
                options={PDF_TEMPLATES}
                {...register('template')}
              />
            </div>
          </Card>

          {/* Lines */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Articles & Prestations</h2>
            <DocumentLines vatDefault={org?.default_vat ?? 18} currency={currency} />
            {errors.items && (
              <p className="text-xs text-red-500 mt-2">{errors.items.message}</p>
            )}
          </Card>

          {/* Totals box */}
          <div className="flex justify-end">
            <DocumentTotalsBox currency={currency} />
          </div>

          {/* Notes & conditions */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Conditions & Notes</h2>
            <div className="space-y-4">
              <Textarea
                label="Notes client (affichées sur le devis)"
                rows={3}
                placeholder="Ex: Devis valable 30 jours..."
                {...register('notes')}
              />
              <Textarea
                label="Conditions générales"
                rows={2}
                placeholder="Modalités de paiement, acompte, etc."
                {...register('conditions')}
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Enregistrer les modifications' : 'Créer le devis'}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
