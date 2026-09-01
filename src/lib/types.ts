export type MessageStatus = 'prive' | 'en_attente' | 'publie' | 'refuse' | 'archive';

export type MessageCategory =
  | 'anxiete'
  | 'deuil'
  | 'relation'
  | 'travail'
  | 'estime'
  | 'famille'
  | 'autre';

export interface Message {
  id: string;
  titre: string;
  categorie: string;
  contenu_original: string;
  contenu_publie: string | null;
  publication_autorisee: boolean;
  statut: string;
  est_modifie: boolean;
  publie_par: string | null;
  valide_le: string | null;
  motif_refus: string | null;
  is_sensitive: boolean;
  sensitive_reason: string | null;
  reaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  slot_id: string | null;
  session_date: string;
  session_start: string;
  session_end: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: string;
  whatsapp_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export type PaymentMethod = 'orange_money' | 'mtn_money' | 'notch_pay';

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string; color: string }[] = [
  { value: 'orange_money', label: 'Orange Money', description: 'Paiement via Orange Money', color: 'bg-orange-500' },
  { value: 'mtn_money', label: 'MTN Mobile Money', description: 'Paiement via MTN Mobile Money', color: 'bg-yellow-500' },
  { value: 'notch_pay', label: 'Carte bancaire', description: 'Paiement par carte bancaire via Notch Pay', color: 'bg-teal-600' },
];

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export type FeedbackType = 'bug' | 'feature' | 'general';

export interface Feedback {
  id: string;
  user_id: string | null;
  user_email: string | null;
  type: FeedbackType;
  rating: number | null;
  message: string;
  created_at: string;
}

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: 'Bug',
  feature: 'Idée',
  general: 'Avis',
};

export interface AuditLogEntry {
  id: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// ============================================================
// BLOG
// ============================================================
export type ArticleStatus = 'brouillon' | 'publie' | 'programme' | 'archive';

export interface BlogArticle {
  id: string;
  titre: string;
  slug: string;
  extrait: string | null;
  contenu: string;
  image_url: string | null;
  video_url: string | null;
  youtube_id: string | null;
  statut: string;
  published_at: string | null;
  scheduled_for: string | null;
  author_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  nom: string;
  slug: string;
}

export interface BlogTag {
  id: string;
  nom: string;
  slug: string;
}

export interface BlogArticleWithRelations extends BlogArticle {
  categories: BlogCategory[];
  tags: BlogTag[];
}

export const ARTICLE_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  programme: 'Programmé',
  archive: 'Archivé',
};

// ============================================================
// COMMENTAIRES
// ============================================================
export interface StoryComment {
  id: string;
  message_id: string;
  auteur_nom: string;
  contenu: string;
  contenu_publie: string | null;
  statut: string;
  motif_refus: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  article_id: string;
  auteur_nom: string;
  contenu: string;
  statut: string;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
}

export const STORY_COMMENT_STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  approuve: 'Approuvé',
  refuse: 'Refusé',
  supprime: 'Supprimé',
};

export const BLOG_COMMENT_STATUS_LABELS: Record<string, string> = {
  publie: 'Publié',
  masque: 'Masqué',
  supprime: 'Supprimé',
};

// ============================================================
// NOTIFICATIONS
// ============================================================
export type NotificationPriority = 'normal' | 'haute' | 'urgente';

export interface Notification {
  id: string;
  type: string;
  target_id: string | null;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  new_private_message: 'Nouveau message privé',
  new_story_pending: 'Nouvelle histoire à modérer',
  new_story_comment: 'Nouveau commentaire d\'histoire',
  new_booking: 'Nouvelle réservation',
  payment_confirmed: 'Paiement confirmé',
  new_donation: 'Nouveau don',
  sensitive_alert: 'Situation potentiellement critique',
  new_blog_comment: 'Nouveau commentaire de blog',
};

// ============================================================
// DONS
// ============================================================
export type DonationStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  method: string | null;
  donor_name: string | null;
  donor_email: string | null;
  payment_type: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PARAMÈTRES
// ============================================================
export interface AppSetting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export const MESSAGE_CATEGORIES: { value: string; label: string }[] = [
  { value: 'anxiete', label: 'Anxiété, stress' },
  { value: 'deuil', label: 'Deuil, perte' },
  { value: 'relation', label: 'Relations affectives' },
  { value: 'travail', label: 'Travail, études' },
  { value: 'estime', label: 'Estime de soi' },
  { value: 'famille', label: 'Famille' },
  { value: 'autre', label: 'Autre situation' },
];

export const MESSAGE_STATUS_LABELS: Record<string, string> = {
  prive: 'Privé',
  en_attente: 'En attente',
  publie: 'Publié',
  refuse: 'Refusé',
  archive: 'Archivé',
};

export const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const DAY_NAMES_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export const SESSION_DURATION_MINUTES = 45;
export const SESSION_PRICE_FCFA = 5000;
export const WHATSAPP_NUMBER = '+237676299767';

export function formatPrice(fcfa: number): string {
  return new Intl.NumberFormat('fr-FR').format(fcfa) + ' FCFA';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}
