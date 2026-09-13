import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from './useAuth'
import type { Client, ClientInsert, ClientUpdate } from '@/types/database'
import toast from 'react-hot-toast'
import { invalidateDerivedData } from '@/utils/queryInvalidation'

export function useClients(search = '') {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['clients', org?.id, search],
    enabled: !!org?.id,
    queryFn: async () => {
      let q = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', org!.id)
        .order('name')
      if (search) q = q.ilike('name', `%${search}%`)
      const { data, error } = await q
      if (error) throw error
      return data as Client[]
    },
  })
}

export function useClientStats(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client-stats', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('total_ttc, amount_paid, status')
        .eq('client_id', clientId!)
        .neq('status', 'cancelled')
      if (error) throw error
      const total_invoiced = data.reduce((s, i) => s + (i.total_ttc ?? 0), 0)
      const total_paid = data.reduce((s, i) => s + (i.amount_paid ?? 0), 0)
      return {
        count: data.length,
        total_invoiced,
        total_paid,
        balance: total_invoiced - total_paid,
      }
    },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async (data: Omit<ClientInsert, 'organization_id'>) => {
      const { data: r, error } = await supabase
        .from('clients')
        .insert({ ...data, organization_id: org!.id })
        .select().single()
      if (error) throw error
      return r as Client
    },
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['clients'] }), invalidateDerivedData(qc)]); toast.success('Client créé') },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientUpdate }) => {
      const { data: r, error } = await supabase.from('clients').update(data).eq('id', id).select().single()
      if (error) throw error
      return r as Client
    },
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['clients'] }), invalidateDerivedData(qc)]); toast.success('Client modifié') },
    onError: () => toast.error('Erreur lors de la modification'),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['clients'] }), invalidateDerivedData(qc)]); toast.success('Client supprimé') },
    onError: () => toast.error('Impossible de supprimer ce client'),
  })
}

export function useClearAllClients() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async () => {
      if (!org?.id) throw new Error('Aucune organisation sélectionnée')
      const { error } = await supabase.from('clients').delete().eq('organization_id', org.id)
      if (error) throw error
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['clients'] }),
        qc.invalidateQueries({ queryKey: ['subscription-usage'] }),
        invalidateDerivedData(qc),
      ])
      toast.success('Tous les clients ont été supprimés')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.message || 'Impossible de vider la liste des clients. Certains clients sont peut-être liés à des factures.')
    },
  })
}

