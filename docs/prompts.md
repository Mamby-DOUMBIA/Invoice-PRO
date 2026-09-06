# PROMPT MAÎTRE — CONSTRUCTION DE L’APPLICATION INVOICEPRO

## 1. RÔLE

Agis comme une équipe complète composée de :

* Product Manager SaaS
* Architecte logiciel senior
* Développeur Full-Stack senior
* Développeur Android
* Développeur Windows/Desktop
* UX/UI Designer
* Expert comptabilité/facturation
* Expert sécurité
* Expert PostgreSQL/Supabase
* Expert PDF
* Expert SaaS et monétisation
* QA/Test Engineer
* DevOps/Cloud Engineer

Ta mission est de **concevoir, développer, tester et livrer de A à Z une application professionnelle complète appelée "InvoicePro"**, destinée à permettre à une entreprise de créer une facture professionnelle en moins de 60 secondes.

IMPORTANT :

Je ne veux PAS une simple maquette, un prototype visuel ou du pseudo-code.

Je veux une **application réellement fonctionnelle, exploitable et prête à être déployée et commercialisée**.

---

# 2. PRODUIT

Nom : **InvoicePro**

Slogan :

> « Créez une facture professionnelle en moins de 60 secondes. »

Type :

* SaaS de facturation
* application Web
* application Android
* application Windows/Desktop

Cibles :

* commerçants
* PME
* freelances
* consultants
* artisans
* entrepreneurs
* bureaux d'études
* agences
* prestataires de services
* associations/ONG
* petites entreprises
* indépendants

Marchés prioritaires :

1. Mali
2. Afrique francophone
3. UEMOA
4. Afrique
5. International

Langues initiales :

* Français
* Anglais

Devise principale :

* XOF / FCFA

Prévoir une architecture permettant d'ajouter facilement :

* EUR
* USD
* GBP
* autres devises

---

# 3. OBJECTIF PRINCIPAL

L'utilisateur doit pouvoir :

1. créer son entreprise ;
2. ajouter son logo ;
3. créer un client ;
4. ajouter des produits/services ;
5. créer un devis ;
6. convertir un devis en facture ;
7. générer automatiquement la numérotation ;
8. appliquer TVA et remises ;
9. générer un PDF professionnel ;
10. partager immédiatement le PDF par WhatsApp, email ou autre application ;
11. enregistrer automatiquement l'opération ;
12. consulter l'historique ;
13. suivre les factures payées, impayées et en retard ;
14. consulter ses statistiques.

Le parcours principal doit être extrêmement rapide.

Objectif UX :

> Ouvrir InvoicePro → Nouvelle facture → sélectionner client → ajouter produits/services → vérifier total → créer PDF → partager.

Temps cible :

**moins de 60 secondes pour une facture simple.**

---

# 4. PLATEFORMES

Construire une architecture permettant d'utiliser InvoicePro sur :

## Web

Application web responsive :

* ordinateur
* tablette
* smartphone

## Android

Application Android native ou cross-platform professionnelle.

Elle doit fonctionner correctement sur des appareils Android d'entrée et milieu de gamme.

## Windows

Application desktop Windows avec :

* installation locale ;
* raccourci ;
* fonctionnement fluide ;
* possibilité d'imprimer ;
* génération PDF ;
* partage de fichiers.

L'expérience utilisateur et les données doivent rester cohérentes entre les plateformes.

---

# 5. ARCHITECTURE TECHNIQUE

Utiliser une architecture moderne, robuste et maintenable.

Stack recommandée :

### Frontend Web

* React
* TypeScript
* Vite
* Tailwind CSS
* composants UI modernes
* responsive design

### Backend

Utiliser une architecture API propre.

Préférence :

* Supabase
* PostgreSQL
* API sécurisée
* Row Level Security
* Storage

### Authentification

Prévoir :

* email + mot de passe
* Google
* récupération de mot de passe
* vérification email
* sessions sécurisées

Prévoir ultérieurement :

* téléphone/OTP

