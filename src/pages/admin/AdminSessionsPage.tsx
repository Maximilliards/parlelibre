import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Booking, Slot } from '@/lib/types';
import { DAY_NAMES, formatDateTime } from '@/lib/types';
import { StatusBadge } from './AdminDashboardPage';
import { Modal } from '@/components/Modal';
import {
  CalendarHeart,
  Clock,
  MessageCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';

export function AdminSessionsPage() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Booking | null>(null);
  const [showSlots, setShowSlots] = useState(false);

  const load = async () => {
    setLoading(true);
    const [bookRes, slotRes] = await Promise.all([
      supabase.from('bookings').select('*').order('session_date', { ascending: true }),
      supabase.from('slots').select('*').order('day_of_week', { ascending: true }),
    ]);
    setBookings((bookRes.data ?? []) as Booking[]);
    setSlots((slotRes.data ?? []) as Slot[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const logAction = async (action: string, targetId: string, details: Record<string, unknown>) => {
    await supabase.from('audit_log').insert({
      actor_email: session?.user?.email ?? null,
      action,
      target_type: 'booking',
      target_id: targetId,
      details,
    });
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    await logAction('booking_status_change', id, { status });
    setActive(null);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.session_date >= today);
  const past = bookings.filter((b) => b.session_date < today);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900">Séances</h1>
          <p className="text-sm text-stone-600 mt-1">Calendrier et réservations des séances d'écoute.</p>
        </div>
        <button onClick={() => setShowSlots(true)} className="btn-secondary">
          <Calendar className="h-4 w-4" /> Gérer les créneaux
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Chargement...</p>
      ) : (
        <>
          <section>
            <h2 className="font-display text-lg font-semibold text-stone-900 mb-3">À venir</h2>
            {upcoming.length === 0 ? (
              <div className="card p-10 text-center">
                <CalendarHeart className="mx-auto h-10 w-10 text-stone-300" />
                <p className="mt-4 text-stone-500">Aucune séance à venir.</p>
              </div>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {upcoming.map((b) => (
                  <li key={b.id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-stone-900">{b.client_name}</p>
                        <p className="text-sm text-stone-600 mt-1 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-stone-400" />
                          {new Date(b.session_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-sm text-stone-600 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-stone-400" />
                          {b.session_start.slice(0, 5)} – {b.session_end.slice(0, 5)}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setActive(b)} className="btn-ghost text-xs">
                        <Eye className="h-3.5 w-3.5" /> Détails
                      </button>
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b.id, 'completed')} className="btn text-xs bg-sage-50 text-sage-700 hover:bg-sage-100">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Terminer
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button onClick={() => updateStatus(b.id, 'cancelled')} className="btn text-xs bg-stone-100 text-stone-600 hover:bg-stone-200">
                          <XCircle className="h-3.5 w-3.5" /> Annuler
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-stone-900 mb-3">Passées</h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {past.map((b) => (
                  <li key={b.id} className="card p-4 opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{b.client_name}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {new Date(b.session_date).toLocaleDateString('fr-FR')} à {b.session_start.slice(0, 5)}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title="Détails de la séance" maxWidth="max-w-lg">
        {active && (
          <div className="space-y-3 text-sm">
            <Detail label="Client" value={active.client_name} />
            <Detail label="Email" value={active.client_email} />
            <Detail label="Téléphone" value={active.client_phone} />
            <Detail label="Date" value={new Date(active.session_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
            <Detail label="Heure" value={`${active.session_start.slice(0, 5)} – ${active.session_end.slice(0, 5)}`} />
            <Detail label="Canal" value="WhatsApp" />
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Statut</span>
              <StatusBadge status={active.status} />
            </div>
            {active.whatsapp_link && (
              <a
                href={active.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full mt-2"
              >
                <MessageCircle className="h-4 w-4" /> Ouvrir WhatsApp
              </a>
            )}
            <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">
              Réservée le {formatDateTime(active.created_at)}
            </p>
          </div>
        )}
      </Modal>

      {showSlots && <SlotsManager slots={slots} onClose={() => { setShowSlots(false); load(); }} />}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-900 text-right">{value}</span>
    </div>
  );
}

function SlotsManager({ slots, onClose }: { slots: Slot[]; onClose: () => void }) {
  const [dayOfWeek, setDayOfWeek] = useState(3);
  const [startTime, setStartTime] = useState('15:30');
  const [endTime, setEndTime] = useState('18:30');

  const addSlot = async () => {
    await supabase.from('slots').insert({
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      is_active: true,
    });
    onClose();
  };

  const toggleSlot = async (id: string, active: boolean) => {
    await supabase.from('slots').update({ is_active: !active }).eq('id', id);
    onClose();
  };

  const removeSlot = async (id: string) => {
    await supabase.from('slots').delete().eq('id', id);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Créneaux de disponibilité" maxWidth="max-w-xl">
      <div className="space-y-5">
        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-sm font-medium text-stone-800 mb-3">Créneaux actuels</p>
          {slots.length === 0 ? (
            <p className="text-sm text-stone-500">Aucun créneau configuré.</p>
          ) : (
            <ul className="space-y-2">
              {slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-stone-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-teal-700 text-xs font-semibold">
                      {s.day_of_week}
                    </span>
                    <span className="text-stone-700">{DAY_NAMES[s.day_of_week]}</span>
                    <span className="text-stone-500">{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</span>
                    {!s.is_active && <span className="badge bg-stone-100 text-stone-500 text-xs">Inactif</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleSlot(s.id, s.is_active)} className="p-1.5 rounded text-stone-500 hover:bg-stone-100">
                      {s.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <button onClick={() => removeSlot(s.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-stone-800">Ajouter un créneau</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label text-xs">Jour</label>
              <select className="input" value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
                {DAY_NAMES.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">Début</label>
              <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="label text-xs">Fin</label>
              <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <button onClick={addSlot} className="btn-primary w-full">
            <Plus className="h-4 w-4" /> Ajouter le créneau
          </button>
        </div>
      </div>
    </Modal>
  );
}
