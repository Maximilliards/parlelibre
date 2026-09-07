/*
# ParleLibre — Évolution MVP : Blog, Commentaires, Notifications, Dons, Paramètres

## Contexte
Cette migration ajoute les tables nécessaires pour faire évoluer le MVP vers une version complète :
- Module blog avec catégories et tags
- Commentaires modérés sur les histoires partagées
- Commentaires directs (publication auto) sur les articles du blog
- Notifications administrateur centralisées
- Dons de soutien à montant libre
- Paramètres applicatifs configurables (prix séance, don solidaire, etc.)

## Nouvelles tables

### Blog
1. `blog_articles` — articles du blog (titre, slug, extrait, contenu, image, vidéo, statut, programmation)
2. `blog_categories` — catégories thématiques du blog
3. `blog_tags` — tags/étiquettes du blog
4. `blog_article_categories` — table de liaison article ↔ catégorie
5. `blog_article_tags` — table de liaison article ↔ tag

### Commentaires
6. `story_comments` — commentaires sur histoires partagées (modération a priori : PENDING → APPROVED/REJECTED)
7. `blog_comments` — commentaires sur articles du blog (publication auto, modération a posteriori)

### Notifications
8. `notifications` — notifications administrateur centralisées (type, message, lu/non-lu, priorité)

### Dons
9. `donations` — dons de soutien à montant libre (montant, référence, statut, donateur optionnel)

### Paramètres
10. `app_settings` — paramètres configurables de l'application (clé/valeur)

## Sécurité (RLS)

### Tables publiques en lecture (anon + authenticated)
- `blog_articles` : SELECT sur statut='publie' pour anon ; authenticated voit tout
- `blog_categories`, `blog_tags` : SELECT public
- `blog_article_categories`, `blog_article_tags` : SELECT public
- `story_comments` : SELECT sur statut='approuve' pour anon ; authenticated voit tout
- `blog_comments` : SELECT sur statut='publie' pour anon ; authenticated voit tout

### Tables publiques en écriture (anon + authenticated peuvent INSERT)
- `story_comments` : INSERT public (commentaire anonyme soumis pour modération)
- `blog_comments` : INSERT public (commentaire anonyme publié automatiquement)
- `donations` : INSERT public (don anonyme)

### Tables admin uniquement (authenticated)
- `blog_articles` : INSERT/UPDATE/DELETE authenticated
- `blog_categories`, `blog_tags` : INSERT/UPDATE/DELETE authenticated
- `blog_article_categories`, `blog_article_tags` : INSERT/UPDATE/DELETE authenticated
- `story_comments` : UPDATE/DELETE authenticated (modération)
- `blog_comments` : UPDATE/DELETE authenticated (modération a posteriori)
- `notifications` : SELECT/INSERT/UPDATE/DELETE authenticated
- `donations` : SELECT/UPDATE/DELETE authenticated
- `app_settings` : SELECT/INSERT/UPDATE/DELETE authenticated

## Notes importantes
1. Le don solidaire est désactivé par défaut via app_settings (solidarity_donation_enabled = false)
2. Les commentaires de blog sont publiés automatiquement (statut='publie' par défaut)
3. Les commentaires d'histoires nécessitent une modération (statut='en_attente' par défaut)
4. Aucune table existante n'est modifiée ou supprimée
5. Les slugs d'articles sont uniques pour le routage public
*/

-- ============================================================
-- BLOG : ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  slug text NOT NULL UNIQUE,
  extrait text,
  contenu text NOT NULL,
  image_url text,
  video_url text,
  youtube_id text,
  statut text NOT NULL DEFAULT 'brouillon',
  published_at timestamptz,
  scheduled_for timestamptz,
  author_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_articles DROP CONSTRAINT IF EXISTS blog_articles_statut_check;
ALTER TABLE blog_articles ADD CONSTRAINT blog_articles_statut_check
  CHECK (statut IN ('brouillon', 'publie', 'programme', 'archive'));

ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_published_articles" ON blog_articles;
CREATE POLICY "anon_select_published_articles" ON blog_articles FOR SELECT
  TO anon USING (statut = 'publie');