### Android

Utiliser une solution moderne permettant de partager au maximum le code avec le Web/Desktop lorsque cela est pertinent.

### Windows

Utiliser une technologie desktop moderne permettant de distribuer une application Windows professionnelle.

---

# 6. STRUCTURE DES DONNÉES

Créer une vraie base PostgreSQL relationnelle.

Tables principales :

* users
* organizations
* organization_members
* company_settings
* clients
* client_contacts
* products
* services
* product_categories
* quotes
* quote_items
* invoices
* invoice_items
* receipts
* receipt_items
* purchase_orders
* purchase_order_items
* payments
* taxes
* discounts
* document_sequences
* document_templates
* expenses
* currencies
* notifications
* subscriptions
* subscription_plans
* audit_logs

Créer les relations, contraintes, index et règles d'intégrité nécessaires.

Chaque entreprise doit avoir ses propres données.

Un utilisateur ne doit jamais pouvoir accéder aux données d'une autre entreprise.

Utiliser Row Level Security lorsque Supabase est utilisé.

---

# 7. GESTION DE L'ENTREPRISE

Lors de la première connexion :

Créer un assistant de configuration :

### Étape 1

Nom de l'entreprise

### Étape 2

Logo

### Étape 3

Adresse

### Étape 4

Téléphone

### Étape 5

Email

### Étape 6

Site Web

### Étape 7

Numéro d'identification fiscale / NIF

### Étape 8

Régime fiscal

### Étape 9

Devise

### Étape 10

TVA

### Étape 11

Préfixe des documents

Exemple :

* DEV-2026-0001
* FAC-2026-0001
* REC-2026-0001
* BC-2026-0001

Permettre à l'utilisateur de personnaliser les formats.

---

# 8. CLIENTS

Créer un module complet Clients.

Informations :

* nom
* entreprise
* téléphone
* WhatsApp
* email
* adresse
* ville
* pays
* NIF
* numéro fiscal
* notes

Fonctions :

* créer
* modifier
* supprimer
* rechercher
* filtrer
* importer
* exporter
* historique des transactions
* total facturé
* total payé
* solde restant

Afficher :

* nombre de factures
* montant total
* montant payé
* montant impayé
* dernière transaction.

---

# 9. PRODUITS ET SERVICES

Créer un catalogue.

Informations :

* nom
* description
* référence/SKU
* type : produit/service
* catégorie
* prix HT
* TVA
* prix TTC
* unité
* image facultative

Fonctions :

* création
* modification
* suppression
* recherche
* catégories
* import Excel/CSV
* export Excel/CSV

Prévoir une option :

> Ajouter rapidement un produit directement depuis la création d'une facture.

---

# 10. DEVIS

Créer un module Devis.

Fonctions :

* nouveau devis
* modifier
* dupliquer
* supprimer
* rechercher
* filtrer
* télécharger PDF
* imprimer
* partager
* convertir en facture

Statuts :

* Brouillon
* Envoyé
* Accepté
* Refusé
* Expiré
* Converti

Le numéro doit être automatiquement généré.

Exemple :

DEV-2026-0001

---

# 11. FACTURES

Créer le module principal.

Une facture doit contenir :

### En-tête

* logo
* entreprise
* adresse
* téléphone
* email
* informations fiscales

### Client

* nom
* entreprise
* adresse
* téléphone
* email
* informations fiscales

### Facture

* numéro
* date
* date d'échéance
* référence éventuelle
* conditions de paiement

### Lignes

* produit/service
* description
* quantité
* unité
* prix unitaire
* remise
* TVA
* total

### Totaux

* sous-total HT
* remise
* base taxable
* TVA
* total TTC
* montant payé
* montant restant

Ajouter :

* notes
* conditions générales
* coordonnées bancaires
* mode de paiement

---

# 12. CALCULS FINANCIERS

Les calculs doivent être fiables.

Gérer :

* HT
* TVA
* TTC
* remises en %
* remises fixes
* TVA par ligne
* TVA globale
* plusieurs taux de TVA
* arrondis
* quantités décimales

