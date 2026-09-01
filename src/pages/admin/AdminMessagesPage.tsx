import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Message } from '@/lib/types';
import { MESSAGE_CATEGORIES, MESSAGE_STATUS_LABELS, formatDateTime } from '@/lib/types';
import { StatusBadge } from './AdminDashboardPage';
import { Modal } from '@/components/Modal';
import {
  Eye,
  Search,
  Inbox,
  Lock,
  CheckCircle2,
  XCircle,
  Archive,
  Pencil,
  Eye as EyeIcon,
  Save,
  Heart,
  ShieldAlert,
} from 'lucide-react';

type FilterKey = 'all' | 'prive' | 'en_attente' | 'publie' | 'refuse' | 'archive' | 'sensitive';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'prive', label: 'Privés' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'publie', label: 'Publiés' },
  { key: 'refuse', label: 'Refusés' },
  { key: 'archive', label: 'Archivés' },
  { key: 'sensitive', label: 'Sensibles' },
];

export function AdminMessagesPage() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Message | null>(null);
  const [editing, setEditing] = useState<Message | null>(null);
  const [refusing, setRefusing] = useState<Message | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (filter === 'sensitive') q = q.eq('is_sensitive', true);
    else if (filter !== 'all') q = q.eq('statut', filter);
    const { data } = await q;
    setMessages((data ?? []) as Message[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = search
    ? messages.filter(
        (m) =>
          m.titre.toLowerCase().includes(search.toLowerCase()) ||
          m.contenu_original.toLowerCase().includes(search.toLowerCase())
      )
    : messages;

  const logAction = async (action: string, targetId: string, details: Record<string, unknown>) => {
    await supabase.from('audit_log').insert({
      actor_email: session?.user?.email ?? null,
      action,
      target_type: 'message',
      target_id: targetId,
      details,
    });
  };

  const publish = async (msg: Message) => {
    const now = new Date().toISOString();
    await supabase
      .from('messages')
      .update({
        statut: 'publie',
        valide_le: now,
        publie_par: session?.user?.email ?? null,
        contenu_publie: msg.contenu_publie ?? msg.contenu_original,
        est_modifie: msg.contenu_publie !== null && msg.contenu_publie !== msg.contenu_original,
        updated_at: now,
      })
      .eq('id', msg.id);
    await logAction('message_published', msg.id, {});
    setEditing(null);
    setActive(null);
    load();
  };

  const refuse = async (msg: Message, motif: string) => {
    const now = new Date().toISOString();
    await supabase
      .from('messages')
      .update({
        statut: 'refuse',
        motif_refus: motif,
        valide_le: now,
        publie_par: session?.user?.email ?? null,
        updated_at: now,
      })
      .eq('id', msg.id);
    await logAction('message_refused', msg.id, { motif });
    setRefusing(null);
    setActive(null);
    load();
  };

  const archive = async (id: string) => {
    await supabase
      .from('messages')
      .update({ statut: 'archive', updated_at: new Date().toISOString() })
      .eq('id', id);
    await logAction('message_archived', id, {});
    setActive(null);
    load();
  };

  const saveEdit = async (msg: Message, newContenuPublie: string, newTitre: string) => {
    await supabase
      .from('messages')
      .update({
        contenu_publie: newContenuPublie,
        titre: newTitre,
        est_modifie: newContenuPublie !== msg.contenu_original,
        updated_at: new Date().toISOString(),
      })
      .eq('id', msg.id);
    await logAction('message_edited', msg.id, {});
    setEditing(null);
    load();
  };

  const categoryLabel = (v: string) =>
    MESSAGE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900">Gestion des messages</h1>
        <p className="text-sm text-stone-600 mt-1">
          Consulter, corriger, publier, refuser ou archiver les messages reçus.
        </p>
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
          <p className="mt-4 text-stone-500">Aucun message.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => (
            <li key={m.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {m.is_sensitive && (
                      <span className="badge bg-amber-100 text-amber-800">
                        <ShieldAlert className="h-3 w-3" /> Sensible
                      </span>
                    )}
                    {!m.publication_autorisee && (
                      <span className="badge bg-stone-100 text-stone-600">
                        <Lock className="h-3 w-3" /> Privé
                      </span>
                    )}
                    <StatusBadge status={m.statut} />
                    <span className="badge bg-stone-100 text-stone-600">{categoryLabel(m.categorie)}</span>
                  </div>
                  <h3 className="mt-2 font-medium text-stone-900 truncate">{m.titre}</h3>
                  <p className="mt-1 text-sm text-stone-600 line-clamp-2">
                    {m.contenu_publie ?? m.contenu_original}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
                    <span>{formatDateTime(m.created_at)}</span>
                    {m.reaction_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {m.reaction_count}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setActive(m)} className="btn-secondary flex-shrink-0">
                  <Eye className="h-4 w-4" /> Consulter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Detail modal */}
      <Modal
        open={!!active && !editing && !refusing}
        onClose={() => setActive(null)}
        title="Détail du message"
        maxWidth="max-w-2xl"
      >
        {active && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {active.is_sensitive && (
                <span className="badge bg-amber-100 text-amber-800">
                  <ShieldAlert className="h-3 w-3" /> Sensible — {active.sensitive_reason ?? 'non précisé'}
                </span>
              )}
              {active.publication_autorisee ? (
                <span className="badge bg-teal-50 text-teal-700">
                  <CheckCircle2 className="h-3 w-3" /> Publication autorisée
                </span>
              ) : (
                <span className="badge bg-stone-100 text-stone-600">
                  <Lock className="h-3 w-3" /> Publication non autorisée
                </span>
              )}
              <StatusBadge status={active.statut} />
            </div>

            <div>
              <p className="text-xs text-stone-500">Titre</p>
              <p className="font-medium text-stone-900">{active.titre}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Catégorie</p>
              <p className="text-sm text-stone-700">{categoryLabel(active.categorie)}</p>
            </div>

            <div>
              <p className="text-xs text-stone-500">Contenu original (non modifiable)</p>
              <p className="text-sm text-stone-700 whitespace-pre-wrap bg-stone-50 rounded-xl p-4 mt-1">
                {active.contenu_original}
              </p>
            </div>

            {active.contenu_publie && active.contenu_publie !== active.contenu_original && (
              <div>
                <p className="text-xs text-stone-500">Version corrigée (affichée publiquement)</p>
                <p className="text-sm text-stone-700 whitespace-pre-wrap bg-teal-50 rounded-xl p-4 mt-1">
                  {active.contenu_publie}
                </p>
              </div>
            )}

            {active.motif_refus && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2">
                <p className="text-xs text-red-600 font-medium">Motif du refus</p>
                <p className="text-sm text-red-700 mt-1">{active.motif_refus}</p>
              </div>
            )}

            <p className="text-xs text-stone-400">
              Reçu le {formatDateTime(active.created_at)}
              {active.valide_le && ` · Validé le ${formatDateTime(active.valide_le)}`}
              {active.publie_par && ` par ${active.publie_par}`}
            </p>

            {active.publication_autorisee && active.statut !== 'publie' && active.statut !== 'archive' && (
              <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-2">
                <button
                  onClick={() => setEditing(active)}
                  className="btn-secondary text-sm"
                >
                  <Pencil className="h-4 w-4" /> Corriger et publier
                </button>
                <button
                  onClick={() => setRefusing(active)}
                  className="btn text-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" /> Refuser
                </button>
                <button
                  onClick={() => archive(active.id)}
                  className="btn-ghost text-sm"
                >
                  <Archive className="h-4 w-4" /> Archiver
                </button>
              </div>
            )}

            {active.statut === 'publie' && (
              <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-2">
                <button onClick={() => setEditing(active)} className="btn-secondary text-sm">
                  <Pencil className="h-4 w-4" /> Modifier la version publiée
                </button>
                <button onClick={() => archive(active.id)} className="btn-ghost text-sm">
                  <Archive className="h-4 w-4" /> Archiver
                </button>
              </div>
            )}

            {!active.publication_autorisee && (
              <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-2">
                <button onClick={() => archive(active.id)} className="btn-ghost text-sm">
                  <Archive className="h-4 w-4" /> Archiver
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Editor modal */}
      {editing && (
        <MessageEditor
          message={editing}
          onClose={() => setEditing(null)}
          onSave={(newContenu, newTitre) => saveEdit(editing, newContenu, newTitre)}
          onPublish={(newContenu, newTitre) => {
            const updated = { ...editing, contenu_publie: newContenu, titre: newTitre };
            saveEdit(editing, newContenu, newTitre);
            publish(updated);
          }}
        />
      )}

      {/* Refuse modal */}
      {refusing && (
        <RefuseModal
          message={refusing}
          onClose={() => setRefusing(null)}
          onConfirm={(motif) => refuse(refusing, motif)}
        />
      )}
    </div>
  );
}

function MessageEditor({
  message,
  onClose,
  onSave,
  onPublish,
}: {
  message: Message;
  onClose: () => void;
  onSave: (contenuPublie: string, titre: string) => void;
  onPublish: (contenuPublie: string, titre: string) => void;
}) {
  const [titre, setTitre] = useState(message.titre);
  const [contenuPublie, setContenuPublie] = useState(message.contenu_publie ?? message.contenu_original);
  const [preview, setPreview] = useState(false);

  return (
    <Modal open onClose={onClose} title="Correction et anonymisation" maxWidth="max-w-3xl">
      <div className="space-y-5">
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          Vous pouvez corriger les fautes, améliorer la rédaction, reformuler sans modifier le sens,
          et supprimer toute information permettant d'identifier une personne.
        </div>

        <div>
          <label className="label">Titre</label>
          <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>

        <div>
          <label className="label">Contenu original (lecture seule)</label>
          <p className="text-sm text-stone-500 whitespace-pre-wrap bg-stone-100 rounded-xl p-4 max-h-32 overflow-y-auto">
            {message.contenu_original}
          </p>
        </div>

        <div>
          <label className="label">Version à publier</label>
          <textarea
            className="input resize-y min-h-[180px]"
            value={contenuPublie}
            onChange={(e) => setContenuPublie(e.target.value)}
          />
        </div>

        {preview && (
          <div className="rounded-xl border border-stone-200 p-5 bg-stone-50">
            <p className="text-xs text-stone-500 mb-2">Aperçu public</p>
            <h3 className="font-display text-lg font-semibold text-stone-900">{titre}</h3>
            <p className="mt-2 text-sm text-stone-700 whitespace-pre-wrap">{contenuPublie}</p>
            <p className="mt-3 text-xs text-stone-500">— Anonyme</p>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2 pt-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="btn-ghost text-sm"
          >
            <EyeIcon className="h-4 w-4" /> {preview ? 'Masquer l\'aperçu' : 'Prévisualiser'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost text-sm">Annuler</button>
            <button
              onClick={() => onSave(contenuPublie, titre)}
              className="btn-secondary text-sm"
            >
              <Save className="h-4 w-4" /> Enregistrer
            </button>
            <button
              onClick={() => onPublish(contenuPublie, titre)}
              className="btn-primary text-sm"
            >
              <CheckCircle2 className="h-4 w-4" /> Publier
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function RefuseModal({
  message,
  onClose,
  onConfirm,
}: {
  message: Message;
  onClose: () => void;
  onConfirm: (motif: string) => void;
}) {
  const [motif, setMotif] = useState('');
  return (
    <Modal open onClose={onClose} title="Refuser la publication" maxWidth="max-w-lg">
      <div className="space-y-4">
        <p className="text-sm text-stone-600">
          Indiquez le motif du refus. L'utilisateur ne verra pas ce motif, mais il sera conservé
          pour référence.
        </p>
        <textarea
          className="input resize-y min-h-[100px]"
          placeholder="Ex: contenu trop personnel, informations identifiantes non supprimables, etc."
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost text-sm">Annuler</button>
          <button
            onClick={() => onConfirm(motif || 'Non précisé')}
            className="btn text-sm bg-red-600 text-white hover:bg-red-700"
          >
            <XCircle className="h-4 w-4" /> Confirmer le refus
          </button>
        </div>
      </div>
    </Modal>
  );
}
