import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from '@/lib/router';
import {
  MessageSquareHeart,
  CalendarHeart,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Newspaper,
  Bell,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/types';

interface Stats {
  pendingMessages: number;
  publishedMessages: number;
  privateMessages: number;
  upcomingBookings: number;
  paidPayments: number;
  revenue: number;
  sensitiveCount: number;
  pendingComments: number;
  publishedArticles: number;
  draftArticles: number;
  totalDonations: number;
  donationsCount: number;
  unreadNotifications: number;
}

interface RecentBooking {
  id: string;
  client_name: string;
  session_date: string;
  session_start: string;
  status: string;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pendingRes, publishedRes, privateRes, bookRes, payRes, sensRes, commentRes, artPubRes, artDraftRes, donRes, notifRes] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('statut', 'en_attente'),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('statut', 'publie'),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('statut', 'prive'),
        supabase.from('bookings').select('id, client_name, session_date, session_start, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('payments').select('amount, status'),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_sensitive', true),
        supabase.from('story_comments').select('id', { count: 'exact', head: true }).eq('statut', 'en_attente'),
        supabase.from('blog_articles').select('id', { count: 'exact', head: true }).eq('statut', 'publie'),
        supabase.from('blog_articles').select('id', { count: 'exact', head: true }).eq('statut', 'brouillon'),
        supabase.from('donations').select('amount, status'),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      const upcoming = (bookRes.data ?? []).filter((b) => b.session_date >= today).length;
      const paidPayments = (payRes.data ?? []).filter((p: { status: string }) => p.status === 'paid');
      const revenue = paidPayments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
      const paidDonations = (donRes.data ?? []).filter((d: { status: string }) => d.status === 'paid');
      const totalDonations = paidDonations.reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);

      setStats({
        pendingMessages: pendingRes.count ?? 0,
        publishedMessages: publishedRes.count ?? 0,
        privateMessages: privateRes.count ?? 0,
        upcomingBookings: upcoming,
        paidPayments: paidPayments.length,
        revenue,
        sensitiveCount: sensRes.count ?? 0,
        pendingComments: commentRes.count ?? 0,
        publishedArticles: artPubRes.count ?? 0,
        draftArticles: artDraftRes.count ?? 0,
        totalDonations,
        donationsCount: paidDonations.length,
        unreadNotifications: notifRes.count ?? 0,
      });
      setRecentBookings((bookRes.data ?? []) as RecentBooking[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-stone-500 text-sm">Chargement du tableau de bord...</p>;
  }

  const cards = [
    { label: 'Messages en attente', value: stats?.pendingMessages ?? 0, icon: MessageSquareHeart, to: '/admin/messages', iconClass: 'bg-teal-50 text-teal-700' },
    { label: 'Commentaires à modérer', value: stats?.pendingComments ?? 0, icon: MessageCircle, to: '/admin/commentaires', iconClass: 'bg-amber-50 text-amber-700' },
    { label: 'Séances à venir', value: stats?.upcomingBookings ?? 0, icon: CalendarHeart, to: '/admin/seances', iconClass: 'bg-sage-50 text-sage-700' },
    { label: 'Notifications non lues', value: stats?.unreadNotifications ?? 0, icon: Bell, to: '/admin/notifications', iconClass: 'bg-red-50 text-red-600' },
    { label: 'Articles publiés', value: stats?.publishedArticles ?? 0, icon: Newspaper, to: '/admin/blog', iconClass: 'bg-teal-50 text-teal-700' },
    { label: 'Dons reçus', value: stats?.donationsCount ?? 0, icon: Heart, to: '/admin/dons', iconClass: 'bg-rose-50 text-rose-600' },
    { label: 'Paiements payés', value: stats?.paidPayments ?? 0, icon: CreditCard, to: '/admin/paiements', iconClass: 'bg-teal-50 text-teal-700' },
    { label: 'Messages publiés', value: stats?.publishedMessages ?? 0, icon: MessageSquareHeart, to: '/admin/messages', iconClass: 'bg-sage-50 text-sage-700' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900">Tableau de bord</h1>
        <p className="text-sm text-stone-600 mt-1">Vue d'ensemble de l'activité ParleLibre.</p>
      </div>

      {stats && stats.sensitiveCount > 0 && (
        <Link
          to="/admin/situations"
          className="block card p-5 border-amber-300 bg-amber-50 hover:bg-amber-100/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                {stats.sensitiveCount} message(s) sensible(s) signalé(s)
              </p>
              <p className="text-xs text-amber-700">À traiter en priorité. Cliquez pour consulter.</p>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-700" />
          </div>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconClass}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500" />
            </div>
            <p className="mt-4 font-display text-3xl font-semibold text-stone-900">{c.value}</p>
            <p className="text-sm text-stone-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-stone-900">Réservations récentes</h2>
            <Link to="/admin/seances" className="text-sm text-teal-700 hover:text-teal-800">
              Tout voir
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-stone-500 py-8 text-center">Aucune réservation pour le moment.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentBookings.map((b) => (
                <li key={b.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{b.client_name}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(b.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {b.session_start.slice(0, 5)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <h2 className="font-display text-lg font-semibold text-stone-900">Revenus</h2>
          </div>
          <p className="font-display text-3xl font-semibold text-teal-700">
            {formatPrice(stats?.revenue ?? 0)}
          </p>
          <p className="text-sm text-stone-500 mt-1">Total des paiements confirmés</p>
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-500">Dernière activité</p>
            <p className="text-sm text-stone-700 mt-1">
              {recentBookings[0] ? formatDateTime(recentBookings[0].session_date) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800' },
    confirmed: { label: 'Confirmée', className: 'bg-teal-100 text-teal-800' },
    cancelled: { label: 'Annulée', className: 'bg-stone-100 text-stone-600' },
    completed: { label: 'Terminée', className: 'bg-sage-100 text-sage-700' },
    paid: { label: 'Payé', className: 'bg-teal-100 text-teal-800' },
    failed: { label: 'Échec', className: 'bg-red-100 text-red-700' },
    prive: { label: 'Privé', className: 'bg-stone-100 text-stone-600' },
    en_attente: { label: 'En attente', className: 'bg-amber-100 text-amber-800' },
    publie: { label: 'Publié', className: 'bg-teal-100 text-teal-800' },
    refuse: { label: 'Refusé', className: 'bg-red-100 text-red-700' },
    archive: { label: 'Archivé', className: 'bg-stone-100 text-stone-500' },
  };
  const cfg = map[status] ?? { label: status, className: 'bg-stone-100 text-stone-600' };
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
}
