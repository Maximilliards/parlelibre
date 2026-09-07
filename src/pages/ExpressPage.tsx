import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MESSAGE_CATEGORIES } from '@/lib/types';
import { Send, CheckCircle2, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

export function ExpressPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [allowPublication, setAllowPublication] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    title.trim() && category && message.trim().length >= 20 && allowPublication !== null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from('messages').insert({
      titre: title.trim(),
      categorie: category,
      contenu_original: message.trim(),
      publication_autorisee: allowPublication,
      statut: allowPublication ? 'en_attente' : 'prive',
    });

    if (!error) {
      const SENSITIVE_KEYWORDS = ['suicide', 'suicidaire', 'mourir', 'tuer', 'fin de vie', 'auto-mutilation', 'automutilation', 'viol', 'agression', 'maltraitance', 'danger de mort', 'envie de disparaître', 'en finir'];
      const lowerMessage = message.toLowerCase();
      const isSensitive = SENSITIVE_KEYWORDS.some((kw) => lowerMessage.includes(kw));

      if (isSensitive) {
        await supabase.from('messages').update({ is_sensitive: true }).eq('titre', title.trim());
        await supabase.from('notifications').insert({
          type: 'sensitive_alert',
          message: `Situation potentiellement critique : « ${title.trim()} »`,
          priority: 'urgente',
        });
      }

      await supabase.from('notifications').insert({
        type: allowPublication ? 'new_story_pending' : 'new_private_message',
        message: allowPublication
          ? `Nouvelle histoire à modérer : « ${title.trim()} »`
          : `Nouveau message privé : « ${title.trim()} »`,
        priority: 'normal',
      });
    }

    setSubmitting(false);
    if (error) {
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-20">
          <div className="max-w-xl mx-auto card p-10 text-center animate-scale-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-stone-900">
              Votre message a bien été déposé
            </h1>
            <p className="mt-3 text-stone-600 leading-relaxed">
              Merci de votre confiance. Votre message est traité en toute confidentialité.
              {allowPublication
                ? " Il sera examiné par notre équipe avant une éventuelle publication anonymisée."
                : " Il restera strictement privé et ne sera jamais publié."}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setTitle('');
                  setCategory('');
                  setMessage('');
                  setAllowPublication(null);
                }}
                className="btn-secondary"
              >
                Déposer un autre message
              </button>
              <a href="#/" className="btn-primary">
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="badge bg-teal-100 text-teal-800">Expression libre</span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              Déposez ce que vous traversez
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">
              Cet espace est confidentiel. Vous pouvez écrire sans inscription, anonymement. Vos
              mots ne seront jamais publiés sans votre autorisation explicite.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={onSubmit} className="card p-6 sm:p-8 space-y-6">
            <div>
              <label className="label" htmlFor="title">Titre de votre message</label>
              <input
                id="title"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="En quelques mots, ce que vous vivez"
                maxLength={120}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="category">Catégorie</label>
              <select
                id="category"
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>Choisissez une catégorie</option>
                {MESSAGE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="message">Votre message</label>
              <textarea
                id="message"
                className="input resize-y min-h-[180px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez librement. Personne ne vous jugera ici."
                minLength={20}
                required
              />
              <p className="mt-1.5 text-xs text-stone-500">
                {message.length} caractères (minimum 20)
              </p>
            </div>

            <div className="rounded-xl bg-stone-50 border border-stone-200 p-5">
              <p className="text-sm font-medium text-stone-800">
                Acceptez-vous que votre message soit publié anonymement sur ParleLibre afin d'aider d'autres personnes vivant une situation similaire ?
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Si oui, votre message pourra être publié anonymement après validation et correction par notre
                équipe. Si non, il restera strictement privé.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setAllowPublication(true)}
                  className={`btn flex-1 ${
                    allowPublication === true
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  } border`}
                >
                  Oui, autoriser la publication
                </button>
                <button
                  type="button"
                  onClick={() => setAllowPublication(false)}
                  className={`btn flex-1 ${
                    allowPublication === false
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  } border`}
                >
                  Non, rester privé
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}

            <button type="submit" disabled={!canSubmit || submitting} className="btn-primary w-full">
              {submitting ? 'Envoi en cours...' : 'Déposer mon message'}
              {!submitting && <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-teal-700">
              <Lock className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Confidentialité</h3>
            </div>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Votre message est stocké de façon sécurisée. Seule l'équipe de modération y a accès.
              Aucune information personnelle n'est collectée.
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Sans jugement</h3>
            </div>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Vous pouvez tout déposer ici. Vos mots sont les bienvenus, tels qu'ils sont.
            </p>
          </div>
          <div className="card p-5 border-amber-200 bg-amber-50/50">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Situation difficile ?</h3>
            </div>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Si vous êtes en danger immédiat, ParleLibre ne remplace pas les services d'urgence.
              Contactez le SAMU ou une ligne d'écoute d'urgence.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
