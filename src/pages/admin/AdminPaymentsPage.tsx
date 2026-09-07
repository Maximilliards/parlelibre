import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Payment, Booking } from '@/lib/types';
import { formatPrice, formatDateTime, PAYMENT_METHODS } from '@/lib/types';
import { StatusBadge } from './AdminDashboardPage';
import { CreditCard, Search } from 'lucide-react';

interface PaymentWithBooking extends Payment {
  bookings?: { client_name: string; session_date: string; session_start: string } | null;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m.label])
);

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('payments')
        .select('*, bookings:booking_id (client_name, session_date, session_start)')
        .order('created_at', { ascending: false });
      setPayments((data ?? []) as PaymentWithBooking[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = payments.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search) {
      const booking = p.bookings;
      const name = booking?.client_name ?? '';
      return name.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900">Paiements</h1>
        <p className="text-sm text-stone-600 mt-1">Suivi des transactions liées aux réservations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-stone-500">Revenus totaux</p>
          <p className="font-display text-2xl font-semibold text-teal-700 mt-1">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500">Paiements en attente</p>
          <p className="font-display text-2xl font-semibold text-amber-700 mt-1">{pendingCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500">Total transactions</p>
          <p className="font-display text-2xl font-semibold text-stone-900 mt-1">{payments.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'paid', label: 'Payés' },
            { key: 'pending', label: 'En attente' },
            { key: 'failed', label: 'Échec' },
            { key: 'cancelled', label: 'Annulés' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`badge whitespace-nowrap ${
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
          <CreditCard className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-500">Aucun paiement.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Référence</th>
                  <th className="text-left px-4 py-3 font-medium">Client</th>
                  <th className="text-left px-4 py-3 font-medium">Date séance</th>
                  <th className="text-left px-4 py-3 font-medium">Méthode</th>
                  <th className="text-right px-4 py-3 font-medium">Montant</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-xs text-stone-700">{p.reference}</td>
                    <td className="px-4 py-3 text-stone-900">{p.bookings?.client_name ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {p.bookings ? `${new Date(p.bookings.session_date).toLocaleDateString('fr-FR')} à ${p.bookings.session_start.slice(0, 5)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                    {p.method ? PAYMENT_METHOD_LABELS[p.method] ?? p.method : '—'}
                  </td>
                    <td className="px-4 py-3 text-right font-medium text-stone-900">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-xs text-stone-500">{formatDateTime(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
