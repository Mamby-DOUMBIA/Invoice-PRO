-- ============================================================
-- InvoicePro — Migration 003 : Storage Supabase
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- ============================================================

-- Créer le bucket logos (si pas déjà fait via l'interface)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
-- ON CONFLICT DO NOTHING;

-- Politique : lecture publique du bucket logos
-- CREATE POLICY "Public logos read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'logos');

-- Politique : upload uniquement pour utilisateurs authentifiés
-- CREATE POLICY "Authenticated upload logos" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'logos' AND auth.role() = 'authenticated'
--   );

-- NOTE: Configurez les buckets via l'interface Supabase > Storage
-- puis ajustez les politiques selon vos besoins.
