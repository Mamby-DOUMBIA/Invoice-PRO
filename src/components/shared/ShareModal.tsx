import { Modal } from '@/components/ui/Modal'
import { MessageCircle, Mail, Download, Copy, Printer, Share2 } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import toast from 'react-hot-toast'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  documentType: string
  documentNumber: string
  clientName: string
  amount: number
  currency: string
  invoiceId?: string
}

export function ShareModal({ open, onClose, documentType, documentNumber, clientName, amount, currency }: ShareModalProps) {
  const message = `Bonjour ${clientName},\n\nVeuillez trouver votre ${documentType} *${documentNumber}* d'un montant de *${formatCurrency(amount, currency)}*.\n\nMerci pour votre confiance.`
  const encodedMessage = encodeURIComponent(message)

  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
  const telegramUrl = `https://t.me/share/url?text=${encodedMessage}`
  const emailSubject = encodeURIComponent(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${documentNumber}`)
  const emailBody = encodeURIComponent(message)
  const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`

  function copyMessage() {
    navigator.clipboard.writeText(message)
    toast.success('Message copié !')
  }

  function print() {
    window.print()
  }

  const actions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: 'WhatsApp',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => window.open(whatsappUrl, '_blank'),
    },
    {
      icon: <Mail className="w-6 h-6" />,
      label: 'Email',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => window.open(emailUrl),
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      label: 'Telegram',
      color: 'bg-sky-500 hover:bg-sky-600',
      onClick: () => window.open(telegramUrl, '_blank'),
    },
    {
      icon: <Copy className="w-6 h-6" />,
      label: 'Copier',
      color: 'bg-slate-500 hover:bg-slate-600',
      onClick: copyMessage,
    },
    {
      icon: <Printer className="w-6 h-6" />,
      label: 'Imprimer',
      color: 'bg-slate-600 hover:bg-slate-700',
      onClick: print,
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title={`Partager — ${documentNumber}`} size="sm">
      <div className="space-y-5">
        {/* Message preview */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Message pré-rempli</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-colors ${action.color}`}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
