import { useState } from 'react'
import { Package, Search, Plus, Pencil, Trash2, Download, Upload } from 'lucide-react'
import { useProducts, useProductCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { ProductForm } from './ProductForm'
import { ImportModal } from '@/components/shared/ImportModal'
import { exportProductsToCSV } from '@/utils/export'
import type { Product } from '@/types/database'
import { formatCurrency } from '@/utils/format'
import { useCurrentOrg } from '@/hooks/useAuth'

export function ProductsPage() {
  const org = useCurrentOrg()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const { data: products = [], isLoading } = useProducts(search, categoryFilter || undefined)
  const { data: categories = [] } = useProductCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const currency = org?.currency ?? 'XOF'

  const columns = [
    {
      key: 'name',
      header: 'Produit / Service',
      render: (p: Product) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{p.name}</p>
          {p.sku && <p className="text-xs text-slate-400">Réf: {p.sku}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (p: Product) => (
        <Badge variant={p.type === 'service' ? 'info' : 'default'}>
          {p.type === 'service' ? 'Service' : 'Produit'}
        </Badge>
      ),
    },
    { key: 'unit', header: 'Unité', render: (p: Product) => <span className="text-sm">{p.unit}</span> },
    {
      key: 'price_ht',
      header: 'Prix HT',
      align: 'right' as const,
      render: (p: Product) => <span className="font-mono-nums">{formatCurrency(p.price_ht, currency)}</span>,
    },
    {
      key: 'tax_rate',
      header: 'TVA',
      align: 'right' as const,
      render: (p: Product) => <span>{p.tax_rate}%</span>,
    },
    {
      key: 'price_ttc',
      header: 'Prix TTC',
      align: 'right' as const,
      render: (p: Product) => <span className="font-mono-nums font-semibold">{formatCurrency(p.price_ttc, currency)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (p: Product) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); setEditing(p); setShowForm(true) }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleting(p) }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Produits & Services</h1>
          <p className="text-sm text-slate-400 mt-0.5">{products.length} article{products.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportProductsToCSV(products)}
            >
              Exporter CSV
            </Button>
          )}
          <Button
            variant="secondary"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setShowImport(true)}
          >
            Importer CSV
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditing(null); setShowForm(true) }}>
            Nouveau produit
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
        <Select
          options={[{ value: '', label: 'Toutes catégories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="w-44"
        />
      </div>

      {products.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="Aucun produit"
          description="Ajoutez vos produits et services pour les utiliser dans vos documents."
          action={{ label: 'Nouveau produit', onClick: () => setShowForm(true) }}
        />
      ) : (
        <Table columns={columns} data={products} loading={isLoading} />
      )}

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        title={editing ? 'Modifier le produit' : 'Nouveau produit / service'}
        size="lg"
      >
        <ProductForm
          initial={editing}
          categories={categories}
          currency={currency}
          onSave={async (data) => {
            if (editing) await updateProduct.mutateAsync({ id: editing.id, data: data as import('@/types/database').ProductUpdate })
            else await createProduct.mutateAsync(data as import('@/types/database').ProductInsert)
            setShowForm(false); setEditing(null)
          }}
          onCancel={() => { setShowForm(false); setEditing(null) }}
          saving={createProduct.isPending || updateProduct.isPending}
        />
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await deleteProduct.mutateAsync(deleting.id); setDeleting(null) } }}
        title="Supprimer le produit"
        message={`Supprimer "${deleting?.name}" ?`}
        loading={deleteProduct.isPending}
      />

      {/* CSV Import Modal */}
      {showImport && (
        <ImportModal
          open={showImport}
          onClose={() => setShowImport(false)}
          type="products"
          onImport={async (items) => {
            if (!org) return
            const rows = items.map(p => ({
              ...p,
              organization_id: org.id,
            }))
            const { error } = await supabase.from('products').insert(rows)
            if (error) throw error
            await queryClient.invalidateQueries({ queryKey: ['products'] })
          }}
        />
      )}
    </div>
  )
}
