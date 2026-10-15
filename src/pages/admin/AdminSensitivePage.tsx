import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/types';
import { MESSAGE_CATEGORIES, formatDateTime } from '@/lib/types';
import { Modal } from '@/components/Modal';
import { StatusBadge } from './AdminDashboardPage';
import {
  ShieldAlert,
  Eye,
  AlertTriangle,
  Phone,
  HeartPulse,
  Ban,
} from 'lucide-react';

export function AdminSensitivePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Message | null>(null);

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('is_sensitive', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages((data ?? []) as Message[]);
        setLoading(false);
      });
  }, []);

  const excludeFromPublication = async (id: string) => {
    await supabase
      .from('messages')
      .update({ publication_autorisee: false, statut: 'prive', updated_at: new Date().toISOString() })
      .eq('id', id);
    setActive(null);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('is_sensitive', true)
      .order('created_at', { ascending: false });
    setMessages((data ?? []) as Message[]);
  };

  const categoryLabel = (v: string) =>
    MESSAGE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-amber-600" />
          Situations sensibles
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Messages identifiés comme sensibles. À traiter en priorité, hors publication.
        </p>
      </div>

      <div className="card p-5 border-amber-200 bg-amber-50/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium">Rappel — procédure</p>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>1. Examiner le message avec attention.</li>
              <li>2. Exclure automatiquement de toute publication.</li>
              <li>3. Orienter la personne vers les ressources adaptées (SAMU, ligne d'écoute).</li>
              <li>4. Ne jamais diagnostiquer ni prescrire.</li>
            </ul>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Chargement...</p>
      ) : messages.length === 0 ? (
        <div className="card p-12 text-center">
          <HeartPulse className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-4 text-stone-500">Aucune situation sensible signalée.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="card p-5 border-amber-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge bg-amber-100 text-amber-800">
                      <ShieldAlert className="h-3 w-3" /> {m.sensitive_reason ?? 'Sensible'}
                    </span>
                    <StatusBadge status={m.statut} />
                    <span className="badge bg-stone-100 text-stone-600">{categoryLabel(m.categorie)}</span>
                  </div>
                  <h3 className="mt-2 font-medium text-stone-900">{m.titre}</h3>
                  <p className="mt-1 text-sm text-stone-600 line-clamp-2">{m.contenu_original}</p>
                  <p className="mt-2 text-xs text-stone-400">{formatDateTime(m.created_at)}</p>
                </div>
                <button onClick={() => setActive(m)} className="btn-secondary flex-shrink-0">
                  <Eye className="h-4 w-4" /> Consulter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title="Situation sensible" maxWidth="max-w-2xl">
        {active && (
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Ce message a été identifié comme sensible. Il ne doit <strong>jamais</strong> être
                publié. Orientez la personne vers les ressources adaptées.
              </p>
            </div>

            <div>
              <p className="text-xs text-stone-500">Titre</p>
              <p className="font-medium text-stone-900">{active.titre}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Message</p>
              <p className="text-sm text-stone-700 whitespace-pre-wrap bg-stone-50 rounded-xl p-4 mt-1">
                {active.contenu_original}
              </p>
            </div>

            <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
              <p className="text-sm font-medium text-stone-800 mb-2">Ressources à orienter</p>
              <ul className="space-y-2 text-sm text-stone-700">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600" /> SAMU / urgence médicale locale
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600" /> Ligne d'écoute psychologique d'urgence
                </li>
                <li className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-teal-600" /> Lieu sûr + autorités locales
                </li>
              </ul>
            </div>

            <button onClick={() => excludeFromPublication(active.id)} className="btn-danger w-full">
              <Ban className="h-4 w-4" /> Exclure définitivement de la publication
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
