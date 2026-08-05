import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { BlogArticle, BlogCategory, BlogTag } from '@/lib/types';
import { Modal } from '@/components/Modal';
import { StatusBadge } from './AdminDashboardPage';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Newspaper,
  Save,
  XCircle,
  CheckCircle2,
  Calendar,
  Tag as TagIcon,
} from 'lucide-react';

export function AdminBlogPage() {
  const { session } = useAuth();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BlogArticle | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('blog_articles').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('statut', filter);
    const { data } = await q;
    setArticles((data ?? []) as BlogArticle[]);

    const [catRes, tagRes] = await Promise.all([
      supabase.from('blog_categories').select('*').order('nom'),
      supabase.from('blog_tags').select('*').order('nom'),
    ]);
    setCategories((catRes.data ?? []) as BlogCategory[]);
    setTags((tagRes.data ?? []) as BlogTag[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = search
    ? articles.filter((a) => a.titre.toLowerCase().includes(search.toLowerCase()))
    : articles;

  const remove = async (id: string) => {
    await supabase.from('blog_articles').delete().eq('id', id);
    load();
  };

  const togglePublish = async (article: BlogArticle) => {
    const newStatus = article.statut === 'publie' ? 'brouillon' : 'publie';
    await supabase
      .from('blog_articles')
      .update({
        statut: newStatus,
        published_at: newStatus === 'publie' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900">Blog</h1>
          <p className="text-sm text-stone-600 mt-1">
            Créer, modifier, publier et programmer des articles.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Nouvel article
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'brouillon', label: 'Brouillons' },
            { key: 'publie', label: 'Publiés' },
            { key: 'programme', label: 'Programmés' },
            { key: 'archive', label: 'Archivés' },
          ].map((f) => (
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
          <Newspaper className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-500">Aucun article.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => (
            <li key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={a.statut} />
                    {a.published_at && (
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(a.published_at).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    {a.scheduled_for && (
                      <span className="badge bg-amber-100 text-amber-800 text-xs">
                        Programmé : {new Date(a.scheduled_for).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-medium text-stone-900">{a.titre}</h3>
                  {a.extrait && (
                    <p className="mt-1 text-sm text-stone-600 line-clamp-2">{a.extrait}</p>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setEditing(a)} className="btn-ghost text-xs">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </button>
                  <button
                    onClick={() => togglePublish(a)}
                    className="btn text-xs bg-teal-50 text-teal-700 hover:bg-teal-100"
                  >
                    {a.statut === 'publie' ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    {a.statut === 'publie' ? 'Dépublier' : 'Publier'}
                  </button>
                  <button onClick={() => remove(a.id)} className="btn text-xs bg-red-50 text-red-600 hover:bg-red-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(editing || creating) && (
        <ArticleEditor
          article={editing}
          categories={categories}
          tags={tags}
          authorEmail={session?.user?.email ?? null}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function ArticleEditor({
  article,
  categories,
  tags,
  authorEmail,
  onClose,
  onSaved,
}: {
  article: BlogArticle | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  authorEmail: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [titre, setTitre] = useState(article?.titre ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [extrait, setExtrait] = useState(article?.extrait ?? '');
  const [contenu, setContenu] = useState(article?.contenu ?? '');
  const [imageUrl, setImageUrl] = useState(article?.image_url ?? '');
  const [videoUrl, setVideoUrl] = useState(article?.video_url ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(article?.youtube_id ? `https://youtube.com/watch?v=${article.youtube_id}` : '');
  const [statut, setStatut] = useState(article?.statut ?? 'brouillon');
  const [scheduledFor, setScheduledFor] = useState(article?.scheduled_for ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (article) {
      Promise.all([
        supabase.from('blog_article_categories').select('category_id').eq('article_id', article.id),
        supabase.from('blog_article_tags').select('tag_id').eq('article_id', article.id),
      ]).then(([catRes, tagRes]) => {
        setSelectedCategories((catRes.data ?? []).map((r: { category_id: string }) => r.category_id));
        setSelectedTags((tagRes.data ?? []).map((r: { tag_id: string }) => r.tag_id));
      });
    }
  }, [article]);

  const canSave = titre.trim().length > 0 && contenu.trim().length > 0;

  const save = async () => {
    if (!canSave) return;
    const finalSlug = slug || slugify(titre);
    const youtubeId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;

    const payload = {
      titre: titre.trim(),
      slug: finalSlug,
      extrait: extrait.trim() || null,
      contenu: contenu.trim(),
      image_url: imageUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      youtube_id: youtubeId,
      statut,
      scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      published_at: statut === 'publie' ? (article?.published_at ?? new Date().toISOString()) : null,
      author_email: authorEmail,
      updated_at: new Date().toISOString(),
    };

    let articleId = article?.id;

    if (article) {
      await supabase.from('blog_articles').update(payload).eq('id', article.id);
    } else {
      const { data } = await supabase.from('blog_articles').insert(payload).select('id').single();
      articleId = data?.id;
    }

    if (articleId) {
      await supabase.from('blog_article_categories').delete().eq('article_id', articleId);
      if (selectedCategories.length > 0) {
        await supabase.from('blog_article_categories').insert(
          selectedCategories.map((catId) => ({ article_id: articleId, category_id: catId }))
        );
      }
      await supabase.from('blog_article_tags').delete().eq('article_id', articleId);
      if (selectedTags.length > 0) {
        await supabase.from('blog_article_tags').insert(
          selectedTags.map((tagId) => ({ article_id: articleId, tag_id: tagId }))
        );
      }
    }

    onSaved();
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <Modal open onClose={onClose} title={article ? 'Modifier l\'article' : 'Nouvel article'} maxWidth="max-w-3xl">
      <div className="space-y-5">
        <div>
          <label className="label">Titre</label>
          <input
            className="input"
            value={titre}
            onChange={(e) => {
              setTitre(e.target.value);
              if (!article) setSlug(slugify(e.target.value));
            }}
            placeholder="Titre de l'article"
          />
        </div>

        <div>
          <label className="label">Slug (URL)</label>
          <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-de-l-article" />
        </div>

        <div>
          <label className="label">Extrait</label>
          <textarea
            className="input resize-y min-h-[80px]"
            value={extrait}
            onChange={(e) => setExtrait(e.target.value)}
            placeholder="Résumé court affiché dans la liste des articles"
          />
        </div>

        <div>
          <label className="label">Contenu</label>
          <textarea
            className="input resize-y min-h-[240px]"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Corps de l'article"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Image (URL)</label>
            <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="label">Vidéo (URL directe)</label>
            <input className="input" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="label">Vidéo YouTube (URL)</label>
          <input className="input" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          {youtubeUrl && extractYouTubeId(youtubeUrl) && (
            <p className="mt-1 text-xs text-teal-600">ID détecté : {extractYouTubeId(youtubeUrl)}</p>
          )}
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><TagIcon className="h-3.5 w-3.5" /> Catégories</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`badge transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-teal-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.nom}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Tags</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`badge transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-teal-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tag.nom}
              </button>
            ))}
            {tags.length === 0 && <p className="text-xs text-stone-500">Aucun tag disponible.</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Statut</label>
            <select className="input" value={statut} onChange={(e) => setStatut(e.target.value)}>
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
              <option value="programme">Programmé</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
          {statut === 'programme' && (
            <div>
              <label className="label">Date de publication</label>
              <input
                type="datetime-local"
                className="input"
                value={scheduledFor ? scheduledFor.slice(0, 16) : ''}
                onChange={(e) => setScheduledFor(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost text-sm">Annuler</button>
          <button onClick={save} disabled={!canSave} className="btn-primary text-sm">
            <Save className="h-4 w-4" /> Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}
