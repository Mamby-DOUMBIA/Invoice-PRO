import { useState, useRef } from 'react'
import { Search, Plus, User } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import type { Client } from '@/types/database'
import { cn } from '@/utils/cn'

interface Props {
  value: Client | null
  onChange: (c: Client | null) => void
  onNewClient?: () => void
}

export function ClientSelector({ value, onChange, onNewClient }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: clients = [] } = useClients(search)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = clients.slice(0, 8)

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Client <span className="text-red-500">*</span>
      </label>
      <div className="relative" ref={ref}>
        {value ? (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{value.name}</p>
              {value.company_name && <p className="text-xs text-slate-500">{value.company_name}</p>}
              {value.phone && <p className="text-xs text-slate-400">{value.phone}</p>}
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-slate-400 hover:text-red-500 ml-2"
            >
              Changer
            </button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                placeholder="Rechercher un client..."
                value={search}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {open && (
              <div className="absolute top-11 left-0 z-20 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {filtered.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => { onChange(c); setOpen(false); setSearch('') }}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{c.name}</p>
                    {c.company_name && <p className="text-xs text-slate-400">{c.company_name}</p>}
                  </button>
                ))}
                {onNewClient && (
                  <button
                    type="button"
                    onMouseDown={onNewClient}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-t border-slate-100 dark:border-slate-700 font-medium"
                  >
                    <Plus className="w-4 h-4" /> Nouveau client
                  </button>
                )}
                {filtered.length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-400">Aucun résultat</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
