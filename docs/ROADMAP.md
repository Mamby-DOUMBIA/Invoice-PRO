# Roadmap InvoicePro

Mise à jour : 2026-09-06

## 1. Vision produit

Faire d'InvoicePro un outil de facturation fiable, rapide et accessible pour les indépendants, commerçants et PME, avec une expérience cohérente sur Web, mobile et desktop.

Objectifs produit :

- créer un document professionnel en moins de 60 secondes ;
- réduire les erreurs de calcul et de numérotation ;
- suivre les ventes, paiements et impayés ;
- simplifier le partage des documents ;
- fournir une base SaaS multi-organisation sécurisée ;
- préparer les extensions Android et Windows.

## 2. État actuel

### Livré et vérifié

- Application React/Vite responsive.
- Authentification email/mot de passe Supabase.
- Inscription et redirection onboarding.
- Onboarding entreprise en 11 étapes.
- Organisation, profils et rôles.
- RLS Supabase et correction de la récursion `organization_members`.
- Dashboard avec KPIs, graphiques, meilleurs clients et factures récentes.
- Factures : création, édition, détail, suppression/annulation, calculs et numérotation.
- Devis : création, liste, statuts et conversion en facture.
- Paiements : enregistrement et reçu automatique.
- Clients : CRUD, recherche et statistiques client.
- Produits/services : catalogue, catégories et autocomplétion dans les lignes.
- Reçus, statistiques, historique et paramètres.
- Bons de commande : création d'un brouillon.
- Quatre modèles PDF.
- Partage de documents selon les actions disponibles.
- Mode sombre.
- Responsive mobile, tablette et desktop.
- Rafraîchissement automatique des indicateurs après mutations grâce à `src/utils/queryInvalidation.ts`.
- CI GitHub avec installation, build et scan de credentials.
- Déploiement Vercel en statut `Ready`.

## 3. Priorité immédiate : fiabilisation production

### P0. Sécurité et accès

Objectif : éliminer les risques avant une exploitation commerciale.

Actions :

1. Révoquer les anciennes clés Supabase exposées.
2. Régénérer la clé anon/publishable si nécessaire.
3. Régénérer la clé `service_role` si elle a été exposée.
4. Réinitialiser le mot de passe PostgreSQL.
5. Mettre à jour les variables Vercel sans afficher les valeurs.
6. Vérifier qu'aucune clé privée n'est préfixée par `VITE_`.
7. Nettoyer ou réécrire les scripts de maintenance qui contenaient des secrets en dur.
8. Contrôler l'historique Git si une valeur secrète a été poussée avant la création du dépôt.

Critère de sortie : aucun secret actif compromis, variables Vercel validées, RLS vérifiée.

### P0. Authentification complète

Objectif : rendre tous les parcours d'accès clairs et fiables.

Actions :

1. Décider si la confirmation email est obligatoire en production.
2. Activer et tester Google OAuth dans Supabase, ou retirer le bouton tant qu'il n'est pas configuré.
3. Configurer les URLs de redirection production et preview.
4. Ajouter une page de confirmation d'email explicite.
5. Ajouter un état d'erreur réseau avec bouton de nouvelle tentative.
6. Tester inscription, connexion, déconnexion, mot de passe oublié et session expirée.
7. Tester les rôles owner, admin, accountant, employee et viewer.

Critère de sortie : chaque parcours aboutit à une page déterministe sans spinner permanent.

### P0. Tests automatisés

Objectif : empêcher les régressions sur les parcours critiques.

Actions :

1. Ajouter Playwright au projet.
2. Tester l'ouverture de `/auth/login`.
3. Tester l'inscription avec une adresse unique de test.
4. Tester la connexion d'un utilisateur de test.
5. Tester la création et l'édition d'une facture.
6. Tester la conversion devis → facture.
7. Tester l'ajout d'un paiement et la création du reçu.
8. Tester la création d'un bon de commande.
9. Vérifier que les KPIs changent après une mutation.
10. Tester les routes directes en desktop et mobile.

Critère de sortie : tests critiques exécutés dans GitHub Actions et Vercel Preview.

## 4. Cycle 1 : documents commerciaux complets

### Bons de commande

État actuel : création d'un brouillon disponible.

À construire :

- hook `usePurchaseOrders` avec liste filtrée par organisation ;
- liste paginée et recherche ;
- détail d'un bon de commande ;
- édition et suppression ;
- lignes produits/services et calculs HT/TVA/TTC ;
- statut brouillon, envoyé, accepté, refusé, converti ;
- conversion BC → facture si le modèle métier le confirme ;
- PDF et partage ;
- recalcul automatique des indicateurs concernés.

### Devis

À compléter :

- édition complète si absente de l'écran courant ;
- détail PDF et partage cohérent avec les factures ;
- dates d'expiration et rappels ;
- historique de changement de statut.

