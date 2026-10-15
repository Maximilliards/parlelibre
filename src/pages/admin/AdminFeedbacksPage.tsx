import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Feedback, FeedbackType } from '@/lib/types';
import { FEEDBACK_TYPE_LABELS, formatDateTime } from '@/lib/types';
import { Modal } from '@/components/Modal';
import { Star, Inbox, Search, MessageSquare } from 'lucide-react';

type FilterKey = 'all' | FeedbackType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'general', label: 'Avis' },
  { key: 'bug', label: 'Bugs' },
  { key: 'feature', label: 'Idées' },
];

const TYPE_BADGE: Record<FeedbackType, string> = {
  general: 'bg-teal-50 text-teal-700',
  bug: 'bg-red-50 text-red-700',
  feature: 'bg-sage-50 text-sage-700',
};

export function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Feedback | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('type', filter);
    const { data } = await q;
    setFeedbacks((data ?? []) as Feedback[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = search
    ? feedbacks.filter(
        (f) =>
          f.message.toLowerCase().includes(search.toLowerCase()) ||
          (f.user_email ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : feedbacks;

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.filter((f) => f.rating !== null).reduce((sum, f) => sum + (f.rating ?? 0), 0) /
          Math.max(feedbacks.filter((f) => f.rating !== null).length, 1)).toFixed(1)
      : '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900">Avis & retours</h1>
        <p className="text-sm text-stone-600 mt-1">
          Les feedbacks laissés par les visiteurs via le bouton « Un avis ? ».
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-stone-500">Total des retours</p>
          <p className="mt-1 font-display text-3xl font-semibold text-stone-900">{feedbacks.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500">Note moyenne</p>
          <p className="mt-1 font-display text-3xl font-semibold text-amber-600 flex items-center gap-1">
            {avgRating}
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500">Bugs signalés</p>
          <p className="mt-1 font-display text-3xl font-semibold text-red-600">
            {feedbacks.filter((f) => f.type === 'bug').length}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`badge whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            className="input pl-9 w-full sm:w-64"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-500">Aucun retour pour le moment.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((f) => (
            <li key={f.id} className="card p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActive(f)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${TYPE_BADGE[f.type]}`}>{FEEDBACK_TYPE_LABELS[f.type]}</span>
                    {f.rating !== null && (
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-stone-700 line-clamp-2">{f.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
                    <span>{formatDateTime(f.created_at)}</span>
                    {f.user_email && <span>· {f.user_email}</span>}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title="Détail du retour"
        maxWidth="max-w-xl"
      >
        {active && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${TYPE_BADGE[active.type]}`}>{FEEDBACK_TYPE_LABELS[active.type]}</span>
              {active.rating !== null && (
                <span className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s <= active.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                    />
                  ))}
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-stone-500">Message</p>
              <p className="text-sm text-stone-700 whitespace-pre-wrap bg-stone-50 rounded-xl p-4 mt-1">
                {active.message}
              </p>
            </div>

            {active.user_email && (
              <div>
                <p className="text-xs text-stone-500">Utilisateur</p>
                <p className="text-sm text-stone-700">{active.user_email}</p>
              </div>
            )}

            <p className="text-xs text-stone-400">
              Reçu le {formatDateTime(active.created_at)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