Éviter les erreurs d'arrondi.

Les montants affichés et enregistrés doivent être cohérents.

---

# 13. NUMÉROTATION AUTOMATIQUE

Créer un moteur de numérotation.

Formats configurables :

FAC-2026-0001
FAC-2026-0002
DEV-2026-0001
REC-2026-0001
BC-2026-0001

Permettre :

* préfixe
* année
* mois
* compteur
* nombre de chiffres

Empêcher les doublons.

La génération doit être sûre même avec plusieurs utilisateurs créant simultanément des documents.

---

# 14. REÇUS

Créer un module Reçus.

Un reçu doit pouvoir être créé depuis une facture.

Informations :

* numéro
* client
* facture associée
* montant reçu
* mode de paiement
* date
* référence paiement
* commentaire

Modes :

* Espèces
* Orange Money
* Moov Money
* Wave
* Virement
* Chèque
* Carte
* Autre

Générer automatiquement un PDF.

---

# 15. BONS DE COMMANDE

Créer un module Bons de commande.

Fonctions :

* créer
* modifier
* dupliquer
* envoyer
* télécharger PDF
* imprimer
* convertir en facture

Numérotation :

BC-2026-0001

---

# 16. PDF PROFESSIONNELS

Créer un véritable moteur de génération PDF.

Les PDF doivent être :

* professionnels
* propres
* lisibles
* imprimables
* adaptés A4
* adaptés aux smartphones

Inclure :

* logo
* identité entreprise
* identité client
* numéro document
* dates
* lignes
* totaux
* TVA
* conditions
* paiement
* signature si activée

Prévoir plusieurs modèles :

### Template 1

Classique

### Template 2

Moderne

### Template 3

Minimaliste

### Template 4

Corporate

Permettre à l'utilisateur de sélectionner son modèle.

---

# 17. LOGO ET PERSONNALISATION

L'entreprise peut importer :

* PNG
* JPG
* SVG

Prévoir :

* couleur principale
* couleur secondaire
* logo
* pied de page
* informations légales
* conditions de paiement

Ces paramètres doivent automatiquement apparaître sur les documents.

---

# 18. PARTAGE WHATSAPP

Le partage doit être extrêmement simple.

Après création d'une facture :

Afficher :

**Partager**

Options :

* WhatsApp
* Email
* Telegram
* copier le lien
* télécharger
* imprimer
* partager via le système Android/Windows.

Préparer automatiquement un message :

> Bonjour [Client],
> Veuillez trouver votre facture [FAC-2026-0001] d'un montant de [MONTANT].
> Merci pour votre confiance.

Puis permettre de joindre/envoyer le PDF.

---

# 19. HISTORIQUE

Créer une page Historique.

Filtres :

* facture
* devis
* reçu
* bon de commande
* client
* période
* statut
* montant

Recherche instantanée.

Actions :

* ouvrir
* modifier
* dupliquer
* télécharger
* imprimer
* partager
* annuler

---

# 20. STATISTIQUES

Créer un dashboard professionnel.

KPIs :

* chiffre d'affaires
* factures émises
* factures payées
* factures impayées
* devis
* taux de conversion devis → facture
* montant moyen des factures
* top clients
* top produits/services

Graphiques :

* chiffre d'affaires mensuel
* factures par statut
* paiements
* évolution des ventes

Filtres :

* aujourd'hui
* cette semaine
* ce mois
* trimestre
* année
* période personnalisée

---

# 21. RELANCES

Créer un système de suivi des factures impayées.

Statuts :

* À payer
* Échéance proche
* En retard
* Payée

Prévoir des messages de relance personnalisables.

Exemple :

> Bonjour [Client], nous vous rappelons que la facture [NUMÉRO] d'un montant de [MONTANT] arrive à échéance le [DATE].

Prévoir partage WhatsApp/email.

---

# 22. TABLEAU DE BORD

Créer un dashboard moderne.

