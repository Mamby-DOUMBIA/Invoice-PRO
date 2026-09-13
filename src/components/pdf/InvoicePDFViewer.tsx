import { lazy, Suspense, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Organization, Invoice, InvoiceItem } from '@/types/database'
import { Skeleton } from '@/components/ui/Skeleton'

// PDF renderer is HUGE — lazy load only when user clicks PDF button
const LazyPDFViewer   = lazy(() => import('@react-pdf/renderer').then(m => ({ default: m.PDFViewer })))
const LazyPDFDownload = lazy(() => import('@react-pdf/renderer').then(m => ({ default: m.PDFDownloadLink })))

// Templates also lazy
const LazyClassic   = lazy(() => import('./templates/InvoicePDFClassic').then(m => ({ default: m.InvoicePDFClassic })))
const LazyModern    = lazy(() => import('./templates/InvoicePDFModern').then(m => ({ default: m.InvoicePDFModern })))
const LazyMinimal   = lazy(() => import('./templates/InvoicePDFMinimal').then(m => ({ default: m.InvoicePDFMinimal })))
const LazyCorporate = lazy(() => import('./templates/InvoicePDFCorporate').then(m => ({ default: m.InvoicePDFCorporate })))

export interface InvoiceData {
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

interface Props {
  invoice: InvoiceData
  org: Organization
  documentTitle?: string
}

function getTemplateName(invoice: InvoiceData) {
  switch (invoice.template) {
    case 'modern':    return LazyModern
    case 'minimal':   return LazyMinimal
    case 'corporate': return LazyCorporate
    default:          return LazyClassic
  }
}

function PDFLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-400">Génération du PDF…</p>
    </div>
  )
}

export function InvoicePDFViewer({ invoice, org, documentTitle }: Props) {
  const [loaded, setLoaded] = useState(false)
  const filename = `${invoice.number}.pdf`
  const TemplateComp = getTemplateName(invoice)

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Download button */}
      <div className="flex justify-end gap-2">
        <Suspense fallback={<Button size="sm" loading>Télécharger</Button>}>
          <LazyPDFDownload
            document={
              <Suspense fallback={null}>
                <TemplateComp invoice={invoice} org={org} documentTitle={documentTitle} />
              </Suspense>
            }
            fileName={filename}
          >
            {({ loading }: { loading: boolean }) => (
              <Button size="sm" icon={<Download className="w-4 h-4" />} loading={loading}>
                Télécharger PDF
              </Button>
            )}
          </LazyPDFDownload>
        </Suspense>
      </div>

      {/* Preview */}
      <div className="flex-1 min-h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <Suspense fallback={<PDFLoader />}>
          <LazyPDFViewer width="100%" height="100%">
            <Suspense fallback={null}>
              <TemplateComp invoice={invoice} org={org} documentTitle={documentTitle} />
            </Suspense>
          </LazyPDFViewer>
        </Suspense>
      </div>
    </div>
  )
}
