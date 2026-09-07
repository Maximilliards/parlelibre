import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Donation } from '@/lib/types';
import { formatPrice, formatDateTime, PAYMENT_METHODS } from '@/lib/types';
import { StatusBadge } from './AdminDashboardPage';
import { Heart, Search, TrendingUp, Calendar } from 'lucide-react';

const PAYMENT_METHOD_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m.label])
);

export function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      setDonations((data ?? []) as Donation[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = donations.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (search) {
      return (
        d.reference.toLowerCase().includes(search.toLowerCase()) ||
        (d.donor_name ?? '').toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const totalDonations = donations.filter((d) => d.status === 'paid').reduce((s, d) => s + d.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const donationsToday = donations.filter((d) => d.status === 'paid' && d.created_at.slice(0, 10) === today);
  const monthStart = new Date();
  monthStart.setDate(1);
  const donationsThisMonth = donations.filter(
    (d) => d.status === 'paid' && new Date(d.created_at) >= monthStart
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900 flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" /> Dons de soutien
        </h1>
        <p className="text-sm text-stone-600 mt-1">Suivi des dons reçus par ParleLibre.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-stone-500">Total des dons</p>
          <p className="font-display text-2xl font-semibold text-teal-700 mt-1">{formatPrice(totalDonations)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500">Nombre de dons</p>
          <p className="font-display text-2xl font-semibold text-stone-900 mt-1">
            {donations.filter((d) => d.status === 'paid').length}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Dons du jour</p>
          <p className="font-display text-2xl font-semibold text-stone-900 mt-1">
            {formatPrice(donationsToday.reduce((s, d) => s + d.amount, 0))}
          </p>
          <p className="text-xs text-stone-400 mt-1">{donationsToday.length} don(s)</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-stone-500 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Ce mois-ci</p>
          <p className="font-display text-2xl font-semibold text-stone-900 mt-1">
            {formatPrice(donationsThisMonth.reduce((s, d) => s + d.amount, 0))}
          </p>
          <p className="text-xs text-stone-400 mt-1">{donationsThisMonth.length} don(s)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'paid', label: 'Payés' },
            { key: 'pending', label: 'En attente' },
            { key: 'failed', label: 'Échoués' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`badge whitespace-nowrap ${filter === f.key ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
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
          <Heart className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-500">Aucun don pour le moment.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Référence</th>
                  <th className="text-left px-4 py-3 font-medium">Donateur</th>
                  <th className="text-right px-4 py-3 font-medium">Montant</th>
                  <th className="text-left px-4 py-3 font-medium">Méthode</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-xs text-stone-700">{d.reference}</td>
                    <td className="px-4 py-3 text-stone-900">{d.donor_name ?? 'Anonyme'}</td>
                    <td className="px-4 py-3 text-right font-medium text-stone-900">{formatPrice(d.amount)}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {d.method ? PAYMENT_METHOD_LABELS[d.method] ?? d.method : '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-xs text-stone-500">{formatDateTime(d.created_at)}</td>
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