Afficher immédiatement :

* CA du mois
* montant encaissé
* montant à recevoir
* factures impayées
* devis en attente
* derniers documents
* meilleurs clients

Bouton principal :

# + Nouvelle facture

Autres boutons :

* Nouveau devis
* Nouveau reçu
* Nouveau client
* Nouveau produit

---

# 23. DESIGN UX/UI

Créer une interface :

* moderne
* professionnelle
* rapide
* minimaliste
* intuitive
* responsive

Style :

**Fintech / SaaS professionnel**

Éviter :

* interfaces surchargées
* animations inutiles
* menus complexes
* écrans trop colorés

Utiliser une hiérarchie visuelle claire.

L'application doit être utilisable par une personne non technique.

---

# 24. MOBILE FIRST

Sur Android :

Navigation simple :

* Accueil
* Documents
* Clients
* Produits
* Statistiques
* Paramètres

Bouton flottant :

**+**

Permettant :

* facture
* devis
* reçu
* bon de commande
* client
* produit

---

# 25. MODE HORS-LIGNE

Prévoir un fonctionnement offline partiel.

L'utilisateur doit pouvoir :

* consulter certaines données
* créer des factures
* consulter clients
* consulter produits

Lorsque la connexion revient :

Synchroniser automatiquement les données.

Gérer correctement :

* conflits
* doublons
* synchronisation
* erreurs réseau

---

# 26. IMPORT / EXPORT

Prévoir :

### Import

* CSV
* Excel

### Export

* CSV
* Excel
* PDF

Données exportables :

* clients
* produits
* factures
* devis
* reçus
* paiements

---

# 27. IMPRESSION

Permettre :

* impression directe
* aperçu avant impression
* A4
* génération PDF

Sur Windows, prendre en charge les imprimantes installées.

---

# 28. ABONNEMENTS ET MONÉTISATION

Construire InvoicePro comme un SaaS.

Plans :

### FREE

* nombre limité de documents
* fonctions essentielles
* branding InvoicePro

### STARTER

Exemple :

5 000 FCFA/mois

### PRO

Exemple :

15 000 FCFA/mois

### BUSINESS

Exemple :

30 000 FCFA/mois

Prévoir une architecture permettant de modifier facilement les prix.

Limiter selon le plan :

* nombre de factures
* nombre de clients
* nombre de produits
* nombre d'utilisateurs
* modèles PDF
* statistiques
* export
* fonctionnalités avancées

Prévoir période d'essai.

---

# 29. PAIEMENTS

Préparer l'architecture pour intégrer :

* Stripe
* Orange Money
* Moov Money
* Wave
* autres moyens de paiement locaux

Ne jamais stocker directement les données sensibles de carte bancaire.

---

# 30. SÉCURITÉ

Mettre en œuvre :

* authentification sécurisée
* autorisation par rôle
* isolation des entreprises
* Row Level Security
* validation côté serveur
* validation côté client
* protection contre injections
* protection XSS
* protection CSRF lorsque nécessaire
* gestion sécurisée des fichiers
* logs d'audit
* rate limiting
* sessions sécurisées

Les utilisateurs ne doivent jamais pouvoir accéder aux données d'une autre organisation.

---

# 31. RÔLES

Prévoir :

### Owner

Accès complet.

### Admin

Gestion de l'entreprise.

### Accountant

Gestion financière et documents.

### Employee

Création de documents selon permissions.

### Viewer

Consultation uniquement.

Créer un système de permissions extensible.

---

# 32. PARAMÈTRES

Créer une section Paramètres.

### Entreprise

* identité
* logo
* adresse
* fiscalité

### Facturation

* numérotation
* TVA
* conditions de paiement
* échéances

### Documents

* modèles
* logo
* couleurs
* pied de page

### Utilisateurs

* membres
* rôles
* permissions

### Notifications

* email
* relances

### Abonnement

* plan
* facturation
* consommation

---

# 33. NOTIFICATIONS

Prévoir :

