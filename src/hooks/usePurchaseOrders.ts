import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from './useAuth'
import type { PurchaseOrder, PurchaseOrderItem } from '@/types/database'
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

export type PurchaseOrderWithClient = PurchaseOrder & {
  clients: { name: string; company_name: string | null } | null
}

export function usePurchaseOrders(filters: { status?: string; search?: string; page?: number } = {}) {
  const org = useCurrentOrg()
  const { status, search, page = 1 } = filters
  return useQuery({
    queryKey: ['purchase-orders', org?.id, filters],
    enabled: !!org?.id,
    queryFn: async () => {
      let q = supabase
        .from('purchase_orders')
        .select('*, clients(name, company_name)', { count: 'exact' })
        .eq('organization_id', org!.id)
        .order('date', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)
      if (status && status !== 'all') q = q.eq('status', status)
      if (search) q = q.ilike('number', `%${search}%`)
      const { data, error, count } = await q
      if (error) throw error
      return { data: data as PurchaseOrderWithClient[], total: count ?? 0 }
    },
  })
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['purchase-order', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, clients(*), purchase_order_items(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as PurchaseOrder & { clients: unknown; purchase_order_items: PurchaseOrderItem[] }
    },
  })
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async ({ order, items }: { order: any; items: any[] }) => {
      let docNumber = `BC-${Date.now().toString().slice(-6)}`
      try {
        const { data: numData } = await supabase.rpc('next_document_number', { p_org_id: org!.id, p_type: 'purchase_order' })
        if (numData) docNumber = numData as string
      } catch (e) {
        console.warn('Fallback number for PO:', e)
      }

      const totals = applyRounding(calcDocumentTotals(items), org?.currency ?? 'XOF')
      const { data: po, error } = await supabase
        .from('purchase_orders')
        .insert({
          ...order,
          organization_id: org!.id,
          number: docNumber,
          ...totals,
          status: 'draft',
        })
        .select()
        .single()
      if (error) throw error

      if (items.length > 0) {
        const lineItems = items.map((item, i) => {
          const { line_ht, line_tax, line_ttc } = calcLine(item)
          return { ...item, po_id: po.id, line_ht, line_tax, line_ttc, position: i }
        })
        await supabase.from('purchase_order_items').insert(lineItems)
      }

      return po as PurchaseOrder
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Bon de commande créé')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdatePurchaseOrder() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async ({ id, order, items }: { id: string; order: any; items: any[] }) => {
      const totals = applyRounding(calcDocumentTotals(items), org?.currency ?? 'XOF')
      const { data: po, error } = await supabase
        .from('purchase_orders')
        .update({ ...order, ...totals })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      await supabase.from('purchase_order_items').delete().eq('po_id', id)
      if (items.length > 0) {
        const lineItems = items.map((item, i) => {
          const { line_ht, line_tax, line_ttc } = calcLine(item)
          return { ...item, po_id: id, line_ht, line_tax, line_ttc, position: i }
        })
        await supabase.from('purchase_order_items').insert(lineItems)
      }

      return po as PurchaseOrder
    },
    onSuccess: async (_, v) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
        qc.invalidateQueries({ queryKey: ['purchase-order', v.id] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Bon de commande mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useUpdatePOStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from('purchase_orders').update({ status }).eq('id', id)
    },
    onSuccess: async (_, v) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
        qc.invalidateQueries({ queryKey: ['purchase-order', v.id] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Statut mis à jour')
    },
  })
}

export function useConvertPOToInvoice() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async (poId: string) => {
      const { data: po } = await supabase.from('purchase_orders').select('*, purchase_order_items(*)').eq('id', poId).single()
      if (!po) throw new Error('Bon de commande introuvable')

      const { data: invNum } = await supabase.rpc('next_document_number', { p_org_id: org!.id, p_type: 'invoice' })
      const order = po as PurchaseOrder & { purchase_order_items: PurchaseOrderItem[] }

      const { data: inv, error } = await supabase
        .from('invoices')
        .insert({
          organization_id: org!.id,
          client_id: order.client_id,
          number: invNum as string,
          date: new Date().toISOString().split('T')[0],
          status: 'draft',
          subtotal_ht: order.subtotal_ht,
          total_discount: order.total_discount,
          total_tax: order.total_tax,
          total_ttc: order.total_ttc,
          amount_paid: 0,
          currency: order.currency,
          notes: order.notes,
          template: order.template,
        })
        .select().single()
      if (error) throw error

      if (order.purchase_order_items?.length > 0) {
        const lineItems = order.purchase_order_items.map((item, i) => ({
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
      }

      await supabase.from('purchase_orders').update({
        status: 'converted',
        converted_to_invoice_id: (inv as { id: string }).id,
      }).eq('id', poId)

      return inv as { id: string }
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
        qc.invalidateQueries({ queryKey: ['invoices'] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Bon de commande converti en facture !')
    },
    onError: () => toast.error('Erreur lors de la conversion'),
  })
}

export function useDeletePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('purchase_orders').delete().eq('id', id)
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Bon de commande supprimé')
    },
  })
}
