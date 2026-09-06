# Guide de déploiement InvoicePro

## 1. Supabase (Backend)

### Créer le projet
1. https://supabase.com → New Project
2. Région : Europe West (Frankfurt) ou West US pour LATAM/Afrique
3. Notez : **Project URL** et **anon public key**

### Appliquer les migrations
1. Supabase Dashboard → SQL Editor
2. Exécuter `supabase/migrations/001_init.sql` (schéma complet)
3. Exécuter `supabase/migrations/003_storage.sql` (storage)

### Configurer Storage
1. Storage → Create bucket → nom : `logos`, Public : ✓
2. Policies → Add policy → Authenticated users can upload

### Configurer Auth
1. Authentication → URL Configuration
   - Site URL: `https://votre-domaine.com`
   - Redirect URLs: `https://votre-domaine.com/**`
2. Authentication → Providers → Email → Enable
3. Authentication → Providers → Google → Enable + OAuth credentials

## 2. Variables d'environnement

Créer `.env` à la racine de `invoicepro/` :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_APP_NAME=InvoicePro
VITE_APP_URL=https://votre-domaine.com
```

## 3. Build Web

```bash
cd invoicepro
npm install
npm run build
# Output dans dist/
```

## 4. Déploiement Vercel

```bash
npm install -g vercel
vercel --prod
```

Variables d'env à configurer dans Vercel Dashboard :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 5. Déploiement Netlify

```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 6. Android (Capacitor)

```bash
npm install @capacitor/core @capacitor/android @capacitor/cli
npx cap init InvoicePro com.invoicepro.app
npm run build
npx cap add android
npx cap copy android
npx cap open android
# Puis Build → Generate Signed APK dans Android Studio
```

## 7. Windows (Electron ou Tauri)

### Option Tauri (recommandé — léger)
```bash
npm install @tauri-apps/cli @tauri-apps/api
npx tauri init
npm run tauri build
# Output : src-tauri/target/release/bundle/
```

## 8. Domaine personnalisé

Sur Vercel :
- Settings → Domains → Add Domain
- Configurer DNS : CNAME vers `cname.vercel-dns.com`

## 9. Checklist pré-lancement

- [ ] Migrations SQL exécutées
- [ ] Storage bucket créé
- [ ] Variables d'env configurées
- [ ] Email auth activé
- [ ] Google OAuth configuré (optionnel)
- [ ] Domaine configuré
- [ ] SSL actif
- [ ] Test parcours complet : inscription → facture → PDF → paiement
