# Passation InvoicePro

Date de passation : 2026-09-06

## 1. Résumé exécutif

InvoicePro est une application React/Vite utilisant Supabase pour l'authentification et les données. Le projet a été corrigé, construit et déployé sur Vercel.

État actuel vérifié :

- Dépôt GitHub : https://github.com/Mamby-DOUMBIA/Invoice-PRO
- Branche principale : `main`
- Commits publiés : `934a8f5`, puis `a28e2cb` pour la passation
- Production Vercel : https://invoicepro-ashen-ten.vercel.app/
- Dernier déploiement vérifié : `Ready`
- `/` : `200`
- `/health` : `200`
- `/purchase-orders/new` : `200`
- `/api/auth/register` : endpoint actif ; un `GET` retourne correctement `405`
- Build Vercel : réussi après correction des incompatibilités TypeScript

Le domaine `invoicepro.vercel.app` n'a pas pu être attaché : il est déjà utilisé par un autre projet Vercel.

## 2. Travail réalisé

### Authentification et onboarding

- Ajout d'un délai de sécurité autour de l'initialisation Supabase afin d'éviter un écran `Chargement...` infini.
- Ajout d'un délai et d'un `finally` dans le callback `SIGNED_IN` afin de toujours libérer l'état de chargement.
- La création de compte redirige vers `/onboarding` sans attendre inutilement l'upsert du profil.
- La requête d'organisation a été séparée en deux lectures simples : membre puis organisation.
- `.maybeSingle()` est utilisé pour traiter normalement un utilisateur sans organisation.
- Le problème RLS récursif sur `organization_members` a été corrigé dans `supabase/migrations/004_fix_members_rls.sql`.
- Le bouton Google affiche un message contrôlé lorsque le fournisseur Google est désactivé dans Supabase.

### Bons de commande

Le bouton « Nouveau bon de commande » ne faisait rien. Les corrections suivantes ont été livrées :

- Ajout du `onClick` du bouton principal.
- Ajout du `onClick` de l'état vide.
- Ajout de la route `/purchase-orders/new`.
- Ajout de `PurchaseOrderFormPage.tsx`.
- Création d'un bon de commande brouillon dans `purchase_orders`.
- Sélection facultative d'un client, dates, référence et notes.
- Retour vers la liste après création.
- Correction du conflit de handlers `onChange`/`onBlur` dans `DocumentLines.tsx`.

### Production Vercel

- Projet Vercel `invoicepro` créé dans l'équipe actuellement connectée.
- Projet local lié à Vercel via `.vercel/` ; ce dossier reste ignoré par Git.
- Variables de production ajoutées sans afficher leurs valeurs.
- Fonctions Vercel ajoutées :
  - `api/health.js`
  - `api/auth/register.js`
- Réécriture `/health` vers `/api/health`.
- Fallback SPA pour les routes React directes, notamment `/purchase-orders/new`.
- Correction de la compatibilité TypeScript : le projet utilise TypeScript 5.x, compatible avec `i18next`.
- Suppression de l'option Vite React `fastRefresh` non reconnue.
- Suppression de `ignoreDeprecations: "6.0"`, option incompatible avec TypeScript 5.

### GitHub

- Dépôt Git initialisé localement avec la branche `main`.
- Vérification avant publication : aucun `.env`, `.env.local`, `.vercel` ou script de maintenance n'était staged.
- Vérification des empreintes connues de secrets dans le contenu staged : aucune correspondance.
- Dépôt GitHub créé et poussé : `Mamby-DOUMBIA/Invoice-PRO`.
- Remote configuré : `https://github.com/Mamby-DOUMBIA/Invoice-PRO.git`.
- Contrôle CI ajouté dans `.github/workflows/ci.yml` : installation reproductible, build, contrôle des fichiers sensibles et scan de motifs de credentials.
- Refonte UI premium ajoutée : typographie Manrope, palette indigo/teal/corail, surfaces plus profondes, sidebar responsive, dashboard hiérarchisé, formulaires et tableaux harmonisés, mode sombre conservé.
- Invalidation centralisée ajoutée dans `src/utils/queryInvalidation.ts` : les créations, modifications, suppressions, conversions et paiements rafraîchissent automatiquement les indicateurs dashboard, graphiques, meilleurs clients, factures récentes, statistiques clients et listes concernées.

