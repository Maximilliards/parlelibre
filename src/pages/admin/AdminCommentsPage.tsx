import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { StoryComment, BlogComment } from '@/lib/types';
import { formatDateTime } from '@/lib/types';
import { Modal } from '@/components/Modal';
import { StatusBadge } from './AdminDashboardPage';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  EyeOff,
  Trash2,
  Pencil,
  Save,
} from 'lucide-react';

type Tab = 'stories' | 'blog';

export function AdminCommentsPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>('stories');
  const [storyComments, setStoryComments] = useState<StoryComment[]>([]);
  const [blogComments, setBlogComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<StoryComment | null>(null);
  const [editContent, setEditContent] = useState('');

  const load = async () => {
    setLoading(true);
    if (tab === 'stories') {
      let q = supabase
        .from('story_comments')
        .select('*, messages:message_id (titre)')
        .order('created_at', { ascending: false });
      if (filter === 'en_attente') q = q.eq('statut', 'en_attente');
      else if (filter === 'approuve') q = q.eq('statut', 'approuve');
      else if (filter === 'refuse') q = q.eq('statut', 'refuse');
      const { data } = await q;
      setStoryComments((data ?? []) as StoryComment[]);
    } else {
      let q = supabase
        .from('blog_comments')
        .select('*, articles:article_id (titre)')
        .order('created_at', { ascending: false });
      if (filter === 'publie') q = q.eq('statut', 'publie');
      else if (filter === 'masque') q = q.eq('statut', 'masque');
      const { data } = await q;
      setBlogComments((data ?? []) as BlogComment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filter]);

  const logAction = async (action: string, targetType: string, targetId: string, details: Record<string, unknown>) => {
    await supabase.from('audit_log').insert({
      actor_email: session?.user?.email ?? null,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  };

  const approveStoryComment = async (c: StoryComment) => {
    await supabase
      .from('story_comments')
      .update({
        statut: 'approuve',
        contenu_publie: editContent || c.contenu,
        moderated_by: session?.user?.email ?? null,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', c.id);
    await logAction('story_comment_approved', 'story_comment', c.id, {});
    setEditing(null);
    setEditContent('');
    load();
  };

  const refuseStoryComment = async (c: StoryComment) => {
    await supabase
      .from('story_comments')
      .update({
        statut: 'refuse',
        moderated_by: session?.user?.email ?? null,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', c.id);
    await logAction('story_comment_refused', 'story_comment', c.id, {});
    load();
  };

  const deleteStoryComment = async (id: string) => {
    await supabase.from('story_comments').delete().eq('id', id);
    load();
  };

  const hideBlogComment = async (c: BlogComment) => {
    await supabase
      .from('blog_comments')
      .update({
        statut: 'masque',
        moderated_by: session?.user?.email ?? null,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', c.id);
    await logAction('blog_comment_hidden', 'blog_comment', c.id, {});
    load();
  };

  const unhideBlogComment = async (c: BlogComment) => {
    await supabase
      .from('blog_comments')
      .update({
        statut: 'publie',
        moderated_by: session?.user?.email ?? null,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', c.id);
    load();
  };

  const deleteBlogComment = async (id: string) => {
    await supabase.from('blog_comments').delete().eq('id', id);
    load();
  };

  const filteredStory = search
    ? storyComments.filter((c) => c.contenu.toLowerCase().includes(search.toLowerCase()))
    : storyComments;
  const filteredBlog = search
    ? blogComments.filter((c) => c.contenu.toLowerCase().includes(search.toLowerCase()))
    : blogComments;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900">Commentaires</h1>
        <p className="text-sm text-stone-600 mt-1">
          Modérer les commentaires d'histoires (validation a priori) et de blog (modération a posteriori).
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setTab('stories'); setFilter('all'); }}
          className={`btn text-sm ${tab === 'stories' ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
        >
          Commentaires d'histoires
        </button>
        <button
          onClick={() => { setTab('blog'); setFilter('all'); }}
          className={`btn text-sm ${tab === 'blog' ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
        >
          Commentaires de blog
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {tab === 'stories' ? (
            [
              { key: 'all', label: 'Tous' },
              { key: 'en_attente', label: 'En attente' },
              { key: 'approuve', label: 'Approuvés' },
              { key: 'refuse', label: 'Refusés' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`badge whitespace-nowrap ${filter === f.key ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                {f.label}
              </button>
            ))
          ) : (
            [
              { key: 'all', label: 'Tous' },
              { key: 'publie', label: 'Publiés' },
              { key: 'masque', label: 'Masqués' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`badge whitespace-nowrap ${filter === f.key ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                {f.label}
              </button>
            ))
          )}
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
      ) : tab === 'stories' ? (
        filteredStory.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-stone-500">Aucun commentaire d'histoire.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredStory.map((c) => (
              <li key={c.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={c.statut} />
                      <span className="text-xs text-stone-400">{formatDateTime(c.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-700">{c.contenu}</p>
                    <p className="mt-1 text-xs text-stone-400">— {c.auteur_nom}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {c.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => { setEditing(c); setEditContent(c.contenu); }}
                          className="btn text-xs bg-teal-50 text-teal-700 hover:bg-teal-100"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Corriger et approuver
                        </button>
                        <button onClick={() => refuseStoryComment(c)} className="btn text-xs bg-red-50 text-red-600 hover:bg-red-100">
                          <XCircle className="h-3.5 w-3.5" /> Refuser
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteStoryComment(c.id)} className="btn text-xs bg-stone-100 text-stone-600 hover:bg-stone-200">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : filteredBlog.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-500">Aucun commentaire de blog.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredBlog.map((c) => (
            <li key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={c.statut} />
                    <span className="text-xs text-stone-400">{formatDateTime(c.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-700">{c.contenu}</p>
                  <p className="mt-1 text-xs text-stone-400">— {c.auteur_nom}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {c.statut === 'publie' && (
                    <button onClick={() => hideBlogComment(c)} className="btn text-xs bg-amber-50 text-amber-700 hover:bg-amber-100">
                      <EyeOff className="h-3.5 w-3.5" /> Masquer
                    </button>
                  )}
                  {c.statut === 'masque' && (
                    <button onClick={() => unhideBlogComment(c)} className="btn text-xs bg-teal-50 text-teal-700 hover:bg-teal-100">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Réafficher
                    </button>
                  )}
                  <button onClick={() => deleteBlogComment(c.id)} className="btn text-xs bg-red-50 text-red-600 hover:bg-red-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal open onClose={() => { setEditing(null); setEditContent(''); }} title="Corriger et approuver" maxWidth="max-w-lg">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-stone-500">Contenu original</p>
              <p className="text-sm text-stone-500 bg-stone-100 rounded-xl p-3 mt-1">{editing.contenu}</p>
            </div>
            <div>
              <label className="label">Version à publier (anonymisée)</label>
              <textarea
                className="input resize-y min-h-[120px]"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setEditing(null); setEditContent(''); }} className="btn-ghost text-sm">Annuler</button>
              <button onClick={() => approveStoryComment(editing)} className="btn-primary text-sm">
                <Save className="h-4 w-4" /> Approuver
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
