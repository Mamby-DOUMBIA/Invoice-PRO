import { format, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatCurrency(
  amount: number,
  currency = 'XOF',
  locale = 'fr-ML'
): string {
  const decimals: Record<string, number> = { XOF: 0, GNF: 0, EUR: 2, USD: 2, GBP: 2 }
  const d = decimals[currency] ?? 2
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }).format(amount)
  } catch {
    return `${amount.toFixed(d)} ${currency}`
  }
}

export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function formatDate(date: string | Date | null | undefined, fmt = 'dd/MM/yyyy'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, fmt, { locale: fr })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
  return `Il y a ${Math.floor(diffDays / 365)} an(s)`
}
