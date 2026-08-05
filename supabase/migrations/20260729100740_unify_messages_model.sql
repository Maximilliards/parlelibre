/*
# Unification du modèle — table unique "messages"

## Contexte
Le projet ParleLibre passait d'une double entité (expressions + testimonials)
à une seule entité "Message". Un témoignage n'est plus qu'un message dont le
statut est "publie". Cette migration crée la nouvelle table, migre les
données existantes, et supprime les anciennes tables.

## Nouvelle table : messages
- id (uuid, PK)
- titre (text) — titre du message
- categorie (text) — catégorie thématique
- contenu_original (text) — texte saisi par l'utilisateur, jamais modifié
- contenu_publie (text) — version corrigée/anonymisée par l'admin, affichée publiquement
- publication_autorisee (boolean) — l'utilisateur a-t-il autorisé la publication
- statut (text) — prive | en_attente | publie | refuse | archive
- est_modifie (boolean) — le contenu a-t-il été modifié par l'admin
- publie_par (text) — email de l'admin qui a publié
- valide_le (timestamptz) — date de validation/publication
- motif_refus (text) — raison du refus éventuel
- is_sensitive (boolean) — message identifié comme sensible
- sensitive_reason (text) — motif de sensibilité
- reaction_count (integer) — nombre de réactions positives
- created_at (timestamptz)
- updated_at (timestamptz)

## Migration des données
- Les 2 lignes d'expressions sont copiées vers messages avec mapping de statut :
  - allow_publication=false → statut='prive'
  - allow_publication=true + status='received' → statut='en_attente'
  - allow_publication=true + status='reviewed' → statut='en_attente'
  - status='archived' → statut='archive'
- contenu_original = ancien champ message
- contenu_publie = NULL (pas encore publié)

## Sécurité (RLS)
- INSERT : anon + authenticated (formulaire public anonyme)
- SELECT : anon + authenticated ne voient que statut='publie' ; authenticated voit tout
  → Deux politiques SELECT distinctes (une pour anon sur publie, une pour authenticated sur tout)
- UPDATE / DELETE : authenticated uniquement

## Suppression
- Tables expressions et testimonials supprimées après migration
- Index associés supprimés
*/

-- 1. Création de la table messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  categorie text NOT NULL,
  contenu_original text NOT NULL,
  contenu_publie text,
  publication_autorisee boolean NOT NULL DEFAULT false,
  statut text NOT NULL DEFAULT 'prive',
  est_modifie boolean NOT NULL DEFAULT false,
  publie_par text,
  valide_le timestamptz,
  motif_refus text,
  is_sensitive boolean NOT NULL DEFAULT false,
  sensitive_reason text,
  reaction_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Contrainte sur le statut
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_statut_check;
ALTER TABLE messages ADD CONSTRAINT messages_statut_check
  CHECK (statut IN ('prive', 'en_attente', 'publie', 'refuse', 'archive'));

-- 3. Activer RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Politiques RLS
-- INSERT : tout le monde (soumission anonyme publique)
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- SELECT : anon ne voit que les publiés
DROP POLICY IF EXISTS "anon_select_published_messages" ON messages;
CREATE POLICY "anon_select_published_messages" ON messages FOR SELECT
  TO anon USING (statut = 'publie');

-- SELECT : authenticated voit tout
DROP POLICY IF EXISTS "auth_select_messages" ON messages;
CREATE POLICY "auth_select_messages" ON messages FOR SELECT
  TO authenticated USING (true);

-- UPDATE : authenticated uniquement
DROP POLICY IF EXISTS "auth_update_messages" ON messages;
CREATE POLICY "auth_update_messages" ON messages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- DELETE : authenticated uniquement
DROP POLICY IF EXISTS "auth_delete_messages" ON messages;
CREATE POLICY "auth_delete_messages" ON messages FOR DELETE
  TO authenticated USING (true);

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_messages_statut ON messages(statut);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_categorie ON messages(categorie);
CREATE INDEX IF NOT EXISTS idx_messages_sensitive ON messages(is_sensitive) WHERE is_sensitive = true;

-- 6. Migration des données depuis expressions
INSERT INTO messages (
  id, titre, categorie, contenu_original, contenu_publie,
  publication_autorisee, statut, est_modifie, is_sensitive,
  sensitive_reason, reaction_count, created_at, updated_at
)
SELECT
  e.id,
  e.title,
  e.category,
  e.message,
  NULL,
  e.allow_publication,
  CASE
    WHEN e.allow_publication = false THEN 'prive'
    WHEN e.status = 'archived' THEN 'archive'
    WHEN e.allow_publication = true AND e.status IN ('received', 'reviewed') THEN 'en_attente'
    ELSE 'prive'
  END,
  false,
  e.is_sensitive,
  e.sensitive_reason,
  0,
  e.created_at,
  e.updated_at
FROM expressions e
ON CONFLICT (id) DO NOTHING;

-- 7. Suppression des anciennes tables
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS expressions;
