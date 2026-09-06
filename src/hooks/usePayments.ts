import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from './useAuth'
import type { Payment, PaymentMethod, Receipt } from '@/types/database'
import toast from 'react-hot-toast'

/** Input type for creating a payment — no organization_id or created_by needed */
export interface PaymentInput {
  invoice_id: string
  amount: number
  method: PaymentMethod
  date: string
  reference?: string | null
  notes?: string | null
}

export function usePayments(invoiceId?: string) {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['payments', invoiceId ?? org?.id],
    enabled: !!(invoiceId || org?.id),
    queryFn: async () => {
      let q = supabase.from('payments').select('*').order('date', { ascending: false })
      if (invoiceId) q = q.eq('invoice_id', invoiceId)
      else q = q.eq('organization_id', org!.id)
      const { data, error } = await q
      if (error) throw error
      return data as Payment[]
    },
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async (data: PaymentInput) => {
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          organization_id: org!.id,
          invoice_id: data.invoice_id,
          amount: data.amount,
          method: data.method,
          date: data.date,
          reference: data.reference ?? null,
          notes: data.notes ?? null,
          created_by: null,
        })
        .select()
        .single()
      if (error) throw error

      // Auto-create receipt
      const { data: recNum } = await supabase.rpc('next_document_number', {
        p_org_id: org!.id,
        p_type: 'receipt',
      })
      await supabase.from('receipts').insert({
        organization_id: org!.id,
        invoice_id: data.invoice_id,
        payment_id: (payment as Payment).id,
        number: recNum as string,
        date: data.date,
        amount: data.amount,
        method: data.method,
        reference: data.reference ?? null,
        notes: data.notes ?? null,
        currency: org!.currency,
        created_by: null,
      })

      return payment as Payment
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['invoice', vars.invoice_id] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['receipts'] })
      toast.success('Paiement enregistré')
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  })
}

export function useReceipts() {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['receipts', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('*, clients(name), invoices(number)')
        .eq('organization_id', org!.id)
        .order('date', { ascending: false })
      if (error) throw error
      return data as (Receipt & {
        clients: { name: string } | null
        invoices: { number: string } | null
      })[]
    },
  })
}

export function useAllPayments() {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['all-payments', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, invoices(number, clients(name))')
        .eq('organization_id', org!.id)
        .order('date', { ascending: false })
        .limit(100)
      if (error) throw error
      return data ?? []
    },
  })
}
