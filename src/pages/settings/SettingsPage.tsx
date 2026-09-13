import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  FileText,
  Users,
  CreditCard,
  Shield,
  Trash2,
  CheckCircle2,
  KeyRound,
  Laptop,
  Sparkles,
  UserPlus,
  Save,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Organization, SubscriptionPlan, MemberRole } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { CURRENCIES, COUNTRIES, VAT_RATES, PDF_TEMPLATES, PLAN_LABELS } from '@/constants'
import { cn } from '@/utils/cn'
import { formatDate, formatCurrency } from '@/utils/format'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradePlanModal } from '@/components/shared/UpgradePlanModal'
import {
  useTeamMembers,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
  useAuditLogs,
} from '@/hooks/useTeam'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'company',      label: 'Entreprise',   icon: Building2 },
  { id: 'billing',      label: 'Facturation',  icon: FileText },
  { id: 'subscription', label: 'Abonnement',   icon: CreditCard },
  { id: 'users',        label: 'Utilisateurs', icon: Users },
  { id: 'security',     label: 'Sécurité',     icon: Shield },
]

const companySchema = z.object({
  name: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
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
        <BillingSettings orgId={organization?.id} />
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
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Identité de l'entreprise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nom de l'entreprise" required {...register('name')} />
          <Input label="Email de contact" type="email" {...register('email')} />
          <Input label="Téléphone" {...register('phone')} />
          <Input label="Site web" {...register('website')} />
          <Input label="Adresse" {...register('address')} />
          <Input label="Ville" {...register('city')} />
          <Select
            label="Pays"
            options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
            {...register('country')}
          />
          <Input label="NIF / Identifiant Fiscal" {...register('nif')} />
          <Input label="Régime Fiscal" {...register('tax_regime')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Fiscalité & Devise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Devise principale"
            options={CURRENCIES.map(c => ({ value: c.code, label: `${c.name} (${c.symbol})` }))}
            {...register('currency')}
          />
          <Select
            label="Taux de TVA par défaut"
            options={VAT_RATES.map(r => ({ value: r, label: r === 0 ? 'Exonéré (0%)' : `${r}%` }))}
            {...register('default_vat', { valueAsNumber: true })}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Coordonnées bancaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nom de la banque" {...register('bank_name')} />
          <Input label="Numéro de compte" {...register('bank_account')} />
          <Input label="IBAN / Clé RIB" {...register('bank_iban')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Personnalisation des documents</h2>
        <div className="space-y-4">
          <Select
            label="Modèle PDF par défaut"
            options={PDF_TEMPLATES}
            {...register('default_template')}
          />
          <Textarea label="Mentions & conditions par défaut" rows={2} {...register('invoice_notes')} />
          <Textarea label="Pied de page des documents" rows={2} {...register('invoice_footer')} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>Enregistrer les modifications</Button>
      </div>
    </form>
  )
}

/* ─── Billing / Sequences settings ─── */
interface DocSeq {
  id: string
  type: string
  prefix: string
  padding: number
}

function BillingSettings({ orgId }: { orgId?: string }) {
  const [sequences, setSequences] = useState<DocSeq[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!orgId) return
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('document_sequences')
        .select('id, type, prefix, padding')
        .eq('organization_id', orgId!)
      if (data && data.length > 0) {
        setSequences(data)
      } else {
        setSequences([
          { id: '1', type: 'invoice', prefix: 'FAC-', padding: 4 },
          { id: '2', type: 'quote', prefix: 'DEV-', padding: 4 },
          { id: '3', type: 'receipt', prefix: 'REC-', padding: 4 },
          { id: '4', type: 'purchase_order', prefix: 'BC-', padding: 4 },
        ])
      }
      setLoading(false)
    }
    load()
  }, [orgId])

  async function handleSave() {
    if (!orgId) return
    setSaving(true)
    for (const seq of sequences) {
      await supabase
        .from('document_sequences')
        .update({ prefix: seq.prefix, padding: seq.padding })
        .eq('id', seq.id)
    }
    setSaving(false)
    toast.success('Préfixes de numérotation enregistrés')
  }

  const typeLabels: Record<string, string> = {
    invoice: 'Factures de vente',
    quote: 'Devis & Proformas',
    receipt: 'Reçus de paiement',
    purchase_order: 'Bons de commande',
  }

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Numérotation des documents</h2>
        <p className="text-xs text-slate-400 mt-1">
          Personnalisez les préfixes séquentiels pour vos factures, devis, reçus et bons de commande.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-4">Chargement des séquences…</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sequences.map((seq, idx) => (
              <div key={seq.id || idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {typeLabels[seq.type] || seq.type}
                </span>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Input
                    label="Préfixe"
                    value={seq.prefix}
                    onChange={(e) => {
                      const next = [...sequences]
                      next[idx].prefix = e.target.value
                      setSequences(next)
                    }}
                  />
                  <Input
                    label="Nb chiffres"
                    type="number"
                    min={3}
                    max={8}
                    value={seq.padding}
                    onChange={(e) => {
                      const next = [...sequences]
                      next[idx].padding = Number(e.target.value) || 4
                      setSequences(next)
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Exemple généré: <strong>{seq.prefix}{new Date().getFullYear()}-0001</strong>
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              Sauvegarder les séquences
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

/* ─── Subscription settings ─── */
function SubscriptionSettings() {
  const { usage, plans } = useSubscription()
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan>('starter')

  const currentPlan = usage?.currentPlan || 'free'
  const planDetails = usage?.planDetails || plans.free

  const openUpgradeModal = (plan: SubscriptionPlan) => {
    setSelectedPlanForUpgrade(plan)
    setUpgradeModalOpen(true)
  }

  const renderMeter = (title: string, count: number, max: number) => {
    const isUnlimited = max === -1
    const pct = isUnlimited ? Math.min(count * 5, 100) : Math.min(Math.round((count / max) * 100), 100)
    const isNearLimit = !isUnlimited && pct >= 80

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-600 dark:text-slate-300">{title}</span>
          <span className="text-slate-900 dark:text-white font-bold">
            {count} / {isUnlimited ? 'Illimité' : max}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isUnlimited ? 'bg-blue-500' : isNearLimit ? 'bg-amber-500' : 'bg-green-500'
            )}
            style={{ width: isUnlimited ? '100%' : `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Forfait {PLAN_LABELS[currentPlan]}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Actif
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Renouvellement mensuel automatique
            </p>
          </div>

          {currentPlan === 'free' ? (
            <Button onClick={() => openUpgradeModal('starter')}>
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
              Passer au forfait Pro
            </Button>
          ) : (
            <Button variant="outline" onClick={() => openUpgradeModal('pro')}>
              Gérer mon abonnement
            </Button>
          )}
        </div>

        {/* Quotas & Usages */}
        <div className="mt-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Utilisation ce mois-ci
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderMeter('Factures créées ce mois', usage?.invoicesCount ?? 0, planDetails.max_invoices)}
            {renderMeter('Clients enregistrés', usage?.clientsCount ?? 0, planDetails.max_clients)}
            {renderMeter('Articles / Produits', usage?.productsCount ?? 0, planDetails.max_products)}
            {renderMeter('Membres d\'équipe', usage?.usersCount ?? 1, planDetails.max_users)}
          </div>
        </div>
      </Card>

      {/* Plan Matrix */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
          Formules disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(['starter', 'pro', 'business'] as const).map(pKey => {
            const p = plans[pKey]
            const isCurrent = currentPlan === pKey
            return (
              <div
                key={pKey}
                className={cn(
                  'rounded-2xl border p-5 flex flex-col justify-between transition-all bg-white dark:bg-slate-900',
                  isCurrent
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white">{p.label}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/40 dark:text-blue-300">
                        Votre plan
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-extrabold text-blue-600 mt-2">
                    {formatCurrency(p.price_monthly, 'XOF')}
                    <span className="text-xs font-normal text-slate-400"> /mois</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {p.max_invoices === -1 ? 'Factures illimitées' : `${p.max_invoices} factures/mois`}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {p.max_clients === -1 ? 'Clients illimités' : `${p.max_clients} clients max`}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {p.max_users === -1 ? 'Collaborateurs illimités' : `Jusqu'à ${p.max_users} collaborateurs`}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Exports CSV complets & sauvegardes
                    </li>
                    {p.has_custom_branding && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        Personnalisation complète & logo
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-6">
                  {isCurrent ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Plan Actuel
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => openUpgradeModal(pKey)}
                    >
                      Choisir {p.label}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <UpgradePlanModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        targetPlan={selectedPlanForUpgrade}
      />
    </div>
  )
}

/* ─── Users / Team settings ─── */
function UsersSettings() {
  const { data: members = [], isLoading } = useTeamMembers()
  const inviteMutation = useInviteMember()
  const updateRoleMutation = useUpdateMemberRole()
  const removeMemberMutation = useRemoveMember()

  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('employee')

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return
    await inviteMutation.mutateAsync({ email: inviteEmail, role: inviteRole })
    setInviteEmail('')
    setInviteModalOpen(false)
  }

  return (
    <Card className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Membres de l'organisation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gérez les accès et les permissions des collaborateurs sur votre espace InvoicePro.
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Inviter un membre
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400 py-4">Chargement des membres…</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map(member => {
            const isOwner = member.role === 'owner'
            return (
              <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm shrink-0">
                    {(member.profile?.full_name || member.invited_email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {member.profile?.full_name || member.invited_email || 'Membre invité'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {member.invited_email || 'Actif'}
                      {member.accepted ? ' • Confirmé' : ' • En attente d\'acceptation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isOwner ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Propriétaire
                    </span>
                  ) : (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            memberId: member.id,
                            role: e.target.value as MemberRole,
                          })
                        }
                        className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-200"
                      >
                        <option value="admin">Administrateur</option>
                        <option value="accountant">Comptable</option>
                        <option value="employee">Employé</option>
                        <option value="viewer">Lecteur</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir retirer ce collaborateur ?')) {
                            removeMemberMutation.mutate(member.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Invite Modal */}
      <Modal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)}>
        <form onSubmit={handleSendInvite} className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Inviter un nouveau collaborateur
          </h3>
          <p className="text-xs text-slate-400">
            Un email d'invitation avec les accès à l'organisation lui sera envoyé.
          </p>

          <Input
            label="Adresse email"
            type="email"
            required
            placeholder="collaborateur@entreprise.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          <Select
            label="Rôle attribué"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as MemberRole)}
            options={[
              { value: 'admin', label: 'Administrateur (accès complet)' },
              { value: 'accountant', label: 'Comptable (factures, paiements, rapports)' },
              { value: 'employee', label: 'Employé (création de devis et factures)' },
              { value: 'viewer', label: 'Lecteur seul (consultation)' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setInviteModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={inviteMutation.isPending}>
              Envoyer l'invitation
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  )
}

/* ─── Security settings ─── */
function SecuritySettings() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { data: auditLogs = [], isLoading: logsLoading } = useAuditLogs()

  async function sendPasswordReset() {
    if (!user?.email) return
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(user.email)
    setLoading(false)
    toast.success('Email de réinitialisation envoyé')
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Sécurité du compte</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</p>
              <p className="text-xs text-slate-400">Modifiez votre mot de passe via email sécurisé</p>
            </div>
            <Button variant="secondary" size="sm" loading={loading} onClick={sendPasswordReset}>
              <KeyRound className="w-3.5 h-3.5 mr-1" />
              Réinitialiser
            </Button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email du compte</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Session active</p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Laptop className="w-3.5 h-3.5 text-green-500" />
                Connecté actuellement sur cet appareil
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase">Journal d'audit & Activité</h2>
          <span className="text-xs text-slate-400">30 derniers événements</span>
        </div>

        {logsLoading ? (
          <p className="text-xs text-slate-400 py-3">Chargement du journal…</p>
        ) : auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Aucune activité enregistrée pour le moment.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {log.action}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {log.table_name ? `sur ${log.table_name}` : ''}
                  </span>
                </div>
                <span className="text-slate-400 shrink-0">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
