import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { COUNTRIES } from '@/constants'
import type { Client, ClientInsert, ClientUpdate } from '@/types/database'

const schema = z.object({
  name: z.string().min(1, 'Obligatoire'),
  company_name: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  nif: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  initial?: Client | null
  onSave: (data: ClientInsert | ClientUpdate) => Promise<void>
  onCancel: () => void
  saving?: boolean
}

function nullToUndef<T>(v: T | null | undefined): T | undefined {
  return v ?? undefined
}

export function ClientForm({ initial, onSave, onCancel, saving }: Props) {
  const defaultValues: Partial<FormData> = initial
    ? {
        name: initial.name,
        company_name: nullToUndef(initial.company_name),
        email: nullToUndef(initial.email) ?? '',
        phone: nullToUndef(initial.phone),
        whatsapp: nullToUndef(initial.whatsapp),
        address: nullToUndef(initial.address),
        city: nullToUndef(initial.city),
        country: nullToUndef(initial.country),
        nif: nullToUndef(initial.nif),
        notes: nullToUndef(initial.notes),
        is_active: initial.is_active,
      }
    : { is_active: true }

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function onSubmit(data: FormData) {
    await onSave({
      name: data.name,
      company_name: data.company_name || null,
      email: data.email || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      nif: data.nif || null,
      notes: data.notes || null,
      is_active: data.is_active ?? true,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nom complet" required error={errors.name?.message} {...register('name')} />
        <Input label="Entreprise" {...register('company_name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Téléphone" type="tel" {...register('phone')} />
        <Input label="WhatsApp" type="tel" {...register('whatsapp')} />
        <Input label="NIF / Numéro fiscal" {...register('nif')} />
        <Input label="Adresse" {...register('address')} />
        <Input label="Ville" {...register('city')} />
        <Select
          label="Pays"
          options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
          placeholder="Sélectionner..."
          {...register('country')}
        />
      </div>
      <Textarea label="Notes" rows={2} {...register('notes')} />

      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 accent-blue-600" />
        <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300">Client actif</label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" loading={saving}>
          {initial ? 'Enregistrer' : 'Créer le client'}
        </Button>
      </div>
    </form>
  )
}