## 3. Travaux restant à faire

Les contrôles applicatifs, le build, le déploiement Vercel et la publication GitHub sont réalisés. Les éléments ci-dessous sont les derniers points externes nécessaires pour déclarer la production totalement clôturée.

### Priorité 0 : rotation des secrets

Les anciennes clés Supabase et l'ancien mot de passe PostgreSQL ont été exposés pendant la configuration. Ils doivent être considérés comme compromis.

À faire dans Supabase Dashboard :

1. Ouvrir le projet Supabase utilisé par InvoicePro.
2. Régénérer les clés API publiques nécessaires selon l'interface actuelle Supabase.
3. Régénérer la clé `service_role` si elle a été exposée.
4. Réinitialiser le mot de passe PostgreSQL.
5. Vérifier que l'ancien mot de passe n'est plus accepté.
6. Ne communiquer aucune valeur dans un ticket, un commit ou un chat.

La rotation PostgreSQL automatique n'a pas abouti : ni l'accès direct ni le pooler n'ont accepté les anciennes informations disponibles localement. Il faut donc effectuer cette opération depuis Supabase Dashboard.

Après rotation, mettre à jour Vercel avec les nouvelles valeurs :

- `SUPABASE_URL` : serveur uniquement
- `SUPABASE_PROJECT_REF` : identifiant public de projet
- `SUPABASE_ANON_KEY` : valeur anon, selon l'usage
- `SUPABASE_PUBLISHABLE_KEY` : clé publishable si utilisée
- `SUPABASE_SERVICE_ROLE_KEY` : serveur uniquement, jamais dans `VITE_*`
- `DATABASE_URL` : serveur uniquement, idéalement avec le pooler Supabase
- `VITE_SUPABASE_URL` : frontend
- `VITE_SUPABASE_ANON_KEY` : clé publique frontend
- `VITE_APP_URL` : `https://invoicepro-ashen-ten.vercel.app`
- `APP_URL` : URL publique utilisée par les fonctions Vercel

Après modification des variables, créer un nouveau déploiement production et vérifier `/health`.

### Priorité 1 : vérifier les variables Vercel

Le projet Vercel possède des variables portant les bons noms, mais la valeur de `VITE_SUPABASE_ANON_KEY` est volontairement publique et les valeurs ne doivent pas être inspectées dans un terminal partagé.

À vérifier dans Vercel Dashboard :

- `VITE_SUPABASE_URL` contient l'URL Supabase, pas une clé.
- `VITE_SUPABASE_ANON_KEY` contient uniquement la clé anon/publishable publique.
- `VITE_APP_URL` contient uniquement l'URL de production.
- `APP_URL` contient uniquement l'URL de production.
- `SUPABASE_URL` est configurée pour les fonctions serveur.
- Aucune `SUPABASE_SERVICE_ROLE_KEY` n'est utilisée par le frontend.
- `DATABASE_URL` n'est pas une variable `VITE_*`.

### Priorité 2 : connecter Vercel à GitHub

La commande CLI de connexion a échoué avec le message demandant une « Login Connection » GitHub.

Procédure manuelle :

1. Ouvrir le projet `invoicepro` dans Vercel.
2. Aller dans `Settings` puis `Git`.
3. Ajouter la connexion GitHub OAuth de l'utilisateur `Mamby-DOUMBIA`.
4. Sélectionner `Mamby-DOUMBIA/Invoice-PRO`.
5. Configurer la branche `main` comme branche de production.
6. Vérifier que le root directory est `.`.
7. Vérifier que la commande de build est `npm run build`.
8. Lancer un commit de test ou un redeploy et vérifier le statut `Ready`.

Le workflow CI est déjà présent dans `.github/workflows/ci.yml` et s'exécutera dès que GitHub recevra un push ou une pull request.

