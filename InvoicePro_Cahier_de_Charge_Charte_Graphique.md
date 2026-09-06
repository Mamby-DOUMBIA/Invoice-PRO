# CAHIER DES CHARGES — CHARTE GRAPHIQUE INVOICEPRO

## 1. Identité
**Nom :** InvoicePro  
**Positionnement :** solution moderne, rapide et professionnelle de facturation pour indépendants, commerçants et PME.  
**Promesse visuelle :** simplicité + confiance + efficacité + professionnalisme.

## 2. Direction artistique
Créer une identité **Fintech SaaS moderne**, sobre et premium, mais suffisamment chaleureuse pour le marché des PME africaines.

Principes :
- minimalisme fonctionnel
- forte lisibilité
- hiérarchie visuelle nette
- espaces généreux
- peu d'effets décoratifs
- priorité au contenu et aux montants
- design mobile-first
- cohérence parfaite Web / Android / Windows

Éviter :
- gradients excessifs
- interfaces trop « crypto »
- néons
- ombres lourdes
- surcharge graphique
- animations inutiles

## 3. Palette
### Couleurs principales
**Primary / InvoicePro Blue**
- HEX : #2563EB
- RGB : 37, 99, 235

**Primary Dark**
- HEX : #1D4ED8

**Primary Light**
- HEX : #DBEAFE

### Couleurs fonctionnelles
**Success**
- HEX : #16A34A

**Warning**
- HEX : #F59E0B

**Danger**
- HEX : #DC2626

**Info**
- HEX : #0891B2

### Neutres
**Background**
- HEX : #F8FAFC

**Surface**
- HEX : #FFFFFF

**Text Primary**
- HEX : #0F172A

**Text Secondary**
- HEX : #475569

**Border**
- HEX : #E2E8F0

**Dark Background**
- HEX : #0F172A

La palette doit rester accessible et respecter un contraste suffisant.

## 4. Typographie
### Police principale
**Inter**

Utilisations :
- navigation
- titres
- boutons
- formulaires
- tableaux
- documents

### Police chiffres / données
**DM Mono** pour :
- montants
- numéros de facture
- références
- statistiques techniques lorsque pertinent

Hiérarchie recommandée :
- H1 : 32 px / 700
- H2 : 24 px / 700
- H3 : 20 px / 600
- H4 : 16 px / 600
- Body : 14–16 px / 400
- Small : 12–13 px / 400
- Boutons : 14–15 px / 600

Adapter les tailles sur mobile.

## 5. Logo
Créer un logo :
- simple
- mémorisable
- lisible à petite taille
- reconnaissable en icône Android/Windows

Concept recommandé :
**document/facture + symbole de validation ou éclair**, évoquant facture, rapidité et fiabilité.

Prévoir :
- logo horizontal
- logo compact
- icône seule
- version claire
- version sombre
- favicon
- icône application

Ne jamais déformer le logo.

## 6. Iconographie
Utiliser une bibliothèque cohérente de type Lucide Icons ou équivalent.

Style :
- outline
- simple
- 1,5 à 2 px
- coins légèrement arrondis

Les icônes ne doivent jamais remplacer un libellé lorsque leur signification est ambiguë.

## 7. Système de composants
Créer un design system réutilisable.

Composants :
- Button
- IconButton
- Input
- Select
- Combobox
- DatePicker
- Search
- Checkbox
- Radio
- Switch
- Modal
- Drawer
- Dropdown
- Tooltip
- Toast
- Alert
- Badge
- Card
- Table
- Pagination
- Tabs
- Breadcrumb
- Empty State
- Skeleton
- Avatar
- File Upload
- Document Preview
- KPI Card

## 8. Boutons
### Primary
Action principale, notamment :
**+ Nouvelle facture**

### Secondary
Actions secondaires.

### Ghost
Actions discrètes.

### Danger
Suppression/annulation.

Les boutons doivent avoir :
- état normal
- hover
- pressed
- focus
- disabled
- loading

## 9. Navigation
### Desktop
Sidebar gauche :
- Dashboard
- Factures
- Devis
- Reçus
- Bons de commande
- Clients
- Produits & Services
- Paiements
- Statistiques
- Paramètres

CTA permanent :
**+ Nouvelle facture**

### Mobile
Bottom navigation :
- Accueil
- Documents
- Clients
- Statistiques
- Paramètres

Bouton flottant « + » pour les créations.

## 10. Dashboard
Composition :
1. Header
2. CTA Nouvelle facture
3. KPI Cards
4. Graphique principal
5. Factures récentes
6. Devis récents
7. Impayés / relances

Les montants doivent être immédiatement lisibles.

## 11. Écran création facture
Priorité absolue à la vitesse.

Structure :
- Client
- Produits/services
- lignes
- remise
- TVA
- totaux
- notes
- aperçu
- actions

Afficher en permanence :
**Total TTC**

CTA final :
**Créer la facture**

## 12. États des documents
Utiliser des badges clairement différenciés :

- Brouillon
- Envoyé
- Accepté
- Payé
- Partiellement payé
- Impayé
- En retard
- Annulé
- Expiré

Les couleurs doivent toujours être accompagnées de texte ou d'icône pour l'accessibilité.

## 13. Tableaux
- lignes aérées
- alignement numérique à droite
- montants en DM Mono
- actions contextuelles
- tri
- filtres
- pagination
- responsive avec transformation en cartes sur petit écran

## 14. Formulaires
- labels toujours visibles
- messages d'erreur explicites
- validation immédiate lorsque pertinent
- champs obligatoires clairement indiqués
- autocomplétion
- raccourcis et valeurs mémorisées

## 15. PDF
Les factures PDF doivent être visuellement distinctes mais cohérentes avec InvoicePro.

Créer 4 modèles :
1. Classic
2. Modern
3. Minimal
4. Corporate

Tous doivent conserver :
- excellente lisibilité
- logo
- identité entreprise
- client
- numéro
- date
- échéance
- lignes
- TVA
- total
- paiement
- conditions

## 16. Responsive
Breakpoints indicatifs :
- Mobile : < 640 px
- Tablet : 640–1024 px
- Desktop : > 1024 px

Ne jamais simplement réduire la version desktop : adapter réellement la hiérarchie et la navigation.

## 17. Dark mode
Prévoir un Dark Mode complet.

Le mode sombre doit utiliser :
- surfaces foncées distinctes
- texte fortement contrasté
- bordures discrètes
- couleurs fonctionnelles adaptées

Ne pas utiliser du noir pur partout.

## 18. Accessibilité
Objectifs :
- contraste WCAG AA
- navigation clavier
- focus visible
- labels accessibles
- zones tactiles adaptées au mobile
- messages d'erreur compréhensibles
- ne pas dépendre uniquement de la couleur

## 19. Animations
Animations très sobres :
- 150–250 ms
- transitions d'état
- ouverture modales/drawers
- feedback de sauvegarde
- skeleton loading

Éviter les animations décoratives.

## 20. Ton visuel
InvoicePro doit donner immédiatement une impression de :
**rapide — fiable — professionnel — simple — moderne — sécurisé.**

Le design doit être suffisamment premium pour une PME internationale, tout en restant accessible à un petit commerçant ou freelance.

## 21. Règle finale
Toute nouvelle fonctionnalité doit respecter :
- la palette
- la typographie
- les composants
- les espacements
- les états
- l'accessibilité
- la cohérence multi-plateforme.

Aucun écran ne doit introduire arbitrairement une nouvelle couleur, police, icône ou style sans justification dans le design system.
