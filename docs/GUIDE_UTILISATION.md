# Guide d'utilisation InvoicePro

## 1. Accéder à l'application

Application en production :

- https://invoicepro-ashen-ten.vercel.app/

Parcours disponibles :

- Connexion : `/auth/login`
- Inscription : `/auth/signup`
- Mot de passe oublié : `/auth/forgot-password`
- Tableau de bord : `/dashboard`

L'application fonctionne sur ordinateur, tablette et mobile. La connexion Internet est nécessaire pour accéder à Supabase et synchroniser les données.

## 2. Créer un compte

1. Ouvrir l'application.
2. Cliquer sur **Créer un compte**.
3. Saisir le nom complet.
4. Saisir une adresse email valide.
5. Saisir un mot de passe d'au moins 8 caractères.
6. Confirmer le mot de passe.
7. Cliquer sur **Créer mon compte**.
8. Après création, l'application redirige vers l'onboarding.

Selon la configuration email de Supabase :

- si la confirmation email est désactivée, l'onboarding s'ouvre immédiatement ;
- si elle est activée, consulter l'email reçu puis ouvrir le lien de confirmation.

Ne jamais utiliser la clé `service_role` dans un navigateur ou dans un fichier `.env` préfixé par `VITE_`.

## 3. Configurer l'entreprise

L'onboarding configure l'organisation en 11 étapes. Les informations peuvent ensuite être modifiées depuis **Paramètres**.

### Étape 1 : nom de l'entreprise

Saisir le nom légal ou commercial de l'entreprise.

### Étape 2 : logo

Importer un logo PNG, JPG ou SVG de 2 Mo maximum.

### Étape 3 : adresse

Renseigner l'adresse, la ville et le pays.

### Étape 4 : téléphone

Ajouter le numéro principal de l'entreprise.

### Étape 5 : email

Ajouter l'adresse de contact de l'entreprise.

### Étape 6 : site web

Ajouter le site internet si l'entreprise en possède un.

### Étape 7 : identifiant fiscal

Saisir le NIF ou toute autre information fiscale utile.

### Étape 8 : régime fiscal

Saisir ou sélectionner le régime fiscal applicable.

### Étape 9 : devise

Choisir la devise utilisée pour les documents, par exemple XOF, EUR ou USD.

### Étape 10 : TVA par défaut

Définir le taux de TVA appliqué par défaut aux nouvelles lignes de document.

### Étape 11 : préfixes

Définir les préfixes de numérotation :

- factures ;
- devis ;
- reçus ;
- bons de commande.

Cliquer sur **Terminer** ou **Créer l'entreprise** selon l'étape affichée. L'application crée ensuite l'organisation, les séquences de numérotation et l'abonnement gratuit.

## 4. Comprendre le tableau de bord

Le tableau de bord est la vue de pilotage principale.

Il affiche :

- chiffre d'affaires ;
- montant encaissé ;
- montant à recevoir ;
- montant en retard ;
- nombre de factures émises ;
- nombre de factures payées ;
- taux de conversion des devis ;
- panier moyen ;
- évolution du chiffre d'affaires sur six mois ;
- meilleurs clients ;
- factures récentes.

Le sélecteur de période permet de choisir :

- ce mois ;
- ce trimestre ;
- cette année.

Après une création, modification, suppression, conversion ou un paiement, les indicateurs dérivés sont invalidés et rechargés automatiquement.

## 5. Créer une facture

1. Depuis le tableau de bord, cliquer sur **Nouvelle facture**.
2. Ou ouvrir **Factures** puis cliquer sur **Nouvelle facture**.
3. Sélectionner un client existant grâce à la recherche.
4. Ajouter une ou plusieurs lignes.
5. Pour chaque ligne, renseigner :
   - description ou produit ;
   - quantité ;
   - unité ;
   - prix unitaire ;
   - remise éventuelle ;
   - taux de TVA.
