import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Link } from '@/lib/router';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function AdminLoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="container-page py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" /> Retour au site
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center"><Logo /></div>
            <h1 className="mt-6 font-display text-2xl font-semibold text-stone-900">
              Espace administration
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Connectez-vous pour gérer ParleLibre.
            </p>
          </div>

          <form onSubmit={onSubmit} className="card p-6 sm:p-8 space-y-5">
            <div>
              <label className="label" htmlFor="ad-email">Email</label>
              <input
                id="ad-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="parlelibre0@gmail.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="ad-pwd">Mot de passe</label>
              <input
                id="ad-pwd"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Connexion...</>
              ) : (
                <><Lock className="h-4 w-4" /> Se connecter</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
