import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/types';
import { NOTIFICATION_TYPE_LABELS, formatDateTime } from '@/lib/types';
import {
  Bell,
  CheckCheck,
  Trash2,
  ShieldAlert,
  MessageSquareHeart,
  CalendarHeart,
  CreditCard,
  Heart,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

const TYPE_ICONS: Record<string, typeof Bell> = {
  new_private_message: MessageSquareHeart,
  new_story_pending: MessageSquareHeart,
  new_story_comment: MessageSquare,
  new_blog_comment: MessageSquare,
  new_booking: CalendarHeart,
  payment_confirmed: CreditCard,
  new_donation: Heart,
  sensitive_alert: ShieldAlert,
};

const PRIORITY_STYLES: Record<string, string> = {
  normal: 'border-l-stone-300',
  haute: 'border-l-amber-400',
  urgente: 'border-l-red-500',
};

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    let q = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (filter === 'unread') q = q.eq('is_read', false);
    else if (filter === 'urgente') q = q.eq('priority', 'urgente');
    const { data } = await q;
    setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    load();
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    load();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-teal-600" /> Notifications
            {unreadCount > 0 && (
              <span className="badge bg-red-100 text-red-700 text-xs">{unreadCount} non lue(s)</span>
            )}
          </h1>
          <p className="text-sm text-stone-600 mt-1">Toutes les notifications administrateur centralisées.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'unread', label: 'Non lues' },
          { key: 'urgente', label: 'Urgentes' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`badge whitespace-nowrap ${filter === f.key ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Chargement...</p>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-500">Aucune notification.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            return (
              <li
                key={n.id}
                className={`card p-4 border-l-4 ${PRIORITY_STYLES[n.priority] ?? 'border-l-stone-300'} ${
                  n.is_read ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${
                    n.priority === 'urgente' ? 'bg-red-100 text-red-600' :
                    n.priority === 'haute' ? 'bg-amber-100 text-amber-600' :
                    'bg-teal-50 text-teal-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-stone-900">
                        {NOTIFICATION_TYPE_LABELS[n.type] ?? n.type}
                      </p>
                      {n.priority === 'urgente' && (
                        <span className="badge bg-red-100 text-red-700 text-xs">
                          <AlertTriangle className="h-3 w-3" /> Urgent
                        </span>
                      )}
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-stone-600">{n.message}</p>
                    <p className="mt-1 text-xs text-stone-400">{formatDateTime(n.created_at)}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!n.is_read && (
                      <button onClick={() => markAsRead(n.id)} className="p-1.5 rounded text-stone-500 hover:bg-stone-100" title="Marquer comme lu">
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => remove(n.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