6. Vérifier les montants HT, TVA et TTC calculés automatiquement.
7. Renseigner la date et la date d'échéance.
8. Ajouter une référence si nécessaire.
9. Choisir le modèle PDF.
10. Ajouter les notes et conditions générales.
11. Cliquer sur **Créer la facture**.

Le numéro est attribué automatiquement par Supabase selon la séquence configurée.

## 6. Modifier ou supprimer une facture

Depuis **Factures** :

1. Ouvrir la facture concernée.
2. Cliquer sur **Modifier** pour changer le client, les lignes, les dates, le modèle ou les notes.
3. Enregistrer les modifications.
4. Pour supprimer, utiliser l'action de suppression puis confirmer.

Les totaux et les statistiques du tableau de bord sont recalculés après la mutation réussie.

Pour une facture qui ne doit plus être utilisée mais qui doit rester traçable, privilégier l'annulation plutôt que la suppression définitive.

## 7. Visualiser, télécharger et partager un PDF

Depuis le détail d'une facture :

1. Ouvrir le visualiseur PDF.
2. Choisir l'un des modèles disponibles : Classic, Modern, Minimal ou Corporate.
3. Vérifier l'identité de l'entreprise, le client, les lignes et les totaux.
4. Télécharger le PDF.
5. Utiliser les actions de partage proposées : WhatsApp, email ou Telegram selon l'appareil et le navigateur.

Avant l'envoi à un client, vérifier la devise, la TVA, le numéro et la date d'échéance.

## 8. Créer un devis

1. Ouvrir **Devis**.
2. Cliquer sur **Nouveau devis**.
3. Sélectionner le client.
4. Ajouter les lignes et les informations du document.
5. Vérifier les totaux.
6. Enregistrer le devis.

Un devis peut ensuite être accepté, refusé ou converti en facture selon les actions disponibles dans son détail.

Lorsqu'un devis est converti :

- une facture est créée ;
- ses lignes et totaux sont repris ;
- le devis passe à l'état converti ;
- les listes et statistiques factures/devis sont rafraîchies.

## 9. Enregistrer un paiement

1. Ouvrir **Paiements** ou le détail d'une facture.
2. Cliquer sur l'action d'ajout de paiement.
3. Sélectionner la facture.
4. Saisir le montant.
5. Choisir le moyen de paiement : espèces, mobile money, virement, chèque, carte ou autre.
6. Saisir la date et la référence si nécessaire.
7. Ajouter une note facultative.
8. Enregistrer.

Un reçu est automatiquement créé pour le paiement. Le dashboard, la facture, les reçus et les statistiques sont ensuite rechargés.

## 10. Gérer les clients

Depuis **Clients** :

1. Cliquer sur **Nouveau client**.
2. Renseigner le nom et les coordonnées.
3. Ajouter les informations facultatives : société, téléphone, WhatsApp, email, adresse et identifiant fiscal.
4. Enregistrer.
5. Utiliser la recherche pour retrouver un client.
6. Ouvrir sa fiche pour consulter ses statistiques.
7. Modifier ou supprimer le client si nécessaire.

La suppression d'un client peut être limitée par les relations existantes avec des documents. Dans ce cas, conserver le client et le désactiver est généralement préférable.

## 11. Gérer les produits et services

Depuis **Produits & Services** :

1. Cliquer sur **Nouveau produit**.
2. Choisir produit ou service.
3. Saisir le nom, la description, le SKU, la catégorie et le prix HT.
4. Définir l'unité et le taux de taxe par défaut.
5. Enregistrer.
6. Utiliser l'autocomplétion dans les lignes de facture ou devis.

Les modifications du catalogue sont disponibles dans les prochains formulaires de document après rafraîchissement des données.

## 12. Gérer les bons de commande

Depuis **Bons de commande** :

1. Cliquer sur **Nouveau BC** ou **Nouveau bon de commande** dans l'état vide.
2. Sélectionner éventuellement un client.
3. Saisir la date.
4. Saisir une date prévue facultative.
5. Ajouter une référence et des notes si nécessaire.
6. Cliquer sur **Créer le bon de commande**.

