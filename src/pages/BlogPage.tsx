import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { BlogArticle, BlogCategory, BlogComment } from '@/lib/types';
import { Calendar, ArrowRight, Newspaper, Clock, MessageCircle, Send, Share2, Link2, Facebook, Twitter, Check } from 'lucide-react';

export function BlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, BlogCategory[]>>({});

  useEffect(() => {
    async function load() {
      const [artRes, catRes] = await Promise.all([
        supabase
          .from('blog_articles')
          .select('*')
          .eq('statut', 'publie')
          .order('published_at', { ascending: false }),
        supabase.from('blog_categories').select('*').order('nom'),
      ]);
      setArticles((artRes.data ?? []) as BlogArticle[]);
      setCategories((catRes.data ?? []) as BlogCategory[]);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('blog_article_categories')
        .select('article_id, categories:category_id (id, nom, slug)')
        .in(
          'article_id',
          articles.map((a) => a.id)
        );
      const map: Record<string, BlogCategory[]> = {};
      (data ?? []).forEach((row: { article_id: string; categories: BlogCategory }) => {
        if (!map[row.article_id]) map[row.article_id] = [];
        map[row.article_id].push(row.categories);
      });
      setCategoryMap(map);
    }
    if (articles.length > 0) loadCategories();
  }, [articles]);

  const filtered =
    activeCategory === 'all'
      ? articles
      : articles.filter((a) => (categoryMap[a.id] ?? []).some((c) => c.id === activeCategory));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="badge bg-teal-100 text-teal-800">Blog ParleLibre</span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              Des mots pour vous accompagner
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">
              Articles, réflexions et ressources sur la solitude, le deuil, le stress, les relations
              et toutes ces épreuves que l'on traverse parfois en silence.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`badge whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tous
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`badge whitespace-nowrap transition-colors ${
                activeCategory === c.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 h-64 animate-pulse bg-stone-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-stone-500">Aucun article publié pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="card overflow-hidden flex flex-col hover:shadow-lg transition-shadow group"
              >
                {article.image_url && (
                  <div className="aspect-video overflow-hidden bg-stone-100">
                    <img
                      src={article.image_url}
                      alt={article.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  {categoryMap[article.id] && categoryMap[article.id].length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-2">
                      {categoryMap[article.id].slice(0, 2).map((cat) => (
                        <span key={cat.id} className="badge bg-teal-50 text-teal-700 text-xs">
                          {cat.nom}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="font-display text-lg font-semibold text-stone-900 group-hover:text-teal-700 transition-colors">
                    {article.titre}
                  </h2>
                  {article.extrait && (
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed line-clamp-3 flex-1">
                      {article.extrait}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''}
                    </span>
                    <span className="flex items-center gap-1 text-teal-600 font-medium group-hover:gap-2 transition-all">
                      Lire <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function BlogArticlePage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const articleUrl = article
    ? `${window.location.origin}/#/blog/${article.slug}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .eq('statut', 'publie')
        .maybeSingle();
      setArticle(data as BlogArticle | null);
      if (data) {
        const [catRes, commentRes] = await Promise.all([
          supabase
            .from('blog_article_categories')
            .select('categories:category_id (id, nom, slug)')
            .eq('article_id', data.id),
          supabase
            .from('blog_comments')
            .select('*')
            .eq('article_id', data.id)
            .eq('statut', 'publie')
            .order('created_at', { ascending: false }),
        ]);
        setCategories((catRes.data ?? []).map((r: { categories: BlogCategory }) => r.categories));
        setComments((commentRes.data ?? []) as BlogComment[]);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page py-24 flex justify-center">
        <Clock className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-page py-24 text-center">
        <Newspaper className="mx-auto h-10 w-10 text-stone-300" />
        <p className="mt-4 text-stone-500">Cet article n'existe pas ou n'est plus disponible.</p>
        <Link to="/blog" className="btn-primary mt-6">
          Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <article className="container-page py-10 max-w-3xl">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-6">
        <ArrowRight className="h-4 w-4 rotate-180" /> Retour au blog
      </Link>

      {categories.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {categories.map((cat) => (
            <span key={cat.id} className="badge bg-teal-50 text-teal-700 text-xs">
              {cat.nom}
            </span>
          ))}
        </div>
      )}

      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 leading-tight">
        {article.titre}
      </h1>

      <div className="mt-3 flex items-center justify-between gap-4">
        {article.published_at && (
          <p className="text-sm text-stone-500 flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(article.published_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        <div className="relative">
          <button
            onClick={() => setShareOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:border-teal-400 hover:text-teal-700 transition-colors"
            aria-label="Partager l'article"
          >
            <Share2 className="h-4 w-4" />
            Partager
          </button>
          {shareOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShareOpen(false)} />
              <div className="absolute right-0 mt-2 z-20 w-56 rounded-xl border border-stone-200 bg-white shadow-lg p-2 space-y-1 animate-scale-in">
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-teal-600" /> : <Link2 className="h-4 w-4 text-stone-400" />}
                  {copied ? 'Lien copié !' : 'Copier le lien'}
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.titre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Twitter className="h-4 w-4 text-sky-500" />
                  Twitter / X
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.titre + ' ' + articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.titre}
          className="mt-6 rounded-2xl w-full max-h-96 object-cover"
        />
      )}

      {article.extrait && (
        <p className="mt-6 text-lg text-stone-700 leading-relaxed font-medium border-l-4 border-teal-500 pl-4">
          {article.extrait}
        </p>
      )}

      <div
        className="mt-8 article-content text-stone-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.contenu }}
      />

      {article.youtube_id && (
        <div className="mt-8 aspect-video rounded-2xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${article.youtube_id}`}
            title={article.titre}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      )}

      {article.video_url && (
        <video src={article.video_url} controls className="mt-8 rounded-2xl w-full" />
      )}

      {/* Blog comments — published automatically, moderated a posteriori */}
      <div className="mt-12 pt-8 border-t border-stone-200">
        <h2 className="font-display text-xl font-semibold text-stone-900 flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-teal-600" />
          Commentaires ({comments.length})
        </h2>

        {comments.length > 0 && (
          <ul className="space-y-4 mb-6">
            {comments.map((c) => (
              <li key={c.id} className="rounded-xl bg-stone-50 p-4">
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{c.contenu}</p>
                <p className="mt-2 text-xs text-stone-400">— {c.auteur_nom}</p>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!commentText.trim() || !article) return;
            setCommentSubmitting(true);
            const { error } = await supabase.from('blog_comments').insert({
              article_id: article.id,
              auteur_nom: commentName.trim() || 'Anonyme',
              contenu: commentText.trim(),
              statut: 'publie',
            });
            if (!error) {
              await supabase.from('notifications').insert({
                type: 'new_blog_comment',
                message: `Nouveau commentaire sur l'article : « ${article.titre} »`,
                priority: 'normal',
              });
              const { data } = await supabase
                .from('blog_comments')
                .select('*')
                .eq('article_id', article.id)
                .eq('statut', 'publie')
                .order('created_at', { ascending: false });
              setComments((data ?? []) as BlogComment[]);
              setCommentName('');
              setCommentText('');
            }
            setCommentSubmitting(false);
          }}
          className="space-y-3"
        >
          <input
            className="input"
            placeholder="Votre pseudonyme (optionnel)"
            value={commentName}
            onChange={(e) => setCommentName(e.target.value)}
            maxLength={50}
          />
          <textarea
            className="input resize-y min-h-[80px]"
            placeholder="Partagez votre ressenti..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
            minLength={3}
          />
          <button type="submit" disabled={commentSubmitting || !commentText.trim()} className="btn-secondary text-sm">
            {commentSubmitting ? 'Publication...' : <><Send className="h-4 w-4" /> Publier</>}
          </button>
        </form>
      </div>
    </article>
  );
}
