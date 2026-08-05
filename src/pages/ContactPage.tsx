import { useState } from 'react';
import { Mail, MessageCircle, Send, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    const { error } = await supabase.from('expressions').insert({
      title: `Contact — ${name || 'Anonyme'}`,
      category: 'autre',
      message: `Message de contact\nDe: ${name || 'Anonyme'} (${email})\n\n${message}`,
      allow_publication: false,
    });

    setSending(false);
    if (error) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      return;
    }
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="badge bg-teal-100 text-teal-800">Contact</span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              Prenons contact
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">
              Une question, une demande de partenariat, ou simplement envie d'échanger ? Écrivez-nous.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-12 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2 space-y-5">
          <div className="card p-5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 flex-shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Email</h3>
              <p className="text-sm text-stone-600">parlelibre0@gmail.com</p>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 flex-shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Séances</h3>
              <p className="text-sm text-stone-600">
                Les séances d'écoute se déroulent sur WhatsApp, après réservation.
              </p>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 flex-shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Zone d'intervention</h3>
              <p className="text-sm text-stone-600">À distance, partout où vous êtes.</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {sent ? (
            <div className="card p-10 text-center animate-scale-in">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <Send className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-stone-900">
                Message envoyé
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Merci de nous avoir écrit. Nous revenons vers vous dès que possible.
              </p>
              <button onClick={() => setSent(false)} className="btn-secondary mt-6">
                Écrire un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="card p-6 sm:p-8 space-y-5">
              <div>
                <label className="label" htmlFor="name">Votre nom (optionnel)</label>
                <input
                  id="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonyme"
                />
              </div>
              <div>
                <label className="label" htmlFor="email">Votre email</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="message">Votre message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="input resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
              )}
              <button type="submit" disabled={sending} className="btn-primary w-full">
                {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                {!sending && <Send className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
