import type { Organization } from '@/types/database'

export interface PDFProps {
  invoice: {
    number: string
    date: string
    due_date?: string | null
    expiry_date?: string | null
    expected_date?: string | null
    reference?: string | null
    payment_terms?: string | null
    notes?: string | null
    conditions?: string | null
    template?: string
    currency?: string
    subtotal_ht?: number
    total_discount?: number
    total_tax?: number
    total_ttc?: number
    amount_paid?: number
    amount_due?: number
    amount?: number
    status?: string
    method?: string
    invoice_items?: any[]
    quote_items?: any[]
    purchase_order_items?: any[]
    items?: any[]
    clients?: Record<string, any> | null
  }
  org: Organization
  documentTitle?: string
}

export function getDocumentTitle(doc: { number?: string }, customTitle?: string): string {
  if (customTitle) return customTitle
  const num = doc.number?.toUpperCase() ?? ''
  if (num.startsWith('DEV') || num.includes('QUOTE')) return 'DEVIS'
  if (num.startsWith('BC') || num.includes('ORDER')) return 'BON DE COMMANDE'
  if (num.startsWith('REC') || num.includes('RECU')) return 'REÇU DE PAIEMENT'
  return 'FACTURE'
}

export function formatAmt(amount: number | null | undefined, currency: string): string {
  const val = amount ?? 0
  const d = currency === 'XOF' || currency === 'GNF' ? 0 : 2
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(val) + ' ' + currency
}

export function fmtDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

