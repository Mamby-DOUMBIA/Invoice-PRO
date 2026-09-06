import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Organization, UserProfile, MemberRole } from '@/types/database'

const AUTH_TIMEOUT_MS = 5000

function withTimeout<T>(promise: Promise<T>, timeoutMs = AUTH_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Authentication request timed out')), timeoutMs)
    }),
  ])
}

export function useAuthInit() {
  const {
    setUser, setSession, setProfile,
    setOrganization, setRole,
    setLoading, setInitialized,
  } = useAuthStore()

  useEffect(() => {
    let mounted = true

    async function loadUserData(userId: string) {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (mounted && profile) setProfile(profile as UserProfile)
      } catch { /* ignore */ }

      try {
        const { data: member } = await supabase
          .from('organization_members')
          .select('role, organization_id')
          .eq('user_id', userId)
          .eq('accepted', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (mounted && member) {
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', member.organization_id)
            .single()

          if (mounted) {
            setOrganization((org as Organization) ?? null)
            setRole(member.role as MemberRole)
          }
        } else if (mounted) {
          setOrganization(null)
          setRole(null)
        }
      } catch {
        if (mounted) {
          setOrganization(null)
          setRole(null)
        }
      }
    }

    async function init() {
      setLoading(true)

      try {
        const { data: { session } } = await withTimeout(supabase.auth.getSession())
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await withTimeout(loadUserData(session.user.id))
        }
      } catch (e) {
        console.error('[auth] init error:', e)
        if (mounted) {
          setUser(null)
          setSession(null)
          setOrganization(null)
          setRole(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)   // ← ALWAYS mark as initialized
        }
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true)
          try {
            await withTimeout(loadUserData(session.user.id))
          } catch (e) {
            console.error('[auth] user data loading error:', e)
            setOrganization(null)
            setRole(null)
          } finally {
            setLoading(false)
          }
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setOrganization(null)
          setRole(null)
        }
      }
    )

    // Safety net: force-unblock after 8 seconds no matter what
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        const state = useAuthStore.getState()
        if (!state.initialized) {
          console.warn('[auth] Safety timeout — forcing initialized=true')
          setLoading(false)
          setInitialized(true)
        }
      }
    }, 8000)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(safetyTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function useCurrentOrg() {
  return useAuthStore(s => s.organization)
}

export function useCurrentUser() {
  return useAuthStore(s => s.user)
}

export function useCurrentRole() {
  return useAuthStore(s => s.role)
}

export function useCanEdit() {
  const role = useAuthStore(s => s.role)
  return role !== 'viewer'
}