### Priorité 3 : domaine

`invoicepro.vercel.app` est déjà pris par un autre projet Vercel et Vercel a refusé l'alias avec `403`.

Deux options :

- Depuis l'autre projet, supprimer l'alias `invoicepro.vercel.app`, puis l'ajouter au projet `invoicepro`.
- Conserver l'URL attribuée par Vercel : `https://invoicepro-ashen-ten.vercel.app/`.

Ne pas supprimer un domaine ou un projet sans confirmer qu'il appartient bien à InvoicePro.

### Priorité 4 : inscription et production

Le frontend utilise directement Supabase pour l'inscription. La fonction `/api/auth/register` existe comme endpoint serveur de validation, mais le formulaire actuel utilise encore `supabase.auth.signUp` directement.

Décision recommandée : choisir une seule stratégie et la documenter :

- soit conserver l'inscription directe Supabase dans le frontend, ce qui est normal avec une clé anon/publishable ;
- soit migrer le formulaire vers `/api/auth/register`, puis gérer proprement le retour de session et la confirmation email.

Ne jamais utiliser `service_role` pour l'inscription depuis le navigateur.

Le contrat serveur `/api/auth/register` est présent et valide les entrées. Le formulaire frontend utilise encore l'API Supabase directe, ce qui est cohérent avec Supabase et évite de faire transiter la clé service. Il n'est pas nécessaire de migrer vers l'endpoint Vercel tant que ce choix est assumé et testé.

### Design et expérience utilisateur

La refonte visuelle est livrée dans les primitives partagées et le shell. Les comportements métier n'ont pas été remplacés : routes, hooks, actions, formulaires et données restent inchangés. Toute évolution visuelle future doit continuer à passer par les primitives `Button`, `Card`, `Input`, `Select`, `Badge` et `Table` plutôt que de multiplier des styles ponctuels.

## 4. Contraintes et garde-fous

### Secrets

- Ne jamais committer `.env`, `.env.local`, `.vercel` ou une clé privée.
- Ne jamais mettre `service_role`, `DATABASE_URL` ou un mot de passe PostgreSQL dans une variable `VITE_*`.
- Les fichiers de maintenance historiques `scripts/*.mjs` sont ignorés par Git car plusieurs contenaient des credentials en dur.
- Les migrations SQL sont publiables, mais doivent être relues avant publication si elles contiennent des valeurs de démonstration.
- Ne jamais afficher une valeur secrète dans les logs CI/CD.
- Après rotation, rechercher les anciennes empreintes dans tout le dépôt et l'historique Git.

### Supabase

- La clé anon/publishable est conçue pour être utilisée côté frontend, mais la sécurité doit reposer sur RLS.
- La clé `service_role` contourne RLS et doit rester serveur uniquement.
- Toute policy qui relit la même table doit être vérifiée contre la récursion RLS.
- Les utilisateurs sans organisation sont un état normal pendant onboarding.
- Les requêtes attendues à zéro ligne doivent utiliser `maybeSingle()` plutôt que `single()`.

### Vercel

- Vérifier le statut réel du dernier déploiement, pas uniquement l'existence d'une URL.
- Un déploiement `Ready` doit être suivi d'un test HTTP de `/`, `/health` et d'une route SPA directe.
- Les anciennes versions `Error` peuvent rester dans l'historique ; seul le dernier déploiement production actif doit être contrôlé.
- Le fallback SPA doit exclure `/api/*`.

### GitHub

- La branche de production est `main`.
- Avant chaque push : `git status`, scan des secrets, `git diff --cached --check`, build production.
- Ne jamais utiliser `git add -f` sur un fichier `.env` ou un fichier de maintenance contenant des credentials.
- Ne jamais réécrire ou supprimer l'historique distant sans demande explicite.

## 5. Procédure de reprise recommandée

### Étape A : préparer les secrets

