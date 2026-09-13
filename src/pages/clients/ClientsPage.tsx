import { useState } from 'react'
import { Users, Search, Plus, Pencil, Trash2, Eye, Download, Upload } from 'lucide-react'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { ClientForm } from './ClientForm'
import { ImportModal } from '@/components/shared/ImportModal'
import { exportClientsToCSV } from '@/utils/export'
import type { Client } from '@/types/database'
import { useCurrentOrg } from '@/hooks/useAuth'
import { ClientDetailDrawer } from './ClientDetailDrawer'

export function ClientsPage() {
  const org = useCurrentOrg()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState<Client | null>(null)
  const [viewing, setViewing] = useState<Client | null>(null)

  const { data: clients = [], isLoading } = useClients(search)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  const currency = org?.currency ?? 'XOF'

  const columns = [
    {
      key: 'name',
      header: 'Client',
      render: (c: Client) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
          {c.company_name && <p className="text-xs text-slate-400">{c.company_name}</p>}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (c: Client) => (
        <div className="text-sm">
          {c.phone && <p>{c.phone}</p>}
          {c.email && <p className="text-slate-400">{c.email}</p>}
        </div>
      ),
    },
    { key: 'city', header: 'Ville', render: (c: Client) => <span>{c.city ?? '—'}</span> },
    {
      key: 'is_active',
      header: 'Statut',
      render: (c: Client) => (
        <Badge variant={c.is_active ? 'success' : 'default'}>
          {c.is_active ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (c: Client) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); setViewing(c) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setEditing(c); setShowForm(true) }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleting(c) }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clients</h1>
          <p className="text-sm text-slate-400 mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {clients.length > 0 && (
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportClientsToCSV(clients)}
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
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Rechercher un client..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
      />

      {/* Table */}
      {clients.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="Aucun client"
          description="Ajoutez votre premier client pour commencer."
          action={{ label: 'Nouveau client', onClick: () => setShowForm(true) }}
        />
      ) : (
        <Table
          columns={columns}
          data={clients}
          loading={isLoading}
          onRowClick={setViewing}
        />
      )}

      {/* Form modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        title={editing ? 'Modifier le client' : 'Nouveau client'}
        size="lg"
      >
        <ClientForm
          initial={editing}
          onSave={async (data) => {
            if (editing) {
              await updateClient.mutateAsync({ id: editing.id, data: data as import('@/types/database').ClientUpdate })
            } else {
              await createClient.mutateAsync(data as import('@/types/database').ClientInsert)
            }
            setShowForm(false)
            setEditing(null)
          }}
          onCancel={() => { setShowForm(false); setEditing(null) }}
          saving={createClient.isPending || updateClient.isPending}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await deleteClient.mutateAsync(deleting.id)
            setDeleting(null)
          }
        }}
        title="Supprimer le client"
        message={`Êtes-vous sûr de vouloir supprimer "${deleting?.name}" ? Cette action est irréversible.`}
        loading={deleteClient.isPending}
      />

      {/* Detail drawer */}
      {viewing && (
        <ClientDetailDrawer
          client={viewing}
          currency={currency}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); setShowForm(true) }}
        />
      )}

      {/* CSV Import Modal */}
      {showImport && (
        <ImportModal
          open={showImport}
          onClose={() => setShowImport(false)}
          type="clients"
          onImport={async (items) => {
            if (!org) return
            const rows = items.map(c => ({
              ...c,
              organization_id: org.id,
            }))
            const { error } = await supabase.from('clients').insert(rows)
            if (error) throw error
            await queryClient.invalidateQueries({ queryKey: ['clients'] })
          }}
        />
      )}
    </div>
  )
}