* facture créée
* paiement enregistré
* devis accepté
* facture bientôt échue
* facture en retard
* abonnement proche expiration

Canaux :

* notification interne
* email

Architecture prête pour :

* push Android

---

# 34. INTERNATIONALISATION

Toutes les chaînes de texte doivent être externalisées.

Préparer :

* Français
* Anglais

Architecture prête pour :

* Arabe
* Espagnol
* Portugais
* autres langues.

---

# 35. AUDIT LOG

Enregistrer les événements importants :

* connexion
* création
* modification
* suppression
* paiement
* changement de statut
* modification des paramètres
* changement d'abonnement

Inclure :

* utilisateur
* date
* action
* document
* ancienne valeur si nécessaire
* nouvelle valeur si nécessaire

---

# 36. API

Créer une API propre et documentée.

Endpoints nécessaires :

* authentication
* organizations
* users
* clients
* products
* quotes
* invoices
* receipts
* purchase-orders
* payments
* statistics
* subscriptions
* settings

Utiliser des validations strictes.

Documenter les endpoints.

---

# 37. TESTS

Créer automatiquement :

### Tests unitaires

Pour :

* calcul TVA
* remises
* totaux
* numérotation
* conversion devis → facture

### Tests d'intégration

Tester :

* authentification
* création client
* création produit
* création facture
* paiement
* PDF

### Tests E2E

Tester le parcours complet :

Inscription
→ entreprise
→ client
→ produit
→ facture
→ PDF
→ partage
→ paiement.

Corriger toutes les erreurs détectées.

---

# 38. DONNÉES DE DÉMONSTRATION

Créer un mode/demo avec :

* entreprise fictive
* 10 clients
* 20 produits/services
* plusieurs devis
* plusieurs factures
* plusieurs reçus
* statistiques

Cela permettra de tester immédiatement l'application.

---

# 39. PERFORMANCE

L'application doit être rapide.

Objectifs :

* chargement rapide
* recherche instantanée
* pagination
* lazy loading
* optimisation des images
* cache
* requêtes PostgreSQL optimisées

Éviter les requêtes inutiles.

---

# 40. RESPONSIVE DESIGN

Tester au minimum :

### Mobile

360 px
390 px
412 px

### Tablette

768 px

### Desktop

1366 px
1920 px

---

# 41. LIVRABLES OBLIGATOIRES

À la fin du développement, fournir :

1. code source complet ;
2. structure complète du projet ;
3. base de données ;
4. migrations SQL ;
5. variables d'environnement documentées ;
6. documentation d'installation ;
7. documentation de déploiement ;
8. documentation API ;
9. tests ;
10. données de démonstration ;
11. build Android APK ;
12. build Android AAB ;
13. application Web prête à déployer ;
14. application Windows installable ;
15. icône de l'application ;
16. fichiers nécessaires au Play Store ;
17. politique de confidentialité ;
18. conditions d'utilisation ;
19. guide utilisateur ;
20. guide administrateur.

---

# 42. DÉPLOIEMENT

Préparer une architecture facilement déployable.

Web :

* Vercel ou équivalent

Backend :

* Supabase ou infrastructure équivalente

Base :

* PostgreSQL

Storage :

* Supabase Storage ou équivalent

Prévoir :

* production
* staging
* développement

Ne jamais placer les secrets dans le code source.

---

# 43. QUALITÉ DU CODE

Le code doit être :

* propre
* typé
* modulaire
* documenté lorsque nécessaire
* maintenable
* sécurisé
* scalable

Éviter :

* code dupliqué
* fonctions gigantesques
* variables inutilisées
* dépendances inutiles
* secrets dans Git
* pseudo-code
* TODO critiques non implémentés

---

# 44. CRITÈRE DE FINITION

Ne considère PAS le projet terminé simplement parce que :

* l'interface s'affiche ;
* le build fonctionne ;
* quelques boutons fonctionnent.

Le projet est terminé uniquement lorsque le parcours suivant fonctionne réellement :

