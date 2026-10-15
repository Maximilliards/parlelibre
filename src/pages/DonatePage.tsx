import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PAYMENT_METHODS, type PaymentMethod, formatPrice } from '@/lib/types';
import { Heart, Loader2, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from '@/lib/router';

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];

export function DonatePage() {
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;

  const canSubmit = finalAmount >= 500 && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const reference = `DON-${Date.now().toString(36).toUpperCase()}`;

    const { error: donErr } = await supabase.from('donations').insert({
      amount: finalAmount,
      currency: 'XOF',
      reference,
      status: 'paid',
      method: paymentMethod,
      donor_name: name.trim() || null,
      donor_email: email.trim() || null,
      payment_type: 'donation',
      paid_at: new Date().toISOString(),
    });

    setSubmitting(false);
    if (donErr) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      return;
    }
    await supabase.from('notifications').insert({
      type: 'new_donation',
      message: `Nouveau don de ${formatPrice(finalAmount)} — ${reference}`,
      priority: 'normal',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-20">
          <div className="max-w-xl mx-auto card p-10 text-center animate-scale-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Heart className="h-8 w-8 fill-rose-500" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-stone-900">
              Merci pour votre soutien
            </h1>
            <p className="mt-3 text-stone-600 leading-relaxed">
              Votre don de <strong>{formatPrice(finalAmount)}</strong> a bien été enregistré.
              Grâce à vous, ParleLibre peut continuer à offrir un espace d'écoute à ceux qui en ont
              besoin.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/" className="btn-primary">
                Retour à l'accueil
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCustomAmount('');
                  setName('');
                  setEmail('');
                }}
                className="btn-secondary"
              >
                Faire un autre don
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-50 via-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-10">
          <div className="max-w-2xl">
            <span className="badge bg-rose-100 text-rose-700">
              <Heart className="h-3.5 w-3.5" /> Soutenir ParleLibre
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              Offrez un peu de chaleur humaine
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">
              ParleLibre est un espace gratuit pour celles et ceux qui traversent des moments
              difficiles. Votre don nous aide à maintenir ce service vivant et accessible à tous.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <div className="card p-6 sm:p-8 space-y-6">
          <div>
            <label className="label">Choisissez un montant</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`rounded-xl border px-4 py-3 text-center font-display text-lg font-semibold transition-all ${
                    !customAmount && amount === amt
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-100 text-teal-700'
                      : 'border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  {amt.toLocaleString('fr-FR')}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="label text-xs">Ou un montant personnalisé (FCFA)</label>
              <input
                type="number"
                min={500}
                step={500}
                className="input"
                placeholder="Ex: 7500"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
            <p className="mt-2 text-sm text-teal-700 font-medium">
              Total : {formatPrice(finalAmount)}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Votre nom (optionnel)</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonyme"
              />
            </div>
            <div>
              <label className="label">Email (optionnel)</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
              />
            </div>
          </div>
          <p className="text-xs text-stone-500">
            Vos informations restent strictement confidentielles et ne seront jamais affichées
            publiquement.
          </p>

          <div>
            <p className="text-sm font-medium text-stone-800 mb-3">Moyen de paiement</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left transition-all ${
                    paymentMethod === method.value
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-100'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${method.color} text-white text-xs font-bold flex-shrink-0`}>
                    {method.label.charAt(0)}
                  </span>
                  <span className="text-sm font-medium text-stone-900">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              Le paiement est actuellement <strong>simulé</strong> — aucun montant réel n'est débité.
              L'intégration Notch Pay sera activée dès que les clés API seront configurées.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="btn-primary w-full bg-rose-600 hover:bg-rose-700"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Traitement...</>
            ) : (
              <><Lock className="h-4 w-4" /> Faire un don de {formatPrice(finalAmount)}</>
            )}
          </button>
        </div>
      </section>
    </>
  );
}
