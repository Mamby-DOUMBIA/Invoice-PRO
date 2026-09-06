import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, FileText, Users, CreditCard, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Organization } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { CURRENCIES, COUNTRIES, VAT_RATES, PDF_TEMPLATES, PLAN_LABELS } from '@/constants'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'company',      label: 'Entreprise',   icon: Building2 },
  { id: 'billing',      label: 'Facturation',  icon: FileText },
  { id: 'subscription', label: 'Abonnement',   icon: CreditCard },
  { id: 'users',        label: 'Utilisateurs', icon: Users },
  { id: 'security',     label: 'Sécurité',     icon: Shield },
]

const companySchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  nif: z.string().optional(),
  tax_regime: z.string().optional(),
  currency: z.string(),
  default_vat: z.number(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  bank_iban: z.string().optional(),
  primary_color: z.string(),
  default_template: z.string(),
  invoice_notes: z.string().optional(),
  invoice_footer: z.string().optional(),
})
type CompanyForm = z.infer<typeof companySchema>

/* ─── Main page ─── */
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const { organization, setOrganization } = useAuthStore()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'company' && organization && (
        <CompanySettings org={organization} onUpdate={(o) => setOrganization(o)} />
      )}
      {activeTab === 'billing' && (
        <BillingSettings />
      )}
      {activeTab === 'subscription' && (
        <SubscriptionSettings />
      )}
      {activeTab === 'users' && (
        <UsersSettings />
      )}
      {activeTab === 'security' && (
        <SecuritySettings />
      )}
    </div>
  )
}

/* ─── Company settings ─── */
function CompanySettings({ org, onUpdate }: { org: Organization; onUpdate: (o: Organization) => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: org.name,
      address: org.address ?? '',
      city: org.city ?? '',
      country: org.country ?? 'ML',
      phone: org.phone ?? '',
      email: org.email ?? '',
      website: org.website ?? '',
      nif: org.nif ?? '',
      tax_regime: org.tax_regime ?? '',
      currency: org.currency,
      default_vat: org.default_vat,
      bank_name: org.bank_name ?? '',
      bank_account: org.bank_account ?? '',
      bank_iban: org.bank_iban ?? '',
      primary_color: org.primary_color,
      default_template: org.default_template,
      invoice_notes: org.invoice_notes ?? '',
      invoice_footer: org.invoice_footer ?? '',
    },
  })

  async function onSubmit(data: CompanyForm) {
    const { data: updated, error } = await supabase
      .from('organizations')
      .update({
        name: data.name,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        nif: data.nif || null,
        tax_regime: data.tax_regime || null,
        currency: data.currency,
        default_vat: data.default_vat,
        bank_name: data.bank_name || null,
        bank_account: data.bank_account || null,
        bank_iban: data.bank_iban || null,
        primary_color: data.primary_color,
        default_template: data.default_template,
        invoice_notes: data.invoice_notes || null,
        invoice_footer: data.invoice_footer || null,
      })
      .eq('id', org.id)
      .select()
      .single()
    if (error) { toast.error('Erreur lors de la sauvegarde'); return }
    onUpdate(updated as Organization)
    toast.success('Paramètres sauvegardés')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Identité</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nom de l'entreprise" required {...register('name')} />
          <Input label="Email" type="email" {...register('email')} />
          <Input label="Téléphone" {...register('phone')} />
          <Input label="Site web" {...register('website')} />
          <Input label="Adresse" {...register('address')} />
          <Input label="Ville" {...register('city')} />
          <Select
            label="Pays"
            options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
            {...register('country')}
          />
          <Input label="NIF" {...register('nif')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Fiscalité</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Devise"
            options={CURRENCIES.map(c => ({ value: c.code, label: `${c.name} (${c.symbol})` }))}
            {...register('currency')}
          />
          <Select
            label="TVA par défaut"
            options={VAT_RATES.map(r => ({ value: r, label: r === 0 ? 'Exonéré (0%)' : `${r}%` }))}
            {...register('default_vat', { valueAsNumber: true })}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Informations bancaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Banque" {...register('bank_name')} />
          <Input label="Numéro de compte" {...register('bank_account')} />
          <Input label="IBAN" {...register('bank_iban')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Documents</h2>
        <div className="space-y-4">
          <Select
            label="Modèle PDF par défaut"
            options={PDF_TEMPLATES}
            {...register('default_template')}
          />
          <Textarea label="Notes par défaut" rows={2} {...register('invoice_notes')} />
          <Textarea label="Pied de page" rows={2} {...register('invoice_footer')} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>Enregistrer</Button>
      </div>
    </form>
  )
}

/* ─── Billing settings ─── */
function BillingSettings() {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Numérotation</h2>
      <p className="text-sm text-slate-500 mb-4">
        Configurez vos préfixes directement dans Supabase → table{' '}
        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">document_sequences</code>.
      </p>
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        Exemple : <strong>FAC-2026-0001</strong> — Préfixe: FAC | Année | Compteur 4 chiffres
      </div>
    </Card>
  )
}

/* ─── Subscription settings ─── */
function SubscriptionSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Plan actuel</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">Gratuit</p>
            <p className="text-sm text-slate-500 mt-1">Fonctionnalités de base — jusqu'à 10 factures</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">
            Actif
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { plan: 'starter', price: '5 000 FCFA', features: ['100 factures/mois', '50 clients', 'Statistiques', 'Export'] },
          { plan: 'pro',     price: '15 000 FCFA', features: ['Illimité', 'Multi-utilisateurs', 'Branding', 'API'] },
          { plan: 'business',price: '30 000 FCFA', features: ['Illimité', 'SLA', 'Support prioritaire', 'Multi-org'] },
        ].map(p => (
          <div key={p.plan} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <p className="font-bold text-slate-900 dark:text-white">{PLAN_LABELS[p.plan]}</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {p.price}
              <span className="text-sm font-normal text-slate-400">/mois</span>
            </p>
            <ul className="mt-3 space-y-1">
              {p.features.map(f => (
                <li key={f} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-4" size="sm">Choisir</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Users settings ─── */
function UsersSettings() {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Membres de l'équipe</h2>
      <p className="text-sm text-slate-500">
        La gestion multi-utilisateurs est disponible à partir du plan Starter.
      </p>
    </Card>
  )
}

/* ─── Security settings ─── */
function SecuritySettings() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  async function sendPasswordReset() {
    if (!user?.email) return
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(user.email)
    setLoading(false)
    toast.success('Email de réinitialisation envoyé')
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Sécurité</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</p>
            <p className="text-xs text-slate-400">Modifiez votre mot de passe via email</p>
          </div>
          <Button variant="secondary" size="sm" loading={loading} onClick={sendPasswordReset}>
            Changer
          </Button>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