1. Régénérer les clés et le mot de passe dans Supabase.
2. Mettre à jour les variables Vercel dans le Dashboard.
3. Vérifier que la valeur de `VITE_APP_URL` correspond bien à l'URL publique.
4. Vérifier que `DATABASE_URL` utilise le pooler si le port direct `5432` est inaccessible.
5. Ne pas écrire les nouvelles valeurs dans le dépôt.

### Étape B : vérifier localement

```powershell
npm install
npm run build
npx eslint src/hooks/useAuth.ts src/pages/auth/LoginPage.tsx src/pages/auth/SignupPage.tsx
```

Tester manuellement :

1. ouvrir `/auth/signup` ;
2. créer un compte de test unique ;
3. vérifier la redirection vers `/onboarding` ;
4. se connecter avec un compte existant ;
5. vérifier qu'il n'y a pas de chargement infini ;
6. ouvrir `/purchase-orders` ;
7. cliquer sur « Nouveau bon de commande » ;
8. créer un brouillon et vérifier le retour à la liste.

### Étape C : vérifier Git

```powershell
git status --short
git diff --cached --check
git grep --cached -n -I -F -- 'service_role'
git grep --cached -n -I -F -- 'postgresql://'
git push origin main
```

Les recherches de secrets doivent retourner zéro résultat dans le contenu versionné.

### Étape D : vérifier Vercel

```powershell
vercel deploy --prod --yes --logs
vercel ls invoicepro
```

Vérifier ensuite :

```text
GET https://invoicepro-ashen-ten.vercel.app/
GET https://invoicepro-ashen-ten.vercel.app/health
GET https://invoicepro-ashen-ten.vercel.app/purchase-orders/new
POST https://invoicepro-ashen-ten.vercel.app/api/auth/register
```

Le `POST` doit être testé avec un compte de test contrôlé, jamais avec une adresse réelle d'un client.

### Étape E : connecter GitHub

Effectuer la connexion OAuth manuelle dans Vercel, puis pousser un petit commit documentaire sur `main` pour vérifier le déploiement automatique.

## 6. Points connus et risques résiduels

- Le domaine demandé `invoicepro.vercel.app` n'est pas disponible dans le projet actuel.
- La rotation automatique Supabase/PostgreSQL n'a pas été possible avec les anciennes informations.
- GitHub CLI est installé hors du `PATH` standard ; son chemin local utilisé pendant la configuration était `C:\Mamby_Personal_Apps\Mes_applications_Perso\Github_CLI\bin\gh.exe`.
- Les scripts de maintenance restent présents localement mais sont ignorés par Git. Ils doivent être nettoyés ou réécrits avec des variables d'environnement avant une future publication volontaire.
- Le workflow GitHub Actions est ajouté mais son résultat ne peut être confirmé qu'après réception du prochain push par GitHub.
- Les dépendances locales peuvent être verrouillées par Windows après un `npm ci` interrompu ; dans ce cas, terminer les processus Node concernés puis relancer `npm install` avant les validations locales.
- Le build affiche un avertissement de gros chunks, notamment le bundle PDF. Ce n'est pas bloquant, mais un futur travail de découpage peut améliorer les performances.
- Certaines dépendances signalent des versions obsolètes et cinq vulnérabilités npm ont été signalées lors de l'installation. Exécuter un audit séparé avant de lancer une mise à jour automatique.

## 7. Critère de clôture

La passation pourra être considérée comme terminée lorsque :

- les clés Supabase et le mot de passe PostgreSQL exposés auront été révoqués ;
- les nouvelles variables Vercel auront été configurées et vérifiées ;
- le dernier déploiement sera `Ready` ;
- `/`, `/health`, `/purchase-orders/new` et l'inscription auront été testés ;
- la connexion GitHub OAuth Vercel sera active, ou explicitement refusée par choix ;
- le domaine final sera confirmé ;
- aucune ancienne valeur sensible ne sera présente dans le dépôt ou dans son historique récent.

Tant que les rotations Supabase/PostgreSQL et la connexion OAuth Vercel-GitHub ne sont pas effectuées manuellement, le projet est techniquement déployé mais ne doit pas être déclaré « 100 % clôturé ».
