import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message, StoryComment } from '@/lib/types';
import { MESSAGE_CATEGORIES, formatDate } from '@/lib/types';
import { SectionTitle } from '@/components/SectionTitle';
import { Modal } from '@/components/Modal';
import { Quote, Heart, Filter, MessageSquareOff, X, MessageCircle, Send } from 'lucide-react';

export function TestimonialsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [reactedIds, setReactedIds] = useState<Set<string>>(new Set());
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    supabase
      .from('messages')
      .select('id, titre, categorie, contenu_publie, reaction_count, created_at')
      .eq('statut', 'publie')
      .not('contenu_publie', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setMessages(data as Message[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeMessage) {
      setCommentSuccess(false);
      supabase
        .from('story_comments')
        .select('*')
        .eq('message_id', activeMessage.id)
        .eq('statut', 'approuve')
        .order('created_at', { ascending: false })
        .then(({ data }) => setComments((data ?? []) as StoryComment[]));
    }
  }, [activeMessage]);

  const toggleReaction = (id: string) => {
    setReactedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setMessages((ms) =>
          ms.map((m) => (m.id === id ? { ...m, reaction_count: Math.max(0, m.reaction_count - 1) } : m))
        );
      } else {
        next.add(id);
        setMessages((ms) =>
          ms.map((m) => (m.id === id ? { ...m, reaction_count: m.reaction_count + 1 } : m))
        );
        supabase
          .from('messages')
          .update({ reaction_count: (messages.find((m) => m.id === id)?.reaction_count ?? 0) + 1 })
          .eq('id', id)
          .then();
      }
      return next;
    });
  };

  const filtered =
    activeCategory === 'all'
      ? messages
      : messages.filter((m) => m.categorie === activeCategory);

  const categoryLabel = (value: string) =>
    MESSAGE_CATEGORIES.find((c) => c.value === value)?.label ?? value;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="badge bg-teal-100 text-teal-800">Histoires partagées</span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              Vous n'êtes pas seul·e
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">
              Des personnes ont accepté de partager anonymement ce qu'elles traversent. Leurs mots
              sont là pour vous rappeler que votre histoire a sa place, et qu'elle mérite d'être
              entendue.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-stone-500 flex-shrink-0" />
          <button
            onClick={() => setActiveCategory('all')}
            className={`badge transition-colors ${
              activeCategory === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tous
          </button>
          {MESSAGE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value)}
              className={`badge whitespace-nowrap transition-colors ${
                activeCategory === c.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 h-48 animate-pulse bg-stone-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <MessageSquareOff className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-stone-500">
              Aucune histoire dans cette catégorie pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <article
                key={m.id}
                onClick={() => setActiveMessage(m)}
                className="card p-6 flex flex-col animate-fade-in cursor-pointer hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center justify-between">
                  <Quote className="h-7 w-7 text-teal-300 group-hover:text-teal-400 transition-colors" />
                  <span className="badge bg-stone-100 text-stone-600 text-xs">
                    {categoryLabel(m.categorie)}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-stone-900 group-hover:text-teal-700 transition-colors">
                  {m.titre}
                </h3>
                <blockquote className="mt-2 text-sm text-stone-600 leading-relaxed flex-1 line-clamp-4">
                  {m.contenu_publie ?? m.contenu_original}
                </blockquote>
                <div className="mt-5 flex items-center justify-between">
                  <figcaption className="text-xs text-stone-500">— Anonyme</figcaption>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-teal-600 font-medium group-hover:underline">
                      Lire l'histoire
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReaction(m.id);
                      }}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        reactedIds.has(m.id)
                          ? 'text-rose-600'
                          : 'text-stone-500 hover:text-rose-500'
                      }`}
                      aria-label="Réagir à cette histoire"
                    >
                      <Heart
                        className={`h-4 w-4 ${reactedIds.has(m.id) ? 'fill-rose-500' : ''}`}
                      />
                      {m.reaction_count}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="container-page pb-8">
        <SectionTitle
          center
          title="Vous aussi, vous traversez quelque chose ?"
          subtitle="Vous pouvez déposer votre situation anonymement. Si vous le souhaitez, elle pourra devenir une histoire partagée."
        />
        <div className="mt-6 text-center">
          <a href="#/exprimer" className="btn-primary">
            Écrire librement
          </a>
        </div>
      </section>

      {/* Story detail modal */}
      <Modal
        open={!!activeMessage}
        onClose={() => setActiveMessage(null)}
        title=""
        maxWidth="max-w-2xl"
      >
        {activeMessage && (
          <div className="space-y-5">
            <button
              onClick={() => setActiveMessage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <Quote className="h-8 w-8 text-teal-400 flex-shrink-0" />
              <span className="badge bg-stone-100 text-stone-600 text-xs">
                {categoryLabel(activeMessage.categorie)}
              </span>
            </div>

            <h2 className="font-display text-2xl font-semibold text-stone-900 leading-tight">
              {activeMessage.titre}
            </h2>

            <blockquote className="text-stone-700 leading-relaxed whitespace-pre-wrap text-base">
              {activeMessage.contenu_publie ?? activeMessage.contenu_original}
            </blockquote>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <div>
                <figcaption className="text-sm text-stone-500">— Anonyme</figcaption>
                <p className="text-xs text-stone-400 mt-0.5">
                  {formatDate(activeMessage.created_at)}
                </p>
              </div>
              <button
                onClick={() => toggleReaction(activeMessage.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  reactedIds.has(activeMessage.id)
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${reactedIds.has(activeMessage.id) ? 'fill-rose-500' : ''}`}
                />
                <span className="text-sm font-medium">{activeMessage.reaction_count}</span>
              </button>
            </div>

            {/* Comments section */}
            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-display text-lg font-semibold text-stone-900 flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-teal-600" />
                Commentaires ({comments.length})
              </h3>

              {comments.length > 0 && (
                <ul className="space-y-3 mb-4">
                  {comments.map((c) => (
                    <li key={c.id} className="rounded-xl bg-stone-50 p-3">
                      <p className="text-sm text-stone-700 whitespace-pre-wrap">{c.contenu_publie ?? c.contenu}</p>
                      <p className="mt-1.5 text-xs text-stone-400">— {c.auteur_nom}</p>
                    </li>
                  ))}
                </ul>
              )}

              {commentSuccess ? (
                <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 text-sm text-teal-800">
                  Merci ! Votre commentaire a été envoyé et sera publié après modération.
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!commentText.trim()) return;
                    setCommentSubmitting(true);
                    setCommentError(null);
                    const { error } = await supabase.from('story_comments').insert({
                      message_id: activeMessage.id,
                      auteur_nom: commentName.trim() || 'Anonyme',
                      contenu: commentText.trim(),
                      statut: 'en_attente',
                    });
                    setCommentSubmitting(false);
                    if (error) {
                      setCommentError('Une erreur est survenue. Veuillez réessayer.');
                      return;
                    }
                    await supabase.from('notifications').insert({
                      type: 'new_story_comment',
                      message: `Nouveau commentaire sur l'histoire : « ${activeMessage.titre} »`,
                      priority: 'normal',
                    });
                    setCommentSuccess(true);
                    setCommentName('');
                    setCommentText('');
                    setTimeout(() => setCommentSuccess(false), 5000);
                  }}
                  className="space-y-3"
                >
                  <input
                    className="input"
                    placeholder="Votre nom (optionnel, sinon « Anonyme »)"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    maxLength={50}
                  />
                  <textarea
                    className="input resize-y min-h-[80px]"
                    placeholder="Commenter anonymement..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    minLength={5}
                    required
                  />
                  {commentError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{commentError}</p>
                  )}
                  <button type="submit" disabled={commentSubmitting || !commentText.trim()} className="btn-secondary text-sm">
                    {commentSubmitting ? 'Envoi...' : <><Send className="h-4 w-4" /> Commenter anonymement</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
