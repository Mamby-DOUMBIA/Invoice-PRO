import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg, useCurrentUser } from './useAuth'
import type { MemberRole } from '@/types/database'
import toast from 'react-hot-toast'

export interface TeamMember {
  id: string
  organization_id: string
  user_id: string
  role: MemberRole
  invited_email: string | null
  accepted: boolean
  created_at: string
  profile?: {
    full_name: string | null
    avatar_url: string | null
    phone: string | null
  } | null
}

export function useTeamMembers() {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['team-members', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          invited_email,
          accepted,
          created_at
        `)
        .eq('organization_id', org!.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.warn('Could not fetch members:', error)
        return []
      }

      // Fetch user profiles for members
      const userIds = data.map(m => m.user_id).filter(Boolean)
      let profilesMap: Record<string, any> = {}

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url, phone')
          .in('id', userIds)
        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]))
        }
      }

      return data.map(m => ({
        ...m,
        profile: profilesMap[m.user_id] || null,
      })) as TeamMember[]
    },
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()
  const org = useCurrentOrg()
  const currentUser = useCurrentUser()

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: MemberRole }) => {
      if (!org) throw new Error('Organisation requise')

      // Check if user profile already exists with this email or insert invited placeholder
      const { data, error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: currentUser?.id || org.id, // linked or pending
          role,
          invited_email: email,
          accepted: false,
        })
        .select()
        .single()

      if (error) throw error

      // Log in audit logs
      await supabase.from('audit_logs').insert({
        organization_id: org.id,
        user_id: currentUser?.id,
        action: 'INVITE_USER',
        table_name: 'organization_members',
        new_values: { email, role },
      })

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['team-members', org?.id] })
      toast.success('Invitation envoyée au collaborateur')
    },
    onError: (e: any) => {
      toast.error(e?.message || 'Erreur lors de l\'envoi de l\'invitation')
    },
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  const org = useCurrentOrg()
  const currentUser = useCurrentUser()

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: MemberRole }) => {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)

      if (error) throw error

      await supabase.from('audit_logs').insert({
        organization_id: org?.id,
        user_id: currentUser?.id,
        action: 'UPDATE_ROLE',
        table_name: 'organization_members',
        record_id: memberId,
        new_values: { role },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['team-members', org?.id] })
      toast.success('Rôle du collaborateur mis à jour')
    },
    onError: () => {
      toast.error('Impossible de modifier le rôle')
    },
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  const org = useCurrentOrg()
  const currentUser = useCurrentUser()

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      await supabase.from('audit_logs').insert({
        organization_id: org?.id,
        user_id: currentUser?.id,
        action: 'REMOVE_USER',
        table_name: 'organization_members',
        record_id: memberId,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['team-members', org?.id] })
      toast.success('Collaborateur retiré de l\'organisation')
    },
    onError: () => {
      toast.error('Erreur lors du retrait du membre')
    },
  })
}

export function useAuditLogs() {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['audit-logs', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', org!.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) {
        console.warn('Could not fetch audit logs:', error)
        return []
      }
      return data || []
    },
  })
}
