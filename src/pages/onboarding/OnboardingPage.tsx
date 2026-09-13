import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Building2, Image, MapPin, Phone, Mail, Globe, Hash, FileText, DollarSign, Percent, List } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { CURRENCIES, COUNTRIES, VAT_RATES } from '@/constants'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'

const steps = [
  { id: 1, title: "Nom de l'entreprise", icon: Building2 },
  { id: 2, title: 'Logo', icon: Image },
  { id: 3, title: 'Adresse', icon: MapPin },
  { id: 4, title: 'Téléphone', icon: Phone },
  { id: 5, title: 'Email', icon: Mail },
  { id: 6, title: 'Site web', icon: Globe },
  { id: 7, title: 'NIF / Fiscal', icon: Hash },
  { id: 8, title: 'Régime fiscal', icon: FileText },
  { id: 9, title: 'Devise', icon: DollarSign },
  { id: 10, title: 'TVA par défaut', icon: Percent },
  { id: 11, title: 'Préfixes documents', icon: List },
]

const schema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  website: z.string().optional(),
  nif: z.string().optional(),
  tax_regime: z.string().optional(),
  currency: z.string(),
  default_vat: z.number().min(0).max(100),
  invoice_prefix: z.string().min(1),
  quote_prefix: z.string().min(1),
  receipt_prefix: z.string().min(1),
  po_prefix: z.string().min(1),
})
type FormData = z.infer<typeof schema>

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setOrganization, setRole } = useAuthStore()
  const [step, setStep] = useState(1)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: 'XOF',
      default_vat: 18,
      country: 'ML',
      invoice_prefix: 'FAC',
      quote_prefix: 'DEV',
      receipt_prefix: 'REC',
      po_prefix: 'BC',
    },
  })

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo : max 2 Mo'); return }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function onSubmit(data: FormData) {
    if (!user) {
      toast.error('Votre session a expiré. Veuillez vous reconnecter.')
      navigate('/auth/login', { replace: true })
      return
    }
    setSaving(true)
    try {
      // The database function creates the workspace and every required default
      // record atomically, then returns the organisation for the dashboard route.
      const { data: org, error: orgErr } = await supabase.rpc('create_organization_onboarding', {
        p_name: data.name,
        p_address: data.address || null,
        p_city: data.city || null,
        p_country: data.country || 'ML',
        p_phone: data.phone || null,
        p_email: data.email || null,
        p_website: data.website || null,
        p_nif: data.nif || null,
        p_tax_regime: data.tax_regime || null,
        p_currency: data.currency,
        p_default_vat: data.default_vat,
        p_invoice_prefix: data.invoice_prefix,
        p_quote_prefix: data.quote_prefix,
        p_receipt_prefix: data.receipt_prefix,
        p_po_prefix: data.po_prefix,
      })

      if (orgErr || !org) throw orgErr || new Error('Création organisation échouée')

      setOrganization(org)
      setRole('owner')
      toast.success('Entreprise configurée !')
      navigate('/dashboard', { replace: true })

      // 2. Upload logo
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `${org.id}/logo.${ext}`
        const { error: upErr } = await supabase.storage
          .from('logos')
          .upload(path, logoFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
          await supabase.from('organizations').update({ logo_url: urlData.publicUrl }).eq('id', org.id)
        }
      }

    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Erreur lors de la configuration.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const progress = ((step - 1) / (steps.length - 1)) * 100

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bienvenue sur InvoicePro</h1>
          <p className="text-slate-500 text-sm mt-1">Configurons votre entreprise en quelques étapes</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Étape {step} sur {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => s.id < step && setStep(s.id)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                s.id < step
                  ? 'bg-blue-600 text-white cursor-pointer'
                  : s.id === step
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-600'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              )}
              title={s.title}
              disabled={s.id > step}
            >
              {s.id < step ? <CheckCircle2 className="w-4 h-4" /> : s.id}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[220px]">
            {/* Step title */}
            <div className="flex items-center gap-2 mb-5">
              {(() => { const Icon = steps[step - 1].icon; return <Icon className="w-5 h-5 text-blue-600" /> })()}
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {steps[step - 1].title}
              </h2>
            </div>

            {/* Step content */}
            {step === 1 && (
              <Input
                label="Nom de l'entreprise"
                placeholder="Ex : SARL Mamby & Associés"
                required
                error={errors.name?.message}
                autoFocus
                {...register('name')}
              />
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Importez votre logo (PNG, JPG, SVG — max 2 Mo)</p>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-24 h-24 object-contain rounded-xl border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <Image className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors">
                        <Image className="w-4 h-4" /> Choisir un fichier
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                    {logoFile && <p className="text-xs text-slate-400 mt-1">{logoFile.name}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <Input label="Adresse" placeholder="Rue, quartier..." {...register('address')} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Ville" placeholder="Bamako" {...register('city')} />
                  <Select
                    label="Pays"
                    options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
                    {...register('country')}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <Input label="Téléphone" type="tel" placeholder="+223 76 00 00 00" {...register('phone')} />
            )}

            {step === 5 && (
              <Input label="Email professionnel" type="email" placeholder="contact@entreprise.com" error={errors.email?.message} {...register('email')} />
            )}

            {step === 6 && (
              <Input label="Site web" placeholder="https://www.votre-site.com" {...register('website')} />
            )}

            {step === 7 && (
              <Input label="NIF / Numéro fiscal" placeholder="Ex: 123456789" {...register('nif')} hint="Numéro d'Identification Fiscale" />
            )}

            {step === 8 && (
              <Select
                label="Régime fiscal"
                options={[
                  { value: 'normal', label: 'Régime normal' },
                  { value: 'simplifie', label: 'Régime simplifié' },
                  { value: 'micro', label: 'Micro-entreprise' },
                  { value: 'exonere', label: 'Exonéré de TVA' },
                  { value: 'autre', label: 'Autre' },
                ]}
                placeholder="Sélectionner..."
                {...register('tax_regime')}
              />
            )}

            {step === 9 && (
              <Select
                label="Devise principale"
                options={CURRENCIES.map(c => ({ value: c.code, label: `${c.name} (${c.symbol})` }))}
                {...register('currency')}
              />
            )}

            {step === 10 && (
              <Select
                label="Taux de TVA par défaut"
                options={VAT_RATES.map(r => ({ value: r, label: r === 0 ? 'Exonéré (0%)' : `${r}%` }))}
                value={watch('default_vat')}
                onChange={e => setValue('default_vat', Number(e.target.value))}
              />
            )}

            {step === 11 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-3">
                  Ces préfixes génèrent automatiquement les numéros : <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">FAC-2026-0001</code>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Factures" placeholder="FAC" error={errors.invoice_prefix?.message} {...register('invoice_prefix')} />
                  <Input label="Devis" placeholder="DEV" error={errors.quote_prefix?.message} {...register('quote_prefix')} />
                  <Input label="Reçus" placeholder="REC" error={errors.receipt_prefix?.message} {...register('receipt_prefix')} />
                  <Input label="Bons de commande" placeholder="BC" error={errors.po_prefix?.message} {...register('po_prefix')} />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              ← Précédent
            </Button>

            {step < steps.length ? (
              <Button type="button" onClick={() => setStep(s => s + 1)}>
                Suivant →
              </Button>
            ) : (
              <Button type="submit" loading={saving} icon={<CheckCircle2 className="w-4 h-4" />}>
                Créer mon espace
              </Button>
            )}
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          Vous pourrez modifier ces informations à tout moment dans les Paramètres.
        </p>
      </div>
    </div>
  )
}
