import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useCurrentOrg } from '@/hooks/useAuth'
import { ClientSelector } from '@/components/shared/ClientSelector'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DocumentLines } from '@/components/shared/DocumentLines'
import { DocumentTotalsBox } from '@/components/shared/DocumentTotalsBox'
import { useCreatePurchaseOrder, usePurchaseOrder, useUpdatePurchaseOrder } from '@/hooks/usePurchaseOrders'
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
  date: z.string().min(1),
  expected_date: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  template: z.string(),
  items: z.array(itemSchema).min(1, 'Ajoutez au moins une ligne'),
})
type FormData = z.infer<typeof schema>

export function PurchaseOrderFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const org = useCurrentOrg()
  const isEditing = !!id && id !== 'new'
  const [client, setClient] = useState<Client | null>(null)

  const { data: existingPO } = usePurchaseOrder(isEditing ? id : undefined)
  const createPO = useCreatePurchaseOrder()
  const updatePO = useUpdatePurchaseOrder()

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      expected_date: '',
      reference: '',
      notes: '',
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
    if (existingPO) {
      reset({
        date: existingPO.date,
        expected_date: existingPO.expected_date ?? undefined,
        reference: existingPO.reference ?? undefined,
        notes: existingPO.notes ?? undefined,
        template: existingPO.template ?? 'classic',
        items: existingPO.purchase_order_items?.map(item => ({
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
      if (existingPO.clients) {
        setClient(existingPO.clients as unknown as Client)
      }
    }
  }, [existingPO, reset])

  async function onSubmit(data: FormData) {
    if (!org) {
      toast.error('Organisation introuvable')
      return
    }

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

    const poData = {
      client_id: client?.id ?? null,
      date: data.date,
      expected_date: data.expected_date || null,
      reference: data.reference || null,
      notes: data.notes || null,
      template: data.template,
      currency: org.currency,
      converted_to_invoice_id: null,
    }

    if (isEditing) {
      await updatePO.mutateAsync({ id: id!, order: poData, items })
      navigate(`/purchase-orders/${id}`)
    } else {
      const created = await createPO.mutateAsync({ order: poData, items })
      navigate(`/purchase-orders/${created.id}`)
    }
  }

  const currency = org?.currency ?? 'XOF'

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Modifier le bon de commande' : 'Nouveau bon de commande'}
            </h1>
            {!isEditing && (
              <p className="text-sm text-slate-400 mt-1">Le numéro sera généré automatiquement.</p>
            )}
          </div>
          <Button type="button" variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            Retour
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Destinataire (Fournisseur ou Client)</h2>
            <ClientSelector value={client} onChange={setClient} />
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Informations du document</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Date" type="date" required {...register('date')} />
              <Input label="Date prévue" type="date" {...register('expected_date')} />
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
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Articles & Marchandises commandés</h2>
            <DocumentLines vatDefault={org?.default_vat ?? 18} currency={currency} />
            {errors.items && (
              <p className="text-xs text-red-500 mt-2">{errors.items.message}</p>
            )}
          </Card>

          {/* Totals box */}
          <div className="flex justify-end">
            <DocumentTotalsBox currency={currency} />
          </div>

          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Notes & Instructions de livraison</h2>
            <Textarea
              label="Notes"
              rows={3}
              placeholder="Instructions de livraison, lieu de dépôt, etc."
              {...register('notes')}
            />
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Enregistrer les modifications' : 'Créer le bon de commande'}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}