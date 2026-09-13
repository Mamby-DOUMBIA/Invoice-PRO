import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from './useAuth'
import type { SubscriptionPlan } from '@/types/database'
import toast from 'react-hot-toast'

export interface PlanLimits {
  name: SubscriptionPlan
  label: string
  price_monthly: number
  max_invoices: number // -1 means unlimited
  max_clients: number
  max_products: number
  max_users: number
  max_templates: number
  has_statistics: boolean
  has_export: boolean
  has_custom_branding: boolean
}

export interface UsageStats {
  invoicesCount: number
  clientsCount: number
  productsCount: number
  usersCount: number
  currentPlan: SubscriptionPlan
  planDetails: PlanLimits | null
}

const DEFAULT_PLANS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    name: 'free',
    label: 'Gratuit',
    price_monthly: 0,
    max_invoices: 10,
    max_clients: 5,
    max_products: 10,
    max_users: 1,
    max_templates: 1,
    has_statistics: false,
    has_export: false,
    has_custom_branding: false,
  },
  starter: {
    name: 'starter',
    label: 'Starter',
    price_monthly: 5000,
    max_invoices: 100,
    max_clients: 50,
    max_products: 100,
    max_users: 3,
    max_templates: 2,
    has_statistics: true,
    has_export: true,
    has_custom_branding: false,
  },
  pro: {
    name: 'pro',
    label: 'Pro',
    price_monthly: 15000,
    max_invoices: -1,
    max_clients: -1,
    max_products: -1,
    max_users: 10,
    max_templates: 4,
    has_statistics: true,
    has_export: true,
    has_custom_branding: true,
  },
  business: {
    name: 'business',
    label: 'Business',
    price_monthly: 30000,
    max_invoices: -1,
    max_clients: -1,
    max_products: -1,
    max_users: -1,
    max_templates: 4,
    has_statistics: true,
    has_export: true,
    has_custom_branding: true,
  },
}

export function useSubscription() {
  const org = useCurrentOrg()
  const queryClient = useQueryClient()

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', org!.id)
        .maybeSingle()
      if (error) {
        console.warn('Subscription fetch error:', error)
        return null
      }
      return data
    },
  })

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['subscription-usage', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      // 1. Count invoices this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { count: invoicesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org!.id)
        .gte('created_at', startOfMonth)

      // 2. Count clients
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org!.id)

      // 3. Count products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org!.id)

      // 4. Count members
      const { count: usersCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org!.id)

      const planName = (subscription?.plan as SubscriptionPlan) || 'free'
      const planDetails = DEFAULT_PLANS[planName] || DEFAULT_PLANS.free

      return {
        invoicesCount: invoicesCount ?? 0,
        clientsCount: clientsCount ?? 0,
        productsCount: productsCount ?? 0,
        usersCount: usersCount ?? 1,
        currentPlan: planName,
        planDetails,
      } as UsageStats
    },
  })

  const upgradePlan = useMutation({
    mutationFn: async ({ plan, paymentMethod, reference }: { plan: SubscriptionPlan; paymentMethod: string; reference?: string }) => {
      if (!org?.id) throw new Error('Organisation requise')

      const now = new Date()
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          organization_id: org.id,
          plan,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: nextMonth.toISOString(),
          stripe_subscription_id: reference ? `${paymentMethod}_${reference}` : null,
          updated_at: now.toISOString(),
        }, { onConflict: 'organization_id' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['subscription', org?.id] }),
        queryClient.invalidateQueries({ queryKey: ['subscription-usage', org?.id] }),
      ])
      toast.success('Votre abonnement a été activé avec succès !')
    },
    onError: () => {
      toast.error('Impossible de modifier l\'abonnement')
    },
  })

  return {
    subscription,
    usage,
    plans: DEFAULT_PLANS,
    upgradePlan,
    isLoading: subLoading || usageLoading,
  }
}
