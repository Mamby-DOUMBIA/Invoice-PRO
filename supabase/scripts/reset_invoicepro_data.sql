-- INVOICEPRO — RESET COMPLET DES DONNÉES APPLICATIVES
--
-- À exécuter UNIQUEMENT dans Supabase Dashboard > SQL Editor, avec un rôle
-- administrateur. Cette opération est irréversible : elle supprime toutes les
-- organisations, documents, clients, produits, abonnements, journaux, logos
-- et comptes d'authentification InvoicePRO.
--
-- Ce script conserve volontairement le schéma, les migrations, les fonctions,
-- les politiques RLS et les tables de référence (currencies, subscription_plans).
-- Les fichiers d'autres buckets Supabase ne sont pas touchés.
--
-- Par sécurité, la phrase de confirmation ci-dessous doit rester exactement
-- "ERASE_ALL_INVOICEPRO_DATA". Ne lancez jamais ce script en production sans
-- sauvegarde exportée et validation explicite.

begin;

select set_config('app.reset_confirmation', 'ERASE_ALL_INVOICEPRO_DATA', true);

do $$
begin
  if current_setting('app.reset_confirmation', true) <> 'ERASE_ALL_INVOICEPRO_DATA' then
    raise exception 'Confirmation de réinitialisation invalide.';
  end if;
end;
$$;

-- Supprime les objets du bucket de logos avant les lignes applicatives.
delete from storage.objects where bucket_id = 'logos';

-- CASCADE supprime les données liées à chaque espace de travail : membres,
-- séquences, taxes, clients, contacts, produits, devis, factures, paiements,
-- reçus, bons de commande, notifications et audit logs.
truncate table public.organizations restart identity cascade;

-- Les profils ne dépendent pas d'une organisation. La suppression des comptes
-- Auth nettoie également leurs identités et sessions associées dans Supabase.
delete from auth.users;

commit;

-- Vérification attendue après exécution : toutes les requêtes suivantes
-- retournent 0. Elles ne modifient aucune donnée.
select
  (select count(*) from public.organizations) as organizations,
  (select count(*) from public.clients) as clients,
  (select count(*) from public.invoices) as invoices,
  (select count(*) from public.products) as products,
  (select count(*) from auth.users) as auth_users;
