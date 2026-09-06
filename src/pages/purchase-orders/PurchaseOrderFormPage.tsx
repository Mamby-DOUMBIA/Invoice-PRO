import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCurrentOrg, useCurrentUser } from '@/hooks/useAuth'
import { ClientSelector } from '@/components/shared/ClientSelector'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Client } from '@/types/database'
import toast from 'react-hot-toast'

const schema = z.object({
  date: z.string().min(1),
  expected_date: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export function PurchaseOrderFormPage() {
  const navigate = useNavigate()
  const org = useCurrentOrg()
  const user = useCurrentUser()
  const [client, setClient] = useState<Client | null>(null)
  const [values, setValues] = useState({
    date: new Date().toISOString().slice(0, 10),
    expected_date: '',
    reference: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  function update(name: keyof typeof values, value: string) {
    setValues(current => ({ ...current, [name]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      toast.error('Veuillez renseigner la date du bon de commande.')
      return
    }
    if (!org || !user) {
      toast.error('Votre session ou votre organisation est indisponible.')
      return
    }

    setSaving(true)
    try {
      const number = `BC-${Date.now()}`
      const { data: order, error } = await supabase
        .from('purchase_orders')
        .insert({
          organization_id: org.id,
          client_id: client?.id ?? null,
          number,
          status: 'draft',
          date: parsed.data.date,
          expected_date: parsed.data.expected_date || null,
          reference: parsed.data.reference || null,
          notes: parsed.data.notes || null,
          subtotal_ht: 0,
          total_discount: 0,
          total_tax: 0,
          total_ttc: 0,
          currency: org.currency,
          template: org.default_template,
          converted_to_invoice_id: null,
          created_by: user.id,
        })
        .select('id')
        .single()

      if (error) throw error
      toast.success('Bon de commande créé.')
      navigate('/purchase-orders')
      return order
    } catch (error) {
      console.error('[purchase-orders] creation error:', error)
      toast.error('Impossible de créer le bon de commande.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nouveau bon de commande</h1>
          <p className="text-sm text-slate-400 mt-1">Le numéro sera généré automatiquement.</p>
        </div>
        <Button type="button" variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Destinataire</h2>
          <ClientSelector value={client} onChange={setClient} />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Informations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date" type="date" required value={values.date} onChange={event => update('date', event.target.value)} />
            <Input label="Date prévue" type="date" value={values.expected_date} onChange={event => update('expected_date', event.target.value)} />
            <Input label="Référence" placeholder="Optionnel" value={values.reference} onChange={event => update('reference', event.target.value)} />
          </div>
        </Card>

        <Card>
          <Textarea label="Notes" placeholder="Notes du bon de commande..." rows={4} value={values.notes} onChange={event => update('notes', event.target.value)} />
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Annuler</Button>
          <Button type="submit" icon={<CheckCircle2 className="w-4 h-4" />} loading={saving}>Créer le bon de commande</Button>
        </div>
      </form>
    </div>
  )
}