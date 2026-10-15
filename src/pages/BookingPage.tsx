import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  DAY_NAMES,
  SESSION_DURATION_MINUTES,
  SESSION_PRICE_FCFA,
  WHATSAPP_NUMBER,
  formatPrice,
  PAYMENT_METHODS,
  type PaymentMethod,
  type Slot,
} from '@/lib/types';
import {
  generateSessionSlots,
  getNextDatesForDayOfWeek,
  formatDateLong,
  formatDateShort,
} from '@/lib/slots';
import {
  CalendarHeart,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Lock,
  MessageCircle,
  Smartphone,
  Loader2,
} from 'lucide-react';

type Step = 'slot' | 'info' | 'payment' | 'confirmed';

interface SelectedSession {
  slot: Slot;
  date: Date;
  start: string;
  end: string;
}

export function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('slot');
  const [selected, setSelected] = useState<SelectedSession | null>(null);

  // info form
  const [pseudonym, setPseudonym] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // payment
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [confirmation, setConfirmation] = useState<{
    bookingId: string;
    whatsappLink: string;
    reference: string;
  } | null>(null);

  useEffect(() => {
    supabase
      .from('slots')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setSlots(data as Slot[]);
        setLoading(false);
      });
  }, []);

  const slotsByDay = useMemo(() => {
    const map = new Map<number, Slot[]>();
    slots.forEach((s) => {
      if (!map.has(s.day_of_week)) map.set(s.day_of_week, []);
      map.get(s.day_of_week)!.push(s);
    });
    return map;
  }, [slots]);

  const handleSelectSession = (slot: Slot, date: Date, start: string, end: string) => {
    setSelected({ slot, date, start, end });
    setStep('info');
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!selected) return;
    setPaying(true);
    setPayError(null);

    const sessionDateStr = selected.date.toISOString().slice(0, 10);
    const whatsappLink = buildWhatsappLink(phone, selected);

    // 1. Create booking
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        slot_id: selected.slot.id,
        session_date: sessionDateStr,
        session_start: selected.start,
        session_end: selected.end,
        client_name: pseudonym.trim(),
        client_email: email.trim(),
        client_phone: phone.trim(),
        status: 'confirmed',
        whatsapp_link: whatsappLink,
      })
      .select('id')
      .single();

    if (bookingErr || !booking) {
      setPaying(false);
      setPayError("La réservation n'a pas pu être créée. Veuillez réessayer.");
      return;
    }

    // 2. Create payment record
    const reference = `PL-${Date.now().toString(36).toUpperCase()}`;
    const { error: payErr } = await supabase.from('payments').insert({
      booking_id: booking.id,
      amount: SESSION_PRICE_FCFA,
      currency: 'XOF',
      reference,
      status: 'paid',
      method: paymentMethod,
      paid_at: new Date().toISOString(),
    });

    setPaying(false);
    if (payErr) {
      setPayError("Le paiement a échoué. Votre réservation n'a pas été confirmée.");
      return;
    }

    setConfirmation({ bookingId: booking.id, whatsappLink, reference });
    setStep('confirmed');

    await supabase.from('notifications').insert({
      type: 'new_booking',
      message: `Nouvelle réservation : ${pseudonym.trim()} le ${selected.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à ${selected.start}`,
      priority: 'normal',
    });
    await supabase.from('notifications').insert({
      type: 'payment_confirmed',
      message: `Paiement confirmé : ${formatPrice(SESSION_PRICE_FCFA)} — ${reference}`,
      priority: 'normal',
    });
  };

  if (loading) {
    return (
      <div className="container-page py-24 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="badge bg-teal-100 text-teal-800">Réservation</span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              Séance d'écoute personnalisée
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-600" /> 45 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-teal-600" /> Sur WhatsApp
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-teal-600" /> {formatPrice(SESSION_PRICE_FCFA)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <BookingSteps step={step} />

        {step === 'slot' && (
          <SlotSelection
            slotsByDay={slotsByDay}
            onSelect={handleSelectSession}
          />
        )}

        {step === 'info' && selected && (
          <InfoStep
            selected={selected}
            pseudonym={pseudonym}
            email={email}
            phone={phone}
            setPseudonym={setPseudonym}
            setEmail={setEmail}
            setPhone={setPhone}
            onBack={() => setStep('slot')}
            onSubmit={handleInfoSubmit}
          />
        )}

        {step === 'payment' && selected && (
          <PaymentStep
            selected={selected}
            pseudonym={pseudonym}
            email={email}
            phone={phone}
            paying={paying}
            payError={payError}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onBack={() => setStep('info')}
            onPay={handlePayment}
          />
        )}

        {step === 'confirmed' && confirmation && selected && (
          <ConfirmationStep
            selected={selected}
            confirmation={confirmation}
            pseudonym={pseudonym}
          />
        )}
      </section>
    </>
  );
}

function BookingSteps({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'slot', label: 'Créneau' },
    { key: 'info', label: 'Vos infos' },
    { key: 'payment', label: 'Paiement' },
    { key: 'confirmed', label: 'Confirmation' },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < currentIndex
                  ? 'bg-teal-600 text-white'
                  : i === currentIndex
                  ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              {i < currentIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-xs sm:text-sm font-medium ${
                i === currentIndex ? 'text-stone-900' : 'text-stone-500'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-6 sm:w-12 ${i < currentIndex ? 'bg-teal-500' : 'bg-stone-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function SlotSelection({
  slotsByDay,
  onSelect,
}: {
  slotsByDay: Map<number, Slot[]>;
  onSelect: (slot: Slot, date: Date, start: string, end: string) => void;
}) {
  if (slotsByDay.size === 0) {
    return (
      <div className="card p-10 text-center">
        <CalendarHeart className="mx-auto h-10 w-10 text-stone-300" />
        <p className="mt-4 text-stone-600">
          Aucun créneau n'est disponible pour le moment. Revenez bientôt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Array.from(slotsByDay.entries()).map(([dayOfWeek, daySlots]) => {
        const dates = getNextDatesForDayOfWeek(dayOfWeek, 4);
        return (
          <div key={dayOfWeek}>
            <h2 className="font-display text-xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 text-sm font-semibold">
                {dayOfWeek}
              </span>
              {DAY_NAMES[dayOfWeek]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dates.map((date) => (
                <div key={date.toISOString()} className="card p-4">
                  <p className="text-sm font-medium text-stone-900 capitalize mb-3">
                    {formatDateLong(date)}
                  </p>
                  <div className="space-y-2">
                    {daySlots.flatMap((slot) =>
                      generateSessionSlots(slot, SESSION_DURATION_MINUTES).map((session) => (
                        <button
                          key={`${slot.id}-${session.start}`}
                          onClick={() => onSelect(slot, date, session.start, session.end)}
                          className="w-full flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 hover:border-teal-400 hover:bg-teal-50 transition-colors group"
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-stone-400 group-hover:text-teal-600" />
                            {session.start} – {session.end}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-stone-300 group-hover:text-teal-600" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoStep({
  selected,
  pseudonym,
  email,
  phone,
  setPseudonym,
  setEmail,
  setPhone,
  onBack,
  onSubmit,
}: {
  selected: SelectedSession;
  pseudonym: string;
  email: string;
  phone: string;
  setPseudonym: (v: string) => void;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <form onSubmit={onSubmit} className="card p-6 sm:p-8 space-y-5">
          <h2 className="font-display text-xl font-semibold text-stone-900">Vos informations</h2>
          <p className="text-sm text-stone-600 -mt-2">
            Ces informations restent confidentielles et servent uniquement à organiser votre séance.
          </p>
          <div>
            <label className="label" htmlFor="bk-pseudonym">Pseudonyme</label>
            <input id="bk-pseudonym" className="input" value={pseudonym} onChange={(e) => setPseudonym(e.target.value)} required placeholder="Votre pseudonyme" />
          </div>
          <div>
            <label className="label" htmlFor="bk-email">Email</label>
            <input id="bk-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.com" />
          </div>
          <div>
            <label className="label" htmlFor="bk-phone">Numéro WhatsApp</label>
            <input id="bk-phone" type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+237 ..." />
            <p className="mt-1.5 text-xs text-stone-500">
              La séance se déroulera sur WhatsApp. Votre numéro ne sera pas affiché publiquement.
            </p>
          </div>
          <div className="flex justify-between pt-2">
            <button type="button" onClick={onBack} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <button type="submit" className="btn-primary">
              Continuer vers le paiement
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
      <BookingSummary selected={selected} />
    </div>
  );
}

function PaymentStep({
  selected,
  pseudonym,
  email,
  phone,
  paying,
  payError,
  paymentMethod,
  setPaymentMethod,
  onBack,
  onPay,
}: {
  selected: SelectedSession;
  pseudonym: string;
  email: string;
  phone: string;
  paying: boolean;
  payError: string | null;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="card p-6 sm:p-8 space-y-5">
          <h2 className="font-display text-xl font-semibold text-stone-900">Paiement</h2>
          <p className="text-sm text-stone-600 -mt-2">
            Choisissez votre moyen de paiement pour confirmer la réservation.
          </p>

          <div className="space-y-3">
            <p className="text-sm font-medium text-stone-800">Choisissez votre moyen de paiement</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                    paymentMethod === method.value
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-100'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${method.color} text-white text-xs font-bold flex-shrink-0`}>
                    {method.label.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900">{method.label}</p>
                    <p className="text-xs text-stone-500 truncate">{method.description}</p>
                  </div>
                  {paymentMethod === method.value && (
                    <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              Le paiement sera traité de manière sécurisée. Pour ce MVP, la transaction est
              <strong> simulée</strong> — aucun montant réel n'est débité. L'intégration Notch Pay
              est prête à être activée avec vos clés API.
            </p>
          </div>

          {payError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{payError}</p>
          )}

          <div className="flex justify-between pt-2">
            <button type="button" onClick={onBack} disabled={paying} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <button onClick={onPay} disabled={paying} className="btn-primary">
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Traitement...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Payer {formatPrice(SESSION_PRICE_FCFA)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <BookingSummary selected={selected} client={{ pseudonym, email, phone }} />
    </div>
  );
}

function ConfirmationStep({
  selected,
  confirmation,
  pseudonym,
}: {
  selected: SelectedSession;
  confirmation: { bookingId: string; whatsappLink: string; reference: string };
  pseudonym: string;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8 sm:p-10 text-center animate-scale-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-stone-900">
          Séance confirmée !
        </h1>
        <p className="mt-3 text-stone-600">
          Merci {pseudonym || ''}, votre séance d'écoute est réservée. Une confirmation a été envoyée.
        </p>

        <div className="mt-8 rounded-xl bg-stone-50 border border-stone-200 p-5 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Date</span>
            <span className="font-medium text-stone-900 capitalize">
              {formatDateLong(selected.date)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Heure</span>
            <span className="font-medium text-stone-900">
              {selected.start} – {selected.end}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Canal</span>
            <span className="font-medium text-stone-900">WhatsApp</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Référence</span>
            <span className="font-mono text-xs font-medium text-stone-900">
              {confirmation.reference}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-stone-200">
            <span className="text-stone-500">Montant payé</span>
            <span className="font-semibold text-teal-700">
              {formatPrice(SESSION_PRICE_FCFA)}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-teal-50 border border-teal-200 p-5 text-left">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-teal-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-teal-900">Rejoindre la séance sur WhatsApp</p>
              <p className="mt-1 text-xs text-teal-700">
                Le lien WhatsApp vous sera également envoyé avant la séance. Cliquez ci-dessous pour
                ouvrir la conversation dès maintenant.
              </p>
              <a
                href={confirmation.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Ouvrir WhatsApp
              </a>
            </div>
          </div>
        </div>

        <a href="#/" className="btn-ghost mt-6">Retour à l'accueil</a>
      </div>
    </div>
  );
}

function BookingSummary({
  selected,
  client,
}: {
  selected: SelectedSession;
  client?: { pseudonym: string; email: string; phone: string };
}) {
  return (
    <aside className="card p-6 h-fit lg:sticky lg:top-24">
      <h3 className="font-display text-lg font-semibold text-stone-900 mb-4">Récapitulatif</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Service</span>
          <span className="font-medium text-stone-900 text-right">Séance d'écoute</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Date</span>
          <span className="font-medium text-stone-900 capitalize text-right">
            {formatDateShort(selected.date)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Heure</span>
          <span className="font-medium text-stone-900">
            {selected.start} – {selected.end}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Durée</span>
          <span className="font-medium text-stone-900">45 min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Canal</span>
          <span className="font-medium text-stone-900">WhatsApp</span>
        </div>
        {client && client.pseudonym && (
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Client</p>
            <p className="text-stone-700">{client.pseudonym}</p>
            <p className="text-stone-500 text-xs">{client.email}</p>
            <p className="text-stone-500 text-xs">{client.phone}</p>
          </div>
        )}
        <div className="pt-3 border-t border-stone-200 flex justify-between">
          <span className="text-stone-700 font-medium">Total</span>
          <span className="font-display text-xl font-semibold text-teal-700">
            {formatPrice(SESSION_PRICE_FCFA)}
          </span>
        </div>
      </div>
    </aside>
  );
}

function buildWhatsappLink(phone: string, selected: SelectedSession): string {
  const dateStr = selected.date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const message = `Bonjour ParleLibre, je confirme ma séance d'écoute du ${dateStr} à ${selected.start}.`;
  const encoded = encodeURIComponent(message);
  const cleanNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
