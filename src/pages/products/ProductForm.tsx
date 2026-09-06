import { useFormContext, useWatch } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { UNITS, VAT_RATES } from '@/constants'
import type { Product, ProductCategory, ProductInsert, ProductUpdate } from '@/types/database'
import { formatCurrency } from '@/utils/format'

const schema = z.object({
  name: z.string().min(1, 'Obligatoire'),
  description: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(['product', 'service']),
  category_id: z.string().optional(),
  unit: z.string(),
  price_ht: z.number({ invalid_type_error: 'Nombre requis' }).min(0),
  tax_rate: z.number().min(0).max(100),
  is_active: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  initial?: Product | null
  categories: ProductCategory[]
  currency: string
  onSave: (data: ProductInsert | ProductUpdate) => Promise<void>
  onCancel: () => void
  saving?: boolean
}

function n(v: string | null | undefined): string | undefined {
  return v ?? undefined
}

export function ProductForm({ initial, categories, currency, onSave, onCancel, saving }: Props) {
  const defaultValues: Partial<FormData> = initial
    ? {
        name: initial.name,
        description: n(initial.description),
        sku: n(initial.sku),
        type: initial.type,
        category_id: n(initial.category_id),
        unit: initial.unit,
        price_ht: initial.price_ht,
        tax_rate: initial.tax_rate,
        is_active: initial.is_active,
      }
    : { type: 'service', unit: 'unité', tax_rate: 18, is_active: true, price_ht: 0 }

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const priceHt = useWatch({ control, name: 'price_ht' }) ?? 0
  const taxRate = useWatch({ control, name: 'tax_rate' }) ?? 0
  const priceTtc = (priceHt as number) * (1 + (taxRate as number) / 100)

  async function onSubmit(data: FormData) {
    await onSave({
      ...data,
      category_id: data.category_id || null,
      description: data.description || null,
      sku: data.sku || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Nom" required error={errors.name?.message} {...register('name')} />
        </div>

        <Select
          label="Type"
          options={[{ value: 'service', label: 'Service' }, { value: 'product', label: 'Produit' }]}
          {...register('type')}
        />

        <Select
          label="Catégorie"
          options={[{ value: '', label: '— Sans catégorie —' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
          {...register('category_id')}
        />

        <Input label="Référence / SKU" {...register('sku')} />

        <Select
          label="Unité"
          options={UNITS.map(u => ({ value: u, label: u }))}
          {...register('unit')}
        />

        <Input
          label="Prix HT"
          type="number"
          step="0.01"
          min="0"
          error={errors.price_ht?.message}
          {...register('price_ht', { valueAsNumber: true })}
        />

        <Select
          label="TVA (%)"
          options={VAT_RATES.map(r => ({ value: r, label: r === 0 ? 'Exonéré (0%)' : `${r}%` }))}
          {...register('tax_rate', { valueAsNumber: true })}
        />
      </div>

      {/* Prix TTC calculé */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Prix TTC calculé</span>
        <span className="text-lg font-bold text-blue-700 dark:text-blue-400 font-mono-nums">
          {formatCurrency(priceTtc, currency)}
        </span>
      </div>

      <Textarea label="Description" rows={2} {...register('description')} />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_active_prod" {...register('is_active')} className="w-4 h-4 accent-blue-600" />
        <label htmlFor="is_active_prod" className="text-sm text-slate-700 dark:text-slate-300">Produit actif</label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" loading={saving}>
          {initial ? 'Enregistrer' : 'Créer le produit'}
        </Button>
      </div>
    </form>
  )
}