### Reçus

À compléter :

- visualisation PDF dédiée ;
- téléchargement et partage ;
- recherche par numéro, client et paiement ;
- correction/annulation contrôlée d'un reçu selon les règles comptables.

## 5. Cycle 2 : comptabilité et automatisation

### Paiements et recouvrement

- échéancier par facture ;
- rappels automatiques avant et après échéance ;
- relances email et WhatsApp avec modèles éditables ;
- rapprochement paiement/facture ;
- paiements partiels robustes ;
- journal des ajustements ;
- export CSV et Excel.

### Fiscalité et localisation

- profils fiscaux par pays ;
- plusieurs taux de TVA sur une même facture ;
- retenues à la source ;
- mentions légales configurables ;
- formats de dates et numéros localisés ;
- langues supplémentaires au-delà du français et de l'anglais.

### Exports

- export de factures et clients ;
- export des ventes par période ;
- export comptable ;
- sauvegarde PDF groupée ;
- archivage légal configurable.

## 6. Cycle 3 : SaaS commercial

### Abonnements

Les plans existent dans le schéma : Free, Starter, Pro et Business. Il reste à rendre les limites et la facturation opérationnelles.

Actions :

1. Afficher l'utilisation courante par organisation.
2. Bloquer ou avertir à l'approche des limites.
3. Ajouter une page de comparaison des plans.
4. Connecter un prestataire de paiement adapté aux marchés ciblés.
5. Gérer upgrade, downgrade, période d'essai et annulation.
6. Ajouter webhooks de paiement et réconciliation.
7. Ajouter les factures d'abonnement de l'entreprise InvoicePro.

### Multi-utilisateurs

- invitations par email ;
- acceptation d'invitation ;
- gestion des rôles ;
- révocation de session ;
- journal d'audit visible par owner/admin ;
- contrôle précis des actions par rôle.

## 7. Cycle 4 : expérience utilisateur

### Dashboard

- filtres de dates personnalisés ;
- comparaison avec période précédente ;
- widgets configurables ;
- alertes impayés et échéances ;
- raccourcis bons de commande et reçus ;
- états vides plus orientés action.

### Recherche et navigation

- recherche globale ;
- raccourcis clavier desktop ;
- breadcrumbs dans les détails ;
- filtres persistants ;
- pagination homogène ;
- notifications centralisées.

### Design system

- documenter les tokens visuels ;
- ajouter tests de régression visuelle ;
- harmoniser tous les écrans secondaires avec les primitives UI ;
- vérifier le contraste et la navigation clavier ;
- vérifier les tailles tactiles mobile.

## 8. Cycle 5 : mobile et desktop

### Android

- empaquetage Capacitor ou Tauri mobile selon décision technique ;
- partage natif PDF ;
- notifications locales ;
- cache offline partiel ;
- synchronisation différée ;
- tests appareils entrée et milieu de gamme.

### Windows

- empaquetage Tauri recommandé pour un exécutable léger ;
- installateur signé ;
- auto-update ;
- impression et ouverture de fichiers ;
- raccourcis clavier ;
- stockage local temporaire sécurisé ;
- gestion hors ligne explicite.

## 9. Cycle 6 : qualité et exploitation

- monitoring des erreurs frontend ;
- alertes Supabase et Vercel ;
- logs structurés sans données personnelles ni secrets ;
- sauvegardes PostgreSQL testées ;
- procédure de restauration ;
- politique de rétention des documents ;
- RGPD et politique de confidentialité ;
- conditions générales et politique tarifaire ;
- audit de dépendances mensuel ;
- rotation documentée des secrets ;
- environnement staging séparé de production.

## 10. Ordre recommandé

1. Rotation des secrets et verrouillage des accès.
2. Tests automatisés de l'authentification et des mutations.
3. Finalisation des bons de commande.
4. Finalisation des PDF, reçus et exports.
5. Limites et abonnements SaaS.
6. Multi-utilisateurs et audit.
7. Relances et paiements avancés.
8. Monitoring, sauvegardes et conformité.
9. Android puis Windows.
10. Optimisations de performance et régression visuelle.

## 11. Définition de « prêt pour commercialisation »

InvoicePro pourra être déclaré prêt pour commercialisation lorsque :

- aucun secret compromis n'est actif ;
- les tests critiques passent automatiquement ;
- les mutations recalculent systématiquement les vues dérivées ;
- les factures, devis, reçus et BC ont un cycle complet ;
- les paiements et limites d'abonnement sont contrôlés ;
- les droits multi-utilisateurs sont testés ;
- les sauvegardes et la restauration sont vérifiées ;
- les conditions légales et la politique de confidentialité sont publiées ;
- les déploiements staging et production sont séparés ;
- un support utilisateur et une procédure d'incident existent.