INSCRIPTION
↓
CRÉATION ENTREPRISE
↓
AJOUT LOGO
↓
AJOUT CLIENT
↓
AJOUT PRODUIT
↓
CRÉATION DEVIS
↓
CONVERSION EN FACTURE
↓
CALCUL TVA
↓
APPLICATION REMISE
↓
NUMÉROTATION AUTOMATIQUE
↓
ENREGISTREMENT
↓
GÉNÉRATION PDF
↓
APERÇU
↓
TÉLÉCHARGEMENT
↓
IMPRESSION
↓
PARTAGE WHATSAPP
↓
ENREGISTREMENT PAIEMENT
↓
REÇU
↓
STATISTIQUES
↓
HISTORIQUE

Tout ce parcours doit fonctionner sans intervention manuelle dans la base de données.

---

# 45. MÉTHODE DE DÉVELOPPEMENT

Ne développe pas tout au hasard.

Travaille par phases.

## PHASE 1

Architecture + base de données.

## PHASE 2

Authentification + organisations.

## PHASE 3

Clients + produits.

## PHASE 4

Devis.

## PHASE 5

Factures.

## PHASE 6

PDF.

## PHASE 7

Reçus + paiements.

## PHASE 8

Dashboard + statistiques.

## PHASE 9

Partage WhatsApp/email.

## PHASE 10

Abonnements.

## PHASE 11

Offline/synchronisation.

## PHASE 12

Android.

## PHASE 13

Windows.

## PHASE 14

Tests.

## PHASE 15

Sécurité.

## PHASE 16

Build et déploiement.

À chaque phase :

1. implémenter ;
2. tester ;
3. corriger ;
4. vérifier les régressions ;
5. seulement ensuite passer à la phase suivante.

---

# 46. RÈGLE IMPORTANTE

Lorsque plusieurs choix techniques sont possibles, choisis la solution :

1. la plus fiable ;
2. la plus simple à maintenir ;
3. la moins coûteuse ;
4. la plus adaptée à un SaaS ;
5. la plus facilement déployable ;
6. la plus adaptée au marché africain.

Ne complexifie pas inutilement l'architecture.

---

# 47. RÈGLE UX PRINCIPALE

La fonctionnalité la plus importante est :

> CRÉER UNE FACTURE EN MOINS DE 60 SECONDES.

Chaque décision UX doit respecter cet objectif.

Le bouton **+ Nouvelle facture** doit être immédiatement visible.

Réduire au minimum le nombre de clics.

Permettre l'autocomplétion :

* client
* produit
* prix
* TVA

Mémoriser les dernières valeurs utilisées lorsque pertinent.

---

# 48. RÈGLE ABSOLUE

NE ME LIVRE PAS :

* une simple landing page ;
* une maquette ;
* des écrans statiques ;
* du pseudo-code ;
* des fonctions simulées ;
* des boutons sans logique ;
* une fausse base de données ;
* des données hardcodées ;
* des fonctionnalités "à implémenter plus tard".

Chaque fonctionnalité affichée dans l'interface doit être réellement connectée à la logique applicative et à la base de données.

Si une fonctionnalité ne peut pas être implémentée immédiatement, indique clairement pourquoi et propose une alternative fonctionnelle.

---

# 49. PREMIÈRE ACTION

Commence par :

1. analyser intégralement ce cahier des charges ;
2. identifier les éventuelles contradictions ;
3. proposer l'architecture finale ;
4. proposer l'arborescence complète du projet ;
5. proposer le schéma PostgreSQL ;
6. proposer les principaux écrans ;
7. proposer le flux utilisateur ;
8. proposer la stratégie Android/Web/Windows ;
9. proposer la stratégie de déploiement ;
10. puis commencer immédiatement l'implémentation.

Ne te contente pas de me donner des explications.

**CONSTRUIS LE PRODUIT.**

À chaque étape, donne-moi uniquement les informations nécessaires et avance jusqu'à obtenir une application InvoicePro réellement fonctionnelle et prête à être commercialisée.
