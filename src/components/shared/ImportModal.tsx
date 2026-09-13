import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  type: 'clients' | 'products'
  onImport: (items: any[]) => Promise<void>
}

export function ImportModal({ open, onClose, type, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    const ext = selected.name.split('.').pop()?.toLowerCase()
    if (ext === 'xlsx' || ext === 'xls') {
      parseXLSX(selected)
    } else {
      parseCSV(selected)
    }
  }

  function parseXLSX(f: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(buffer, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          toast.error('Le fichier Excel est vide.')
          return
        }
        const worksheet = workbook.Sheets[firstSheetName]
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        if (!rawJson || rawJson.length === 0) {
          toast.error('Aucune ligne trouvée dans le fichier Excel.')
          return
        }

        const data: any[] = []
        for (const item of rawJson) {
          const row: Record<string, any> = {}
          for (const [k, v] of Object.entries(item)) {
            row[k.trim().toLowerCase()] = v
          }

          if (type === 'clients') {
            const name = String(row['nom'] || row['name'] || row['client'] || '').trim()
            if (name) {
              data.push({
                name,
                company_name: row['société'] || row['societe'] || row['company_name'] || row['entreprise'] || null,
                email: row['email'] || row['courriel'] || null,
                phone: row['téléphone'] || row['telephone'] || row['phone'] ? String(row['téléphone'] || row['telephone'] || row['phone']) : null,
                whatsapp: row['whatsapp'] ? String(row['whatsapp']) : null,
                address: row['adresse'] || row['address'] || null,
                city: row['ville'] || row['city'] || null,
                country: row['pays'] || row['country'] || 'ML',
                nif: row['nif'] ? String(row['nif']) : null,
                notes: row['notes'] || null,
                is_active: true,
              })
            }
          } else if (type === 'products') {
            const name = String(row['désignation'] || row['designation'] || row['nom'] || row['name'] || '').trim()
            if (name) {
              const rawPrice = String(row['prix ht'] || row['prix'] || row['price_ht'] || '0').replace(',', '.')
              const rawTax = String(row['tva (%)'] || row['taux tva (%)'] || row['tva'] || row['tax_rate'] || '18').replace(',', '.')
              data.push({
                name,
                sku: row['référence/sku'] || row['référence'] || row['reference'] || row['sku'] || row['ref'] || null,
                type: String(row['type'] || '').toLowerCase().includes('serv') ? 'service' : 'product',
                price_ht: parseFloat(rawPrice) || 0,
                tax_rate: parseFloat(rawTax) || 18,
                unit: row['unité'] || row['unite'] || row['unit'] || 'unité',
                description: row['description'] || null,
                is_active: true,
              })
            }
          }
        }

        setParsedRows(data)
        if (data.length > 0) {
          toast.success(`${data.length} élément(s) détecté(s) dans le fichier Excel.`)
        } else {
          toast.error('Aucune ligne valide trouvée dans le fichier Excel.')
        }
      } catch (err: any) {
        console.error(err)
        toast.error('Impossible de lire le fichier Excel.')
      }
    }
    reader.readAsArrayBuffer(f)
  }

  function parseCSV(f: File) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
      if (lines.length < 2) {
        toast.error('Le fichier ne contient pas assez de lignes.')
        return
      }

      // Detect separator (; or ,)
      const firstLine = lines[0]
      const separator = firstLine.includes(';') ? ';' : ','

      const headers = firstLine.split(separator).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase())
      const data: any[] = []

      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(separator).map(c => c.replace(/^["']|["']$/g, '').trim())
        if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue

        const row: Record<string, any> = {}
        headers.forEach((h, index) => {
          row[h] = cells[index] || ''
        })

        if (type === 'clients') {
          // Normalize client fields
          const name = row['nom'] || row['name'] || row['client']
          if (name) {
            data.push({
              name,
              company_name: row['société'] || row['societe'] || row['company_name'] || row['entreprise'] || null,
              email: row['email'] || row['courriel'] || null,
              phone: row['téléphone'] || row['telephone'] || row['phone'] || null,
              whatsapp: row['whatsapp'] || null,
              address: row['adresse'] || row['address'] || null,
              city: row['ville'] || row['city'] || null,
              country: row['pays'] || row['country'] || 'ML',
              nif: row['nif'] || null,
              is_active: true,
            })
          }
        } else if (type === 'products') {
          // Normalize product fields
          const name = row['désignation'] || row['designation'] || row['nom'] || row['name']
          if (name) {
            const rawPrice = (row['prix ht'] || row['prix'] || row['price_ht'] || '0').replace(',', '.')
            const rawTax = (row['taux tva (%)'] || row['tva (%)'] || row['tva'] || row['tax_rate'] || '18').replace(',', '.')
            data.push({
              name,
              sku: row['référence/sku'] || row['référence'] || row['sku'] || row['ref'] || row['reference'] || null,
              type: (row['type'] || '').toLowerCase().includes('serv') ? 'service' : 'product',
              price_ht: parseFloat(rawPrice) || 0,
              tax_rate: parseFloat(rawTax) || 18,
              unit: row['unité'] || row['unite'] || row['unit'] || 'unité',
              description: row['description'] || null,
              is_active: true,
            })
          }
        }
      }

      setParsedRows(data)
      if (data.length > 0) {
        toast.success(`${data.length} élément(s) détecté(s) dans le fichier.`)
      } else {
        toast.error('Aucune ligne valide trouvée. Vérifiez les entêtes du fichier.')
      }
    }
    reader.readAsText(f, 'UTF-8')
  }

  async function handleConfirmImport() {
    if (parsedRows.length === 0) return
    setLoading(true)
    try {
      await onImport(parsedRows)
      toast.success(`Import réussi de ${parsedRows.length} élément(s) !`)
      onClose()
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de l\'import')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Importer des {type === 'clients' ? 'clients' : 'produits et services'} (Excel / CSV)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sélectionnez un fichier Excel (.xlsx, .xls) ou un fichier CSV contenant vos données.
          </p>
        </div>

        {/* Upload box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
        >
          <Upload className="w-8 h-8 text-slate-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {file ? file.name : 'Cliquez pour sélectionner un fichier Excel (.xlsx) ou CSV'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Fichiers supportés : .xlsx, .xls, .csv</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>


        {/* Preview of rows */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Aperçu des données ({parsedRows.length} lignes prêtes)</span>
              <span className="text-green-600 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Prêt pour import
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {parsedRows.slice(0, 5).map((row, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{row.name}</span>
                  <span className="text-slate-400">
                    {type === 'clients' ? (row.phone || row.email || row.city || '—') : `${row.price_ht} FCFA HT`}
                  </span>
                </div>
              ))}
              {parsedRows.length > 5 && (
                <div className="p-2 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 text-xs">
                  + {parsedRows.length - 5} autre(s) ligne(s)...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose} size="sm">
            Annuler
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={parsedRows.length === 0}
            loading={loading}
            onClick={handleConfirmImport}
          >
            Importer {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
