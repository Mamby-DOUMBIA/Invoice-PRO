import type { Organization, Invoice, InvoiceItem } from '@/types/database'

export interface PDFProps {
  invoice: Invoice & {
    invoice_items?: InvoiceItem[]
    clients?: Record<string, string> | null
  }
  org: Organization
}

export function formatAmt(amount: number, currency: string): string {
  const d = currency === 'XOF' || currency === 'GNF' ? 0 : 2
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(amount) + ' ' + currency
}

export function fmtDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}