Le bon est enregistré comme brouillon.

> État actuel : la création est disponible. La liste détaillée, la modification, le détail PDF et les transitions de statut des bons de commande font partie de la roadmap de finalisation.

## 13. Consulter les reçus

Depuis **Reçus** :

1. Ouvrir la liste des reçus.
2. Rechercher le reçu correspondant à un paiement.
3. Vérifier la facture, le client, le montant et le moyen de paiement.
4. Utiliser les actions de consultation ou de partage disponibles.

Les reçus sont générés automatiquement lorsqu'un paiement est enregistré.

## 14. Consulter les statistiques

Depuis **Statistiques** :

1. Choisir la période souhaitée.
2. Consulter les revenus, paiements, impayés et tendances.
3. Comparer les clients et les documents.
4. Revenir au dashboard pour la vue synthétique.

Les résultats sont recalculés après les mutations de documents et de paiements.

## 15. Consulter l'historique

Depuis **Historique** :

1. Ouvrir la page d'historique.
2. Parcourir les événements et documents.
3. Cliquer sur un élément pour ouvrir le document concerné lorsque le lien est disponible.

L'historique sert à retrouver rapidement les actions et documents récents.

## 16. Paramètres et mode sombre

Depuis **Paramètres** :

- modifier les informations de l'entreprise ;
- ajuster la devise et la TVA ;
- personnaliser les documents ;
- gérer les préfixes et séquences ;
- consulter les informations d'abonnement.

La sidebar permet de basculer entre mode clair et mode sombre. Le choix est conservé localement dans le navigateur.

## 17. Navigation mobile

Sur mobile :

- la barre inférieure donne accès à l'accueil, aux documents, aux clients, aux statistiques et aux paramètres ;
- le bouton flottant permet d'accéder rapidement aux créations principales ;
- la sidebar desktop est remplacée par une navigation adaptée à l'écran étroit.

## 18. Déconnexion

1. Ouvrir la sidebar.
2. Cliquer sur **Déconnexion**.
3. Attendre le retour vers la page de connexion.

Ne pas partager une session ouverte sur un ordinateur public.

## 19. Résolution des problèmes courants

### L'écran reste sur « Chargement »

1. Vérifier la connexion Internet.
2. Recharger la page.
3. Vérifier que Supabase est disponible.
4. Effacer les données de site si une ancienne session est corrompue.
5. Se reconnecter.

L'application possède un délai de sécurité pour éviter un chargement infini, mais une panne Supabase peut empêcher la récupération des données.

### Le dashboard n'affiche pas immédiatement une modification

1. Attendre la fin du toast de confirmation.
2. Vérifier que la mutation a réussi.
3. Recharger la page si le navigateur a perdu la connexion.
4. Vérifier que l'utilisateur travaille dans la bonne organisation.

### Google OAuth ne fonctionne pas

Le fournisseur Google doit être activé dans Supabase Authentication, avec les bonnes URLs de redirection. Si le provider est désactivé, l'application affiche un message explicite au lieu de créer une session.

### Une facture n'est pas créée

Vérifier :

- qu'un client est sélectionné ;
- qu'au moins une ligne existe ;
- que les quantités et prix sont valides ;
- que la session est toujours active ;
- que l'utilisateur dispose des droits nécessaires.

### Le PDF ne s'affiche pas

1. Recharger la page détail.
2. Vérifier les données de la facture.
3. Essayer un autre modèle PDF.
4. Vérifier les bloqueurs de popup ou de téléchargement.

## 20. Bonnes pratiques de gestion

- Utiliser un client distinct pour chaque entité facturée.
- Créer les produits et services avant de créer beaucoup de factures.
- Toujours vérifier les totaux avant partage.
- Préférer l'annulation à la suppression pour conserver la traçabilité.
- Enregistrer les paiements le jour de leur réception.
- Utiliser les références pour rapprocher les virements et mobile money.
- Sauvegarder régulièrement les PDF importants.
- Ne jamais partager ses identifiants.
