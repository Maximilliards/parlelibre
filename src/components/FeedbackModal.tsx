import { useState } from 'react';
import { MessageSquare, X, Star, Send, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TYPES: { id: 'general' | 'bug' | 'feature'; label: string }[] = [
  { id: 'general', label: 'Avis' },
  { id: 'bug', label: 'Bug' },
  { id: 'feature', label: 'Idée' },
];

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'general' | 'bug' | 'feature'>('general');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from('feedbacks').insert([
        {
          user_id: user?.id ?? null,
          user_email: user?.email ?? null,
          type,
          rating,
          message: message.trim(),
        },
      ]);

      if (insertError) throw insertError;

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
        setMessage('');
        setRating(5);
        setType('general');
      }, 2000);
    } catch {
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-full shadow-lg transition-all transform hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium text-sm">Un avis ?</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-80 sm:w-96 p-5 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-semibold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              Donnez votre avis sur ParleLibre
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-teal-500 mx-auto animate-bounce" />
              <p className="font-medium text-stone-800">Merci pour votre retour !</p>
              <p className="text-xs text-stone-500">Votre contribution nous aide à améliorer ParleLibre.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                {TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      type === item.id
                        ? 'bg-teal-50 border-teal-600 text-teal-700'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-1 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Qu'avez-vous pensé de l'application ? Des bugs ou améliorations à signaler ?"
                className="w-full p-3 text-sm rounded-xl border border-stone-300 bg-stone-50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 resize-none"
              />

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer le retour
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
