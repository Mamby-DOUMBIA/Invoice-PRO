import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from './useAuth'
import type { Quote, QuoteInsert, QuoteItem, QuoteItemInsert } from '@/types/database'
import { calcDocumentTotals, applyRounding } from '@/utils/calc'
import { invalidateDerivedData } from '@/utils/queryInvalidation'
import toast from 'react-hot-toast'

function calcLine(item: { quantity: number; unit_price: number; discount_pct: number; discount_amt: number; tax_rate: number }) {
  const gross = item.quantity * item.unit_price
  const disc = gross * (item.discount_pct / 100) + item.discount_amt
  const line_ht = Math.round((gross - disc) * 100) / 100
  const line_tax = Math.round(line_ht * (item.tax_rate / 100) * 100) / 100
  return { line_ht, line_tax, line_ttc: line_ht + line_tax }
}

export type QuoteWithClient = Quote & {
  clients: { name: string; company_name: string | null } | null
}

export function useQuotes(filters: { status?: string; search?: string; page?: number } = {}) {
  const org = useCurrentOrg()
  const { status, search, page = 1 } = filters
  return useQuery({
    queryKey: ['quotes', org?.id, filters],
    enabled: !!org?.id,
    queryFn: async () => {
      let q = supabase
        .from('quotes')
        .select('*, clients(name, company_name)', { count: 'exact' })
        .eq('organization_id', org!.id)
        .order('date', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)
      if (status && status !== 'all') q = q.eq('status', status)
      if (search) q = q.ilike('number', `%${search}%`)
      const { data, error, count } = await q
      if (error) throw error
      return { data: data as QuoteWithClient[], total: count ?? 0 }
    },
  })
}

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: ['quote', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, clients(*), quote_items(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Quote & { clients: unknown; quote_items: QuoteItem[] }
    },
  })
}

export function useCreateQuote() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async ({ quote, items }: { quote: any; items: any[] }) => {
      const { data: numData } = await supabase.rpc('next_document_number', { p_org_id: org!.id, p_type: 'quote' })
      const totals = applyRounding(calcDocumentTotals(items), org!.currency)
      const { data: q, error } = await supabase
        .from('quotes')
        .insert({ ...quote, organization_id: org!.id, number: numData as string, ...totals, status: 'draft' })
        .select().single()
      if (error) throw error
      const lineItems = items.map((item, i) => {
        const { line_ht, line_tax, line_ttc } = calcLine(item)
        return { ...item, quote_id: (q as Quote).id, line_ht, line_tax, line_ttc, position: i }
      })
      await supabase.from('quote_items').insert(lineItems)
      return q as Quote
    },
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['quotes'] }), invalidateDerivedData(qc)]); toast.success('Devis créé') },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from('quotes').update({ status }).eq('id', id)
    },
    onSuccess: async (_, v) => { await Promise.all([qc.invalidateQueries({ queryKey: ['quotes'] }), qc.invalidateQueries({ queryKey: ['quote', v.id] }), invalidateDerivedData(qc)]); toast.success('Statut mis à jour') },
  })
}

export function useConvertQuoteToInvoice() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async (quoteId: string) => {
      // Fetch quote + items
      const { data: quote } = await supabase.from('quotes').select('*, quote_items(*)').eq('id', quoteId).single()
      if (!quote) throw new Error('Devis introuvable')

      const { data: invNum } = await supabase.rpc('next_document_number', { p_org_id: org!.id, p_type: 'invoice' })
      const q = quote as Quote & { quote_items: QuoteItem[] }

      const { data: inv, error } = await supabase
        .from('invoices')
        .insert({
          organization_id: org!.id,
          client_id: q.client_id,
          quote_id: q.id,
          number: invNum as string,
          date: new Date().toISOString().split('T')[0],
          status: 'draft',
          subtotal_ht: q.subtotal_ht,
          total_discount: q.total_discount,
          total_tax: q.total_tax,
          total_ttc: q.total_ttc,
          amount_paid: 0,
          currency: q.currency,
          notes: q.notes,
          conditions: q.conditions,
          template: q.template,
        })
        .select().single()
      if (error) throw error

      const lineItems = q.quote_items.map((item, i) => ({
        invoice_id: (inv as { id: string }).id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        discount_pct: item.discount_pct,
        discount_amt: item.discount_amt,
        tax_rate: item.tax_rate,
        line_ht: item.line_ht,
        line_tax: item.line_tax,
        line_ttc: item.line_ttc,
        position: i,
      }))
      await supabase.from('invoice_items').insert(lineItems)
      await supabase.from('quotes').update({ status: 'converted', converted_to_invoice_id: (inv as { id: string }).id }).eq('id', quoteId)

      return inv as { id: string }
    },
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['quotes'] }), qc.invalidateQueries({ queryKey: ['invoices'] }), invalidateDerivedData(qc)]); toast.success('Devis converti en facture !') },
    onError: () => toast.error('Erreur lors de la conversion'),
  })
}

export function useUpdateQuote() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async ({ id, quote, items }: { id: string; quote: any; items: any[] }) => {
      const totals = applyRounding(calcDocumentTotals(items), org?.currency ?? 'XOF')
      const { data: q, error } = await supabase
        .from('quotes')
        .update({ ...quote, ...totals })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      await supabase.from('quote_items').delete().eq('quote_id', id)
      const lineItems = items.map((item, i) => {
        const { line_ht, line_tax, line_ttc } = calcLine(item)
        return { ...item, quote_id: id, line_ht, line_tax, line_ttc, position: i }
      })
      await supabase.from('quote_items').insert(lineItems)
      return q as Quote
    },
    onSuccess: async (_, v) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['quotes'] }),
        qc.invalidateQueries({ queryKey: ['quote', v.id] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Devis mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useDeleteQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { await supabase.from('quotes').delete().eq('id', id) },
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['quotes'] }), invalidateDerivedData(qc)]); toast.success('Devis supprimé') },
  })
}

