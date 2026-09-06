# InvoicePro

> Créez une facture professionnelle en moins de 60 secondes.

Application SaaS de facturation — Web (React + Vite + Supabase).

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 19, TypeScript, Vite 8 |
| Styles | Tailwind CSS 4 |
| Routing | React Router 7 |
| State | Zustand 5 |
| Data fetching | TanStack Query 5 |
| Formulaires | React Hook Form + Zod |
| Backend / BDD | Supabase (PostgreSQL + Auth + Storage + RLS) |
| PDF | @react-pdf/renderer |
| Charts | Recharts |
| i18n | react-i18next (FR + EN) |
| Icons | Lucide React |

---

## Prérequis

- Node.js ≥ 20
- Un projet Supabase (gratuit sur https://supabase.com)

---

## Installation

```bash
# 1. Cloner / ouvrir le dossier
cd invoicepro

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 4. Appliquer les migrations SQL
# → Supabase Dashboard > SQL Editor > coller 001_init.sql

# 5. Lancer en développement
npm run dev
```

---

## Variables d'environnement

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-publique
VITE_APP_NAME=InvoicePro
VITE_APP_URL=https://votre-domaine.com
```

---

## Configuration Supabase

### 1. Créer le projet
1. Aller sur https://supabase.com → New Project
2. Choisir région Europe (Paris) ou proche de vos utilisateurs
3. Copier l'URL et la clé `anon`

### 2. Appliquer les migrations
1. Dashboard → SQL Editor
2. Coller le contenu de `supabase/migrations/001_init.sql`
3. Exécuter

### 3. Configurer le Storage
1. Storage → Create bucket : `logos`
2. Policies : permettre lecture publique, écriture pour utilisateurs authentifiés

### 4. Configurer l'Auth
1. Authentication → URL Configuration → Site URL: votre domaine
2. Redirect URLs: ajouter `https://votre-domaine.com/**`
3. Pour Google OAuth: Authentication → Providers → Google → activer

---

## Déploiement Web (Vercel)

```bash
# Build
npm run build

# Déployer sur Vercel
npx vercel --prod
```

Variables d'environnement à ajouter dans Vercel :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Structure du projet

```
src/
├── components/
│   ├── ui/          # Design system (Button, Input, Modal, Table...)
│   ├── layout/      # Sidebar, AppLayout, BottomNav
│   ├── shared/      # ClientSelector, DocumentLines, ShareModal...
│   └── pdf/         # 4 templates PDF (Classic, Modern, Minimal, Corporate)
├── hooks/           # useClients, useInvoices, useProducts, usePayments, useStats...
├── pages/
│   ├── auth/        # Login, Signup, ForgotPassword
│   ├── onboarding/  # Wizard 11 étapes
│   ├── dashboard/   # Dashboard KPIs + graphiques
│   ├── invoices/    # Liste, formulaire, détail
│   ├── quotes/      # Devis + conversion
│   ├── receipts/    # Reçus auto
│   ├── purchase-orders/
│   ├── clients/     # CRUD + stats client
│   ├── products/    # Catalogue
│   ├── payments/    # Historique paiements
│   ├── statistics/  # Graphiques avancés
│   ├── history/     # Historique global
│   └── settings/    # Paramètres entreprise + abonnement
├── store/           # Zustand auth store
├── types/           # Types TypeScript + database types
├── utils/           # calc.ts, format.ts, cn.ts
├── constants/       # Modes paiement, statuts, devises...
└── i18n/            # FR + EN
supabase/
└── migrations/      # 001_init.sql (schéma complet + RLS)
```

---

## Parcours utilisateur principal

```
Inscription → Onboarding (11 étapes) → Dashboard
→ + Nouvelle facture
→ Sélectionner client (autocomplétion)
→ Ajouter produits/services (autocomplétion + calcul temps réel)
→ Vérifier totaux HT/TVA/TTC
→ Créer la facture (numérotation auto : FAC-2026-0001)
→ Visualiser PDF (4 modèles)
→ Télécharger / Partager WhatsApp / Email / Telegram
→ Enregistrer paiement → Reçu auto généré
→ Statistiques & Historique
```

---

## Fonctionnalités clés

- ✅ Numérotation automatique sans doublon (verrou PostgreSQL)
- ✅ Calculs TVA fiables (arrondi CFA)
- ✅ 4 templates PDF professionnels
- ✅ Partage WhatsApp / Email / Telegram avec message pré-rempli
- ✅ Row Level Security (isolation totale par organisation)
- ✅ Dark mode
- ✅ Responsive (mobile / tablette / desktop)
- ✅ i18n FR / EN
- ✅ Conversion devis → facture
- ✅ Reçus auto à chaque paiement
- ✅ Dashboard avec graphiques (Recharts)
- ✅ Plans SaaS configurables (Free / Starter / Pro / Business)

---

## Plans SaaS

| Plan | Prix | Factures | Clients | Utilisateurs |
|------|------|----------|---------|-------------|
| Free | 0 FCFA | 10/mois | 5 | 1 |
| Starter | 5 000 FCFA/mois | 100/mois | 50 | 3 |
| Pro | 15 000 FCFA/mois | Illimité | Illimité | 10 |
| Business | 30 000 FCFA/mois | Illimité | Illimité | Illimité |

---

## Sécurité

- Row Level Security sur toutes les tables
- Isolation totale par organisation
- Validation Zod côté client
- Sessions Supabase (JWT)
- Secrets hors du code source (variables d'environnement)
- Rate limiting via Supabase

---

## Licence

Propriétaire — © 2026 InvoicePro
