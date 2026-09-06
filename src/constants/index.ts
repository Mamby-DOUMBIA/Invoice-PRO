import type { PaymentMethod, DocumentStatus } from '@/types/database'

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Espèces' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'moov_money', label: 'Moov Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'check', label: 'Chèque' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'other', label: 'Autre' },
]

export const DOCUMENT_STATUSES: Record<DocumentStatus, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'gray' },
  sent: { label: 'Envoyé', color: 'blue' },
  accepted: { label: 'Accepté', color: 'green' },
  refused: { label: 'Refusé', color: 'red' },
  expired: { label: 'Expiré', color: 'orange' },
  converted: { label: 'Converti', color: 'purple' },
  paid: { label: 'Payé', color: 'green' },
  partially_paid: { label: 'Part. payé', color: 'yellow' },
  unpaid: { label: 'Impayé', color: 'orange' },
  overdue: { label: 'En retard', color: 'red' },
  cancelled: { label: 'Annulé', color: 'gray' },
}

export const PDF_TEMPLATES = [
  { value: 'classic', label: 'Classique' },
  { value: 'modern', label: 'Moderne' },
  { value: 'minimal', label: 'Minimaliste' },
  { value: 'corporate', label: 'Corporate' },
]

export const CURRENCIES = [
  { code: 'XOF', name: 'Franc CFA (FCFA)', symbol: 'FCFA' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar US', symbol: '$' },
  { code: 'GBP', name: 'Livre sterling', symbol: '£' },
  { code: 'MAD', name: 'Dirham marocain', symbol: 'DH' },
  { code: 'GNF', name: 'Franc guinéen', symbol: 'GNF' },
]

export const COUNTRIES = [
  { code: 'ML', name: 'Mali' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'GN', name: 'Guinée' },
  { code: 'TG', name: 'Togo' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'NE', name: 'Niger' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'CD', name: 'RD Congo' },
  { code: 'MA', name: 'Maroc' },
  { code: 'DZ', name: 'Algérie' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'OTHER', name: 'Autre' },
]

export const VAT_RATES = [0, 5, 10, 15, 18, 20]

export const UNITS = [
  'unité', 'heure', 'jour', 'mois', 'forfait', 'kg', 'g', 'litre',
  'ml', 'm²', 'm³', 'm', 'cm', 'paire', 'boîte', 'carton', 'lot',
]

export const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
}
