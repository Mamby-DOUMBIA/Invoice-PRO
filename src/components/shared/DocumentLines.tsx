import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { calcLine } from '@/utils/calc'
import { formatCurrency } from '@/utils/format'
import { UNITS, VAT_RATES } from '@/constants'
import { useProducts } from '@/hooks/useProducts'
import { useState, useRef } from 'react'
import type { Product } from '@/types/database'
import { cn } from '@/utils/cn'

interface Props {
  currency: string
  vatDefault: number
}

export function DocumentLines({ currency, vatDefault }: Props) {
  const { register, control, setValue } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const [productSearch, setProductSearch] = useState<Record<number, string>>({})
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const { data: allProducts = [] } = useProducts()

  function addLine() {
    append({
      description: '',
      quantity: 1,
      unit: 'unité',
      unit_price: 0,
      discount_pct: 0,
      discount_amt: 0,
      tax_rate: vatDefault,
      product_id: null,
    })
  }

  function selectProduct(index: number, product: Product) {
    setValue(`items.${index}.description`, product.name)
    setValue(`items.${index}.unit_price`, product.price_ht)
    setValue(`items.${index}.unit`, product.unit)
    setValue(`items.${index}.tax_rate`, product.tax_rate)
    setValue(`items.${index}.product_id`, product.id)
    setOpenDropdown(null)
    setProductSearch(p => ({ ...p, [index]: '' }))
  }

  return (
    <div className="space-y-3">
      {/* Header — desktop only */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 px-1">
        {['Description', 'Qté', 'Unité', 'Prix HT', 'Remise %', 'TVA %', ''].map(h => (
          <span key={h} className="text-xs font-semibold text-slate-400 uppercase">{h}</span>
        ))}
      </div>

      {fields.map((field, index) => (
        <LineRow
          key={field.id}
          index={index}
          currency={currency}
          onRemove={() => remove(index)}
          products={allProducts.filter(p =>
            !productSearch[index] || p.name.toLowerCase().includes(productSearch[index].toLowerCase())
          )}
          search={productSearch[index] ?? ''}
          onSearchChange={v => { setProductSearch(p => ({ ...p, [index]: v })); setOpenDropdown(index) }}
          openDropdown={openDropdown === index}
          onOpenDropdown={() => setOpenDropdown(index)}
          onCloseDropdown={() => setOpenDropdown(null)}
          onSelectProduct={p => selectProduct(index, p)}
          register={register}
          control={control}
        />
      ))}

      <Button type="button" variant="ghost" size="sm" icon={<Plus className="w-4 h-4" />} onClick={addLine}>
        Ajouter une ligne
      </Button>
    </div>
  )
}

function LineRow({ index, currency, onRemove, products, search, onSearchChange, openDropdown, onOpenDropdown, onCloseDropdown, onSelectProduct, register, control }: {
  index: number
  currency: string
  onRemove: () => void
  products: Product[]
  search: string
  onSearchChange: (v: string) => void
  openDropdown: boolean
  onOpenDropdown: () => void
  onCloseDropdown: () => void
  onSelectProduct: (p: Product) => void
  register: ReturnType<typeof useFormContext>['register']
  control: ReturnType<typeof useFormContext>['control']
}) {
  const qty = useWatch({ control, name: `items.${index}.quantity` }) ?? 0
  const unit_price = useWatch({ control, name: `items.${index}.unit_price` }) ?? 0
  const discount_pct = useWatch({ control, name: `items.${index}.discount_pct` }) ?? 0
  const discount_amt = useWatch({ control, name: `items.${index}.discount_amt` }) ?? 0
  const tax_rate = useWatch({ control, name: `items.${index}.tax_rate` }) ?? 0
  const ref = useRef<HTMLDivElement>(null)
  const descriptionField = register(`items.${index}.description`)
  const {
    onChange: onDescriptionChange,
    onBlur: onDescriptionBlur,
    ...descriptionProps
  } = descriptionField

  const calc = calcLine({ quantity: qty, unit_price, discount_pct, discount_amt, tax_rate })

  return (
    <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
      {/* Mobile: stacked / Desktop: grid */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 items-start">
        {/* Description with autocomplete */}
        <div className="relative" ref={ref}>
          <input
            className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            placeholder="Description / produit"
            onFocus={onOpenDropdown}
            {...descriptionProps}
            onBlur={event => {
              onDescriptionBlur(event)
              setTimeout(onCloseDropdown, 150)
            }}
            onChange={event => {
              onDescriptionChange(event)
              onSearchChange(event.target.value)
            }}
            value={search || ''}
          />
          {openDropdown && products.length > 0 && (
            <div className="absolute top-10 left-0 z-20 w-full max-h-48 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
              {products.slice(0, 8).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => onSelectProduct(p)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-slate-400 ml-2">{formatCurrency(p.price_ht, currency)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="number" step="0.01" min="0"
          className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          placeholder="Qté"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
        />

        <select
          className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          {...register(`items.${index}.unit`)}
        >
          {UNITS.map(u => <option key={u}>{u}</option>)}
        </select>

        <input
          type="number" step="0.01" min="0"
          className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          placeholder="Prix HT"
          {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
        />

        <input
          type="number" step="0.01" min="0" max="100"
          className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          placeholder="Remise %"
          {...register(`items.${index}.discount_pct`, { valueAsNumber: true })}
        />

        <select
          className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          {...register(`items.${index}.tax_rate`, { valueAsNumber: true })}
        >
          {VAT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
        </select>

        <button type="button" onClick={onRemove} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Line total */}
      <div className="flex justify-end mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        Total ligne: <span className="ml-1 font-mono-nums font-semibold text-slate-700 dark:text-slate-300">
          {formatCurrency(calc.line_ttc, currency)}
        </span>
      </div>
    </div>
  )
}