DROP POLICY IF EXISTS "auth_select_articles" ON blog_articles;
CREATE POLICY "auth_select_articles" ON blog_articles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_articles" ON blog_articles;
CREATE POLICY "auth_insert_articles" ON blog_articles FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_articles" ON blog_articles;
CREATE POLICY "auth_update_articles" ON blog_articles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_articles" ON blog_articles;
CREATE POLICY "auth_delete_articles" ON blog_articles FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_statut ON blog_articles(statut);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON blog_articles(published_at DESC);

-- ============================================================
-- BLOG : CATÉGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blog_categories" ON blog_categories;
CREATE POLICY "anon_select_blog_categories" ON blog_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_blog_categories" ON blog_categories;
CREATE POLICY "auth_insert_blog_categories" ON blog_categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_blog_categories" ON blog_categories;
CREATE POLICY "auth_update_blog_categories" ON blog_categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_blog_categories" ON blog_categories;
CREATE POLICY "auth_delete_blog_categories" ON blog_categories FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- BLOG : TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blog_tags" ON blog_tags;
CREATE POLICY "anon_select_blog_tags" ON blog_tags FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_blog_tags" ON blog_tags;
CREATE POLICY "auth_insert_blog_tags" ON blog_tags FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_blog_tags" ON blog_tags;
CREATE POLICY "auth_update_blog_tags" ON blog_tags FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_blog_tags" ON blog_tags;
CREATE POLICY "auth_delete_blog_tags" ON blog_tags FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- BLOG : LIAISON ARTICLE ↔ CATÉGORIE
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_article_categories (
  article_id uuid NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

ALTER TABLE blog_article_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_article_categories" ON blog_article_categories;
CREATE POLICY "anon_select_article_categories" ON blog_article_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_article_categories" ON blog_article_categories;
CREATE POLICY "auth_insert_article_categories" ON blog_article_categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_article_categories" ON blog_article_categories;
CREATE POLICY "auth_delete_article_categories" ON blog_article_categories FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- BLOG : LIAISON ARTICLE ↔ TAG
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_article_tags (
  article_id uuid NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

ALTER TABLE blog_article_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_article_tags" ON blog_article_tags;
CREATE POLICY "anon_select_article_tags" ON blog_article_tags FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_article_tags" ON blog_article_tags;
CREATE POLICY "auth_insert_article_tags" ON blog_article_tags FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_article_tags" ON blog_article_tags;
CREATE POLICY "auth_delete_article_tags" ON blog_article_tags FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- COMMENTAIRES D'HISTOIRES (modération a priori)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  auteur_nom text NOT NULL DEFAULT 'Anonyme',
  contenu text NOT NULL,
  contenu_publie text,
  statut text NOT NULL DEFAULT 'en_attente',
  motif_refus text,
  moderated_by text,
  moderated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE story_comments DROP CONSTRAINT IF EXISTS story_comments_statut_check;
ALTER TABLE story_comments ADD CONSTRAINT story_comments_statut_check
  CHECK (statut IN ('en_attente', 'approuve', 'refuse', 'supprime'));

ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_approved_story_comments" ON story_comments;
CREATE POLICY "anon_select_approved_story_comments" ON story_comments FOR SELECT
  TO anon USING (statut = 'approuve');

DROP POLICY IF EXISTS "auth_select_story_comments" ON story_comments;
CREATE POLICY "auth_select_story_comments" ON story_comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_story_comments" ON story_comments;
CREATE POLICY "anon_insert_story_comments" ON story_comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_story_comments" ON story_comments;
CREATE POLICY "auth_update_story_comments" ON story_comments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_story_comments" ON story_comments;
CREATE POLICY "auth_delete_story_comments" ON story_comments FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_story_comments_message_id ON story_comments(message_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_statut ON story_comments(statut);

-- ============================================================
-- COMMENTAIRES DE BLOG (publication auto, modération a posteriori)
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  auteur_nom text NOT NULL DEFAULT 'Anonyme',
  contenu text NOT NULL,
  statut text NOT NULL DEFAULT 'publie',
  moderated_by text,
  moderated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_comments DROP CONSTRAINT IF EXISTS blog_comments_statut_check;
ALTER TABLE blog_comments ADD CONSTRAINT blog_comments_statut_check
  CHECK (statut IN ('publie', 'masque', 'supprime'));

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_published_blog_comments" ON blog_comments;
CREATE POLICY "anon_select_published_blog_comments" ON blog_comments FOR SELECT
  TO anon USING (statut = 'publie');

DROP POLICY IF EXISTS "auth_select_blog_comments" ON blog_comments;
CREATE POLICY "auth_select_blog_comments" ON blog_comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blog_comments" ON blog_comments;
CREATE POLICY "anon_insert_blog_comments" ON blog_comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_blog_comments" ON blog_comments;
CREATE POLICY "auth_update_blog_comments" ON blog_comments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_blog_comments" ON blog_comments;
CREATE POLICY "auth_delete_blog_comments" ON blog_comments FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_comments_article_id ON blog_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_statut ON blog_comments(statut);

-- ============================================================
-- NOTIFICATIONS ADMINISTRATEUR
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  target_id uuid,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_priority_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check
  CHECK (priority IN ('normal', 'haute', 'urgente'));

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_notifications" ON notifications;
CREATE POLICY "auth_select_notifications" ON notifications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_notifications" ON notifications;
CREATE POLICY "auth_insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_notifications" ON notifications;
CREATE POLICY "auth_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_notifications" ON notifications;
CREATE POLICY "auth_delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================================
-- DONS DE SOUTIEN
-- ============================================================
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  reference text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  method text,
  donor_name text,
  donor_email text,
  payment_type text NOT NULL DEFAULT 'donation',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_status_check
  CHECK (status IN ('pending', 'paid', 'failed', 'cancelled'));

ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_payment_type_check;
ALTER TABLE donations ADD CONSTRAINT donations_payment_type_check
  CHECK (payment_type IN ('donation', 'solidarity'));

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_donations" ON donations;
CREATE POLICY "anon_insert_donations" ON donations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_donations" ON donations;
CREATE POLICY "auth_select_donations" ON donations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_donations" ON donations;
CREATE POLICY "auth_update_donations" ON donations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_donations" ON donations;
CREATE POLICY "auth_delete_donations" ON donations FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_payment_type ON donations(payment_type);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- ============================================================
-- PARAMÈTRES APPLICATIFS
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_settings" ON app_settings;
CREATE POLICY "auth_select_settings" ON app_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_settings" ON app_settings;
CREATE POLICY "auth_insert_settings" ON app_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_settings" ON app_settings;
CREATE POLICY "auth_update_settings" ON app_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_settings" ON app_settings;
CREATE POLICY "auth_delete_settings" ON app_settings FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- DONNÉES PAR DÉFAUT
-- ============================================================
INSERT INTO app_settings (key, value, description) VALUES
  ('session_price_fcfa', '5000', 'Prix d''une séance d''écoute en FCFA'),
  ('session_duration_minutes', '45', 'Durée d''une séance en minutes'),
  ('usd_conversion_rate', '0.00165', 'Taux de conversion FCFA vers USD pour affichage'),
  ('solidarity_donation_enabled', 'false', 'Activer le don solidaire (offrir une écoute à autrui)'),
  ('whatsapp_admin_number', '', 'Numéro WhatsApp de l''administrateur pour les notifications')
ON CONFLICT (key) DO NOTHING;

-- Catégories de blog par défaut
INSERT INTO blog_categories (nom, slug) VALUES
  ('Solitude', 'solitude'),
  ('Deuil', 'deuil'),
  ('Rupture', 'rupture'),
  ('Stress', 'stress'),
  ('Pression scolaire', 'pression-scolaire'),
  ('Difficultés professionnelles', 'difficultes-professionnelles'),
  ('Problèmes familiaux', 'problemes-familiaux'),
  ('Estime de soi', 'estime-de-soi'),
  ('Relations', 'relations'),
  ('Reconstruction', 'reconstruction'),
  ('Isolement', 'isolement'),
  ('Besoin de parler', 'besoin-de-parler')
ON CONFLICT (slug) DO NOTHING;