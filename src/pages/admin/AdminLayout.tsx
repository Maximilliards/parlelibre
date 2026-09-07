import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Link, useRouter } from '@/lib/router';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  MessageSquareHeart,
  CalendarHeart,
  CreditCard,
  LogOut,
  ShieldAlert,
  Newspaper,
  MessageSquare,
  Bell,
  Heart,
  MessageCircle,
} from 'lucide-react';

const NAV = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquareHeart },
  { to: '/admin/commentaires', label: 'Commentaires', icon: MessageCircle },
  { to: '/admin/blog', label: 'Blog', icon: Newspaper },
  { to: '/admin/seances', label: 'Séances', icon: CalendarHeart },
  { to: '/admin/paiements', label: 'Paiements', icon: CreditCard },
  { to: '/admin/dons', label: 'Dons', icon: Heart },
  { to: '/admin/situations', label: 'Situations sensibles', icon: ShieldAlert },
  { to: '/admin/editorial', label: 'Contenu éditorial', icon: Newspaper },
  { to: '/admin/avis', label: 'Avis & retours', icon: MessageSquare },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const { path, navigate } = useRouter();

  const isActive = (to: string) => (to === '/admin' ? path === '/admin' : path.startsWith(to));

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-stone-200 bg-white">
        <div className="px-6 py-5 border-b border-stone-200">
          <Logo onClick={() => navigate('/admin')} />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-stone-200">
          <div className="px-3 mb-3">
            <p className="text-xs text-stone-500">Connecté en tant que</p>
            <p className="text-sm font-medium text-stone-800 truncate">
              {session?.user?.email ?? 'admin'}
            </p>
          </div>
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-700 w-full"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-stone-200">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo onClick={() => navigate('/admin')} />
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            aria-label="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-1 px-2 pb-2 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                isActive(item.to)
                  ? 'bg-teal-600 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 md:pt-0 pt-28">
        <div className="container-page py-8">{children}</div>
      </main>
    </div>
  );
}
