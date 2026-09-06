# CAHIER DES CHARGES FONCTIONNEL — INVOICEPRO

## 1. Présentation
**Nom :** InvoicePro  
**Promesse :** « Créez une facture professionnelle en moins de 60 secondes. »  
**Type :** application SaaS de facturation multi-plateforme : Web, Android et Windows.  
**Cibles :** commerçants, PME, consultants, freelances, artisans, bureaux d’études, agences et prestataires.

## 2. Objectifs
- Simplifier radicalement la création de devis, factures, reçus et bons de commande.
- Permettre la création d’une facture simple en moins de 60 secondes.
- Centraliser clients, produits/services, documents et paiements.
- Produire des PDF professionnels immédiatement partageables.
- Fournir un suivi simple des ventes, encaissements et impayés.
- Préparer une offre SaaS monétisable au Mali, en Afrique et à l’international.

## 3. Plateformes
### Web
Application responsive utilisable sur mobile, tablette et desktop.

### Android
Application mobile optimisée pour appareils d’entrée et milieu de gamme, avec partage natif et fonctionnement hors ligne partiel.

### Windows
Application desktop installable, avec PDF, impression, fichiers locaux et synchronisation.

## 4. Modules fonctionnels
### Authentification
- Inscription / connexion
- Email + mot de passe
- Vérification email
- Mot de passe oublié
- Sessions sécurisées
- Google OAuth
- Architecture prête pour OTP téléphone

### Entreprise
- Nom, logo, adresse, téléphone, email, site
- NIF / informations fiscales
- Devise
- TVA
- coordonnées bancaires
- conditions de paiement
- personnalisation des documents
- préfixes et séquences de numérotation

### Clients
- CRUD complet
- Recherche et filtres
- Import/export CSV/Excel
- Téléphone, WhatsApp, email, adresse, NIF
- Historique
- Total facturé, payé, impayé et solde

### Produits / Services
- CRUD complet
- Produit ou service
- Catégorie
- SKU/référence
- Description
- Prix HT/TTC
- TVA
- Unité
- Import/export CSV/Excel
- Ajout rapide depuis une facture

### Devis
- Création, modification, duplication, suppression
- Numérotation automatique
- Statuts : brouillon, envoyé, accepté, refusé, expiré, converti
- PDF, impression, téléchargement, partage
- Conversion devis → facture

### Factures
- Création rapide
- Client et produits avec autocomplétion
- Quantité, unité, prix, remise, TVA
- HT, remise, base taxable, TVA, TTC
- Date, échéance, référence
- Notes et conditions
- Paiement et solde
- Duplication, annulation, impression, PDF et partage
- Numérotation sans doublon

### Reçus
- Création depuis une facture
- Montant reçu
- Date
- Mode et référence de paiement
- Commentaire
- PDF
- Mise à jour automatique du solde

### Bons de commande
- Création, modification, duplication, suppression
- Statuts
- PDF, impression, partage
- Conversion en facture

### Paiements
Modes :
- Espèces
- Orange Money
- Moov Money
- Wave
- Virement
- Chèque
- Carte
- Autre

### Calculs
- TVA par ligne ou globale
- Plusieurs taux de TVA
- Remise en % ou montant fixe
- Quantités décimales
- Arrondis fiables
- Totaux HT / TVA / TTC
- Montant payé / restant

### PDF
- A4 professionnel
- Aperçu
- Modèles : Classique, Moderne, Minimaliste, Corporate
- Logo et identité entreprise
- Client, lignes, totaux, TVA, conditions, paiement, signature optionnelle

### Partage
- WhatsApp
- Email
- Telegram
- Partage natif Android/Windows
- Téléchargement
- Impression
- Message prérempli

### Historique
- Tous documents
- Recherche
- Filtres par type, statut, client, période et montant
- Ouverture, modification, duplication, téléchargement, partage et annulation

### Dashboard / statistiques
- CA
- encaissé
- à recevoir
- impayés
- factures
- devis
- taux de conversion
- panier moyen
- top clients
- top produits/services
- évolution mensuelle
- filtres temporels

### Relances
- Échéance proche
- En retard
- Messages personnalisables
- Partage WhatsApp/email

### Import / export
- CSV
- Excel
- PDF
- Clients, produits, documents et paiements

### Offline / synchronisation
- Consultation de données essentielles hors ligne
- Création de factures hors ligne
- File de synchronisation
- Gestion des conflits et doublons

## 5. Organisation et sécurité
Rôles :
- Owner
- Admin
- Accountant
- Employee
- Viewer

Exigences :
- isolation stricte par organisation
- Row Level Security
- validation client et serveur
- contrôle des permissions
- gestion sécurisée des fichiers
- audit logs
- rate limiting
- secrets hors du code source

## 6. Modèle SaaS
Plans configurables :
- Free
- Starter : exemple 5 000 FCFA/mois
- Pro : exemple 15 000 FCFA/mois
- Business : exemple 30 000 FCFA/mois

Prévoir limites configurables : documents, clients, produits, utilisateurs, modèles, statistiques et exports.

Préparer intégrations :
- Stripe
- Orange Money
- Moov Money
- Wave

## 7. Base de données
Prévoir notamment :
users, organizations, organization_members, company_settings, clients, client_contacts, products, services, product_categories, quotes, quote_items, invoices, invoice_items, receipts, receipt_items, purchase_orders, purchase_order_items, payments, taxes, discounts, document_sequences, document_templates, notifications, subscriptions, subscription_plans, expenses, currencies, audit_logs.

## 8. UX prioritaire
Parcours cible :
**Accueil → Nouvelle facture → Client → Produits/services → Vérification → Créer → PDF → Partager.**

Le bouton « + Nouvelle facture » doit être immédiatement accessible.

## 9. Tests et acceptation
Tester :
- authentification
- isolation des organisations
- CRUD
- calculs TVA/remises
- numérotation concurrente
- devis → facture
- paiements → reçus
- PDF
- partage
- offline/synchronisation
- abonnements
- responsive
- Android
- Windows

Critère principal :
**le parcours complet de création d’une facture doit fonctionner sans intervention manuelle dans la base de données.**

## 10. Livrables
- code source complet
- migrations SQL
- documentation
- variables d’environnement exemple
- tests
- données de démonstration
- APK + AAB Android
- build Windows installable
- build Web
- icône
- politique de confidentialité
- CGU
- guide utilisateur
- guide administrateur
