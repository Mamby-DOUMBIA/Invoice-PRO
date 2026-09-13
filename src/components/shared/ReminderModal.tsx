import { useState, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { MessageSquare, Mail, Copy, Check, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface InvoiceReminderProps {
  open: boolean
  onClose: () => void
  invoice: {
    id: string
    number: string
    date: string
    due_date?: string | null
    total_ttc: number
    amount_paid: number
    currency?: string
    clients?: {
      name: string
      company_name?: string | null
      phone?: string | null
      whatsapp?: string | null
      email?: string | null
    } | null
  }
}

type ReminderLevel = 'friendly' | 'standard' | 'firm'

export function ReminderModal({ open, onClose, invoice }: InvoiceReminderProps) {
  const org = useCurrentOrg()
  const [copied, setCopied] = useState(false)
  const [level, setLevel] = useState<ReminderLevel>('standard')

  const currency = invoice.currency ?? org?.currency ?? 'XOF'
  const amountDue = Math.max(0, invoice.total_ttc - (invoice.amount_paid ?? 0))
  const client = invoice.clients
  const clientPhone = (client?.whatsapp || client?.phone || '').replace(/[^0-9+]/g, '')
  const clientEmail = client?.email || ''

  // Calculation of overdue days
  const daysDiff = useMemo(() => {
    if (!invoice.due_date) return 0
    const due = new Date(invoice.due_date).getTime()
    const now = new Date().setHours(0, 0, 0, 0)
    return Math.floor((now - due) / (1000 * 60 * 60 * 24))
  }, [invoice.due_date])

  const messageText = useMemo(() => {
    const clientName = client?.name || 'Cher client'
    const orgName = org?.name || 'notre entreprise'
    const formattedAmount = formatCurrency(amountDue, currency)
    const formattedDueDate = invoice.due_date ? formatDate(invoice.due_date) : 'convenue'
    const bankDetails = org?.bank_name && org?.bank_account
      ? `\nCoordonnées de règlement :\nBanque : ${org.bank_name}\nCompte : ${org.bank_account}${org.bank_iban ? `\nIBAN : ${org.bank_iban}` : ''}`
      : ''

    if (level === 'friendly') {
      return `Bonjour ${clientName},\n\nSauf erreur de notre part, la facture N° ${invoice.number} d'un montant de ${formattedAmount} arrive à échéance le ${formattedDueDate}.\n\nNous vous remercions de bien vouloir procéder à son règlement selon vos disponibilités.${bankDetails}\n\nCordialement,\n${orgName}`
    } else if (level === 'firm') {
      return `URGENT — RAPPEL DE PAIEMENT\n\nÀ l'attention de ${clientName},\n\nMalgré nos précédentes relances, nous constatons que la facture N° ${invoice.number} datée du ${formatDate(invoice.date)} pour un montant restant dû de ${formattedAmount} (échue depuis le ${formattedDueDate}) demeure impayée.\n\nNous vous prions d'effectuer le règlement sous 48 heures afin d'éviter toute suspension de nos services.${bankDetails}\n\nService Comptabilité,\n${orgName}`
    } else {
      return `Bonjour ${clientName},\n\nNous nous permettons de vous contacter concernant la facture N° ${invoice.number} d'un montant de ${formattedAmount}, arrivée à échéance le ${formattedDueDate}.\n\nPourriez-vous nous confirmer l'état d'avancement de son règlement ? Si le virement vient d'être effectué, merci d'ignorer ce rappel.${bankDetails}\n\nBien cordialement,\n${orgName}`
    }
  }, [level, client, org, invoice, amountDue, currency])

  function handleCopy() {
    navigator.clipboard.writeText(messageText)
    setCopied(true)
    toast.success('Message copié dans le presse-papier')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    const encoded = encodeURIComponent(messageText)
    let url = `https://wa.me/?text=${encoded}`
    if (clientPhone) {
      const clean = clientPhone.startsWith('+') ? clientPhone.slice(1) : clientPhone
      url = `https://wa.me/${clean}?text=${encoded}`
    }
    window.open(url, '_blank')
  }

  function handleEmail() {
    const subject = encodeURIComponent(`Rappel : Facture ${invoice.number} — ${org?.name || 'InvoicePro'}`)
    const body = encodeURIComponent(messageText)
    const mailto = `mailto:${clientEmail}?subject=${subject}&body=${body}`
    window.open(mailto, '_blank')
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Relance de paiement — Facture {invoice.number}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Client : <strong>{client?.name ?? '—'}</strong> • Solde dû :{' '}
              <strong className="text-red-500 font-mono-nums">{formatCurrency(amountDue, currency)}</strong>
              {daysDiff > 0 ? (
                <span className="text-red-500 font-semibold ml-2">({daysDiff} jours de retard)</span>
              ) : (
                <span className="text-slate-400 ml-2">(Échéance proche)</span>
              )}
            </p>
          </div>
        </div>

        {/* Level selector */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
            Niveau de relance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'friendly', label: 'Amicale / Préventive', desc: 'Avant échéance' },
              { id: 'standard', label: 'Standard', desc: 'Retard modéré' },
              { id: 'firm', label: 'Ferme / Mise en demeure', desc: 'Retard important' },
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevel(lvl.id as ReminderLevel)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  level === lvl.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-sm font-semibold">{lvl.label}</div>
                <div className="text-xs opacity-75 mt-0.5">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Message preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Aperçu du message personnalisé
            </label>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <textarea
            value={messageText}
            readOnly
            rows={8}
            className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose} size="sm">
            Fermer
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Mail className="w-4 h-4" />}
              onClick={handleEmail}
            >
              Envoyer par Email
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={handleWhatsApp}
            >
              Envoyer sur WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
