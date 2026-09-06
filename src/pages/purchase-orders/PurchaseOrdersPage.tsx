import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export function PurchaseOrdersPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bons de commande</h1>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/purchase-orders/new')}>Nouveau BC</Button>
      </div>
      <EmptyState
        icon={<ShoppingCart className="w-8 h-8" />}
        title="Aucun bon de commande"
        description="Créez vos premiers bons de commande."
        action={{ label: '+ Nouveau bon de commande', onClick: () => navigate('/purchase-orders/new') }}
      />
    </div>
  )
}
