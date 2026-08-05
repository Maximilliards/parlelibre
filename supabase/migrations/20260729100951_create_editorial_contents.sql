/*
# Module éditorial — table editorial_contents

## Contexte
L'administrateur doit pouvoir alimenter le site avec des contenus variés :
images, vidéos, vidéos YouTube, citations inspirantes, articles de sensibilisation,
et messages mis en avant sur la page d'accueil.

## Nouvelle table : editorial_contents
- id (uuid, PK)
- type (text) — image | video | youtube | citation | article | highlight
- titre (text)
- contenu (text) — texte de l'article ou de la citation
- media_url (text) — URL de l'image, vidéo, ou lien YouTube
- youtube_id (text) — ID de la vidéo YouTube pour l'intégration
- statut (text) — brouillon | publie
- display_order (integer) — ordre d'affichage (pour carrousels, mise en avant)
- is_featured (boolean) — mis en avant sur la page d'accueil
- created_at (timestamptz)
- updated_at (timestamptz)

## Sécurité (RLS)
- SELECT : anon + authenticated ne voient que statut='publie' ; authenticated voit tout
- INSERT / UPDATE / DELETE : authenticated uniquement
*/

CREATE TABLE IF NOT EXISTS editorial_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  titre text NOT NULL,
  contenu text,
  media_url text,
  youtube_id text,
  statut text NOT NULL DEFAULT 'brouillon',
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE editorial_contents DROP CONSTRAINT IF EXISTS editorial_contents_type_check;
ALTER TABLE editorial_contents ADD CONSTRAINT editorial_contents_type_check
  CHECK (type IN ('image', 'video', 'youtube', 'citation', 'article', 'highlight'));

ALTER TABLE editorial_contents DROP CONSTRAINT IF EXISTS editorial_contents_statut_check;
ALTER TABLE editorial_contents ADD CONSTRAINT editorial_contents_statut_check
  CHECK (statut IN ('brouillon', 'publie'));

ALTER TABLE editorial_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_published_editorial" ON editorial_contents;
CREATE POLICY "anon_select_published_editorial" ON editorial_contents FOR SELECT
  TO anon USING (statut = 'publie');

DROP POLICY IF EXISTS "auth_select_editorial" ON editorial_contents;
CREATE POLICY "auth_select_editorial" ON editorial_contents FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_editorial" ON editorial_contents;
CREATE POLICY "auth_insert_editorial" ON editorial_contents FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_editorial" ON editorial_contents;
CREATE POLICY "auth_update_editorial" ON editorial_contents FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_editorial" ON editorial_contents;
CREATE POLICY "auth_delete_editorial" ON editorial_contents FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_editorial_statut ON editorial_contents(statut);
CREATE INDEX IF NOT EXISTS idx_editorial_type ON editorial_contents(type);
CREATE INDEX IF NOT EXISTS idx_editorial_featured ON editorial_contents(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_editorial_order ON editorial_contents(display_order);
