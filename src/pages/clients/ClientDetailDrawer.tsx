import { X, Pencil, Phone, Mail, MapPin, Building2, FileText, DollarSign } from 'lucide-react'
import { useClientStats } from '@/hooks/useClients'
import { formatCurrency } from '@/utils/format'
import type { Client } from '@/types/database'
import { cn } from '@/utils/cn'

interface Props {
  client: Client
  currency: string
  onClose: () => void
  onEdit: () => void
}

export function ClientDetailDrawer({ client, currency, onClose, onEdit }: Props) {
  const { data: stats } = useClientStats(client.id)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">{client.name}</h2>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Facturé" value={formatCurrency(stats.total_invoiced, currency)} color="blue" />
              <StatBox label="Payé" value={formatCurrency(stats.total_paid, currency)} color="green" />
              <StatBox label="Solde" value={formatCurrency(stats.balance, currency)} color={stats.balance > 0 ? 'orange' : 'green'} />
            </div>
          )}

          {/* Info */}
          <div className="space-y-3">
            {client.company_name && (
              <Row icon={<Building2 className="w-4 h-4" />} value={client.company_name} />
            )}
            {client.phone && (
              <Row icon={<Phone className="w-4 h-4" />} value={client.phone} href={`tel:${client.phone}`} />
            )}
            {client.email && (
              <Row icon={<Mail className="w-4 h-4" />} value={client.email} href={`mailto:${client.email}`} />
            )}
            {(client.address || client.city) && (
              <Row icon={<MapPin className="w-4 h-4" />} value={[client.address, client.city, client.country].filter(Boolean).join(', ')} />
            )}
            {client.nif && (
              <Row icon={<FileText className="w-4 h-4" />} value={`NIF: ${client.nif}`} />
            )}
          </div>

          {client.notes && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Notes</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{client.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ icon, value, href }: { icon: React.ReactNode; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      {href ? (
        <a href={href} className="text-blue-600 hover:underline truncate">{value}</a>
      ) : (
        <span className="text-slate-700 dark:text-slate-300">{value}</span>
      )}
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: 'blue' | 'green' | 'orange' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  }
  return (
    <div className={cn('rounded-xl p-3 text-center', colors[color])}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-sm font-bold font-mono-nums mt-0.5">{value}</p>
    </div>
  )
}
