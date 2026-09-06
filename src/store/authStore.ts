import { create } from 'zustand'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { Organization, UserProfile, MemberRole } from '@/types/database'

export interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  organization: Organization | null
  role: MemberRole | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: UserProfile | null) => void
  setOrganization: (org: Organization | null) => void
  setRole: (role: MemberRole | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (v: boolean) => void
  reset: () => void
}

export const useAuthStore: UseBoundStore<StoreApi<AuthState>> = create<AuthState>()((set) => ({
  user: null,
  session: null,
  profile: null,
  organization: null,
  role: null,
  loading: false,      // false until AuthProvider mounts
  initialized: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setOrganization: (organization) => set({ organization }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set({
    user: null, session: null, profile: null,
    organization: null, role: null, loading: false,
  }),
}))
