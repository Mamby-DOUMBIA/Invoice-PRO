import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from './useAuth'
import type { Invoice, InvoiceInsert, InvoiceUpdate, InvoiceItem, InvoiceItemInsert } from '@/types/database'
import { calcDocumentTotals, applyRounding } from '@/utils/calc'
import { invalidateDerivedData } from '@/utils/queryInvalidation'
import toast from 'react-hot-toast'

export type InvoiceWithClient = Invoice & {
  clients: { name: string; company_name: string | null } | null
}

interface InvoiceFilters {
  status?: string
  clientId?: string
  search?: string
  page?: number
  perPage?: number
}

export function useInvoices(filters: InvoiceFilters = {}) {
  const org = useCurrentOrg()
  const { status, clientId, search, page = 1, perPage = 20 } = filters
  return useQuery({
    queryKey: ['invoices', org?.id, filters],
    enabled: !!org?.id,
    queryFn: async () => {
      let q = supabase
        .from('invoices')
        .select('*, clients(name, company_name)', { count: 'exact' })
        .eq('organization_id', org!.id)
        .order('date', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)
      if (status && status !== 'all') q = q.eq('status', status)
      if (clientId) q = q.eq('client_id', clientId)
      if (search) q = q.ilike('number', `%${search}%`)
      const { data, error, count } = await q
      if (error) throw error
      return { data: data as InvoiceWithClient[], total: count ?? 0 }
    },
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoice', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(*), invoice_items(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Invoice & { clients: unknown; invoice_items: InvoiceItem[] }
    },
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async ({
      invoice,
      items,
    }: {
      invoice: Omit<InvoiceInsert, 'organization_id' | 'number' | 'subtotal_ht' | 'total_discount' | 'total_tax' | 'total_ttc'>
      items: Omit<InvoiceItemInsert, 'invoice_id'>[]
    }) => {
      // Generate number atomically
      const { data: numData, error: numErr } = await supabase.rpc('next_document_number', {
        p_org_id: org!.id,
        p_type: 'invoice',
      })
      if (numErr) throw numErr

      // Calculate totals
      const totals = applyRounding(calcDocumentTotals(items), org!.currency)

      const { data: inv, error: invErr } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          organization_id: org!.id,
          number: numData as string,
          subtotal_ht: totals.subtotal_ht,
          total_discount: totals.total_discount,
          total_tax: totals.total_tax,
          total_ttc: totals.total_ttc,
          status: 'draft',
        })
        .select()
        .single()
      if (invErr) throw invErr

      // Compute per-line values and insert
      const lineItems = items.map((item, i) => {
        const { line_ht, line_tax, line_ttc } = calcLine(item)
        return { ...item, invoice_id: (inv as Invoice).id, line_ht, line_tax, line_ttc, position: i }
      })
      const { error: itemsErr } = await supabase.from('invoice_items').insert(lineItems)
      if (itemsErr) throw itemsErr

      return inv as Invoice
    },
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['invoices'] }), invalidateDerivedData(qc)]); toast.success('Facture créée') },
    onError: (e) => { console.error(e); toast.error('Erreur lors de la création') },
  })
}

function calcLine(item: { quantity: number; unit_price: number; discount_pct: number; discount_amt: number; tax_rate: number }) {
  const gross = item.quantity * item.unit_price
  const disc = gross * (item.discount_pct / 100) + item.discount_amt
  const line_ht = Math.round((gross - disc) * 100) / 100
  const line_tax = Math.round(line_ht * (item.tax_rate / 100) * 100) / 100
  const line_ttc = line_ht + line_tax
  return { line_ht, line_tax, line_ttc }
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data, items }: { id: string; data: InvoiceUpdate; items?: Omit<InvoiceItemInsert, 'invoice_id'>[] }) => {
      if (items) {
        const org_currency = data.currency ?? 'XOF'
        const totals = applyRounding(calcDocumentTotals(items), org_currency)
        await supabase.from('invoice_items').delete().eq('invoice_id', id)
        const lineItems = items.map((item, i) => {
          const { line_ht, line_tax, line_ttc } = calcLine(item)
          return { ...item, invoice_id: id, line_ht, line_tax, line_ttc, position: i }
        })
        await supabase.from('invoice_items').insert(lineItems)
        await supabase.from('invoices').update({
          ...data,
          subtotal_ht: totals.subtotal_ht,
          total_discount: totals.total_discount,
          total_tax: totals.total_tax,
          total_ttc: totals.total_ttc,
        }).eq('id', id)
      } else {
        await supabase.from('invoices').update(data).eq('id', id)
      }
    },
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['invoices'] }),
        qc.invalidateQueries({ queryKey: ['invoice', vars.id] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Facture mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['invoices'] }), invalidateDerivedData(qc)]); toast.success('Facture supprimée') },
    onError: () => toast.error('Erreur lors de la suppression'),
  })
}

export function useCancelInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('invoices').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: async (_, id) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['invoices'] }),
        qc.invalidateQueries({ queryKey: ['invoice', id] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Facture annulée')
    },
  })
}
