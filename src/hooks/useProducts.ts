import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg } from './useAuth'
import type { Product, ProductInsert, ProductUpdate, ProductCategory } from '@/types/database'
import toast from 'react-hot-toast'

export function useProducts(search = '', categoryId?: string) {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['products', org?.id, search, categoryId],
    enabled: !!org?.id,
    queryFn: async () => {
      let q = supabase
        .from('products')
        .select('*, product_categories(name)')
        .eq('organization_id', org!.id)
        .order('name')
      if (search) q = q.ilike('name', `%${search}%`)
      if (categoryId) q = q.eq('category_id', categoryId)
      const { data, error } = await q
      if (error) throw error
      return data as (Product & { product_categories: { name: string } | null })[]
    },
  })
}

export function useProductCategories() {
  const org = useCurrentOrg()
  return useQuery({
    queryKey: ['product-categories', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('organization_id', org!.id)
        .order('name')
      if (error) throw error
      return data as ProductCategory[]
    },
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async (data: Omit<ProductInsert, 'organization_id'>) => {
      const { data: r, error } = await supabase
        .from('products')
        .insert({ ...data, organization_id: org!.id })
        .select().single()
      if (error) throw error
      return r as Product
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit créé') },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductUpdate }) => {
      const { data: r, error } = await supabase.from('products').update(data).eq('id', id).select().single()
      if (error) throw error
      return r as Product
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit modifié') },
    onError: () => toast.error('Erreur lors de la modification'),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit supprimé') },
    onError: () => toast.error('Impossible de supprimer ce produit'),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  const org = useCurrentOrg()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('product_categories')
        .insert({ organization_id: org!.id, name })
        .select().single()
      if (error) throw error
      return data as ProductCategory
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['product-categories'] }),
  })
}
