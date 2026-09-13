import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Check, ShieldCheck, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react'
import { useSubscription, type PlanLimits } from '@/hooks/useSubscription'
import type { SubscriptionPlan } from '@/types/database'
import { formatCurrency } from '@/utils/format'
import toast from 'react-hot-toast'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  targetPlan?: SubscriptionPlan
}

const PAYMENT_METHODS = [
  { id: 'orange_money', name: 'Orange Money', icon: Smartphone, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200' },
  { id: 'wave', name: 'Wave', icon: Smartphone, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
  { id: 'moov_money', name: 'Moov Money', icon: Smartphone, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
  { id: 'card', name: 'Carte Bancaire', icon: CreditCard, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200' },
]

export function UpgradePlanModal({ open, onClose, targetPlan = 'starter' }: UpgradeModalProps) {
  const { plans, upgradePlan } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(targetPlan)
  const [paymentMethod, setPaymentMethod] = useState('orange_money')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [step, setStep] = useState<'plan' | 'payment' | 'confirmation'>('plan')

  const planInfo: PlanLimits = plans[selectedPlan] || plans.starter

  async function handleConfirmPayment() {
    if (paymentMethod !== 'card' && !phoneNumber) {
      toast.error('Veuillez renseigner votre numéro de téléphone.')
      return
    }

    try {
      await upgradePlan.mutateAsync({
        plan: selectedPlan,
        paymentMethod,
        reference: phoneNumber || `TX-${Date.now().toString().slice(-6)}`,
      })
      setStep('confirmation')
    } catch (e) {
      // handled in hook
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Step 1: Choose Plan */}
        {step === 'plan' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choisissez votre formule InvoicePro</h2>
              <p className="text-xs text-slate-400 mt-1">
                Débloquez les fonctionnalités avancées, les exports et le multi-utilisateurs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['starter', 'pro', 'business'] as SubscriptionPlan[]).map(key => {
                const p = plans[key]
                const isSelected = selectedPlan === key
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white capitalize">{p.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="text-xl font-extrabold text-blue-600 font-mono-nums mt-2">
                      {formatCurrency(p.price_monthly, 'XOF')}
                      <span className="text-xs font-normal text-slate-400">/mois</span>
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <li className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        {p.max_invoices === -1 ? 'Factures illimitées' : `${p.max_invoices} factures/mois`}
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        {p.max_clients === -1 ? 'Clients illimités' : `${p.max_clients} clients`}
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        {p.max_users === -1 ? 'Équipe illimitée' : `Jusqu'à ${p.max_users} collaborateurs`}
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Exports & Statistiques
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={onClose} size="sm">
                Annuler
              </Button>
              <Button type="button" onClick={() => setStep('payment')} size="sm">
                Continuer vers le paiement ({formatCurrency(planInfo.price_monthly, 'XOF')})
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Provider */}
        {step === 'payment' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Règlement de l'abonnement</h2>
              <p className="text-xs text-slate-400 mt-1">
                Formule sélectionnée : <strong>Plan {planInfo.label}</strong> • Montant :{' '}
                <strong className="text-blue-600 font-mono-nums">{formatCurrency(planInfo.price_monthly, 'XOF')}/mois</strong>
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                Sélectionnez votre moyen de paiement
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => {
                  const Icon = m.icon
                  const isSelected = paymentMethod === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600 font-medium'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{m.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {paymentMethod !== 'card' ? (
              <div className="space-y-2">
                <Input
                  label="Numéro de téléphone Mobile Money"
                  placeholder="Ex: +223 70 00 00 00"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-400">
                  Une invite de validation de débit vous sera envoyée sur votre téléphone.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Paiement sécurisé par carte bancaire (Stripe)
                </div>
                <Input label="Numéro de carte" placeholder="4242 •••• •••• 4242" value="•••• •••• •••• 4242" readOnly />
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setStep('plan')} size="sm">
                Retour
              </Button>
              <Button
                type="button"
                loading={upgradePlan.isPending}
                onClick={handleConfirmPayment}
                size="sm"
              >
                Confirmer et activer ({formatCurrency(planInfo.price_monthly, 'XOF')})
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmation' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Abonnement activé !</h2>
              <p className="text-sm text-slate-500 mt-1">
                Félicitations, votre compte bénéficie désormais des avantages du <strong>Plan {planInfo.label}</strong>.
              </p>
            </div>
            <Button onClick={onClose} size="sm">
              Terminer
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
