import { useEffect, useState } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { Logo } from './Logo';

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/histoires-partagees', label: 'Histoires' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const { path, navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const isActive = (to: string) => (to === '/' ? path === '/' : path.startsWith(to));

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-stone-50/85 backdrop-blur-md border-b border-stone-200/70' : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Logo onClick={() => navigate('/')} />

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/soutenir" className="btn-ghost">
            <Heart className="h-4 w-4" /> Soutenir
          </Link>
          <Link to="/reserver" className="btn-primary">
            Réserver une séance
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-stone-200/70 bg-stone-50 animate-fade-in-fast">
          <div className="container-page py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(link.to) ? 'text-teal-700 bg-teal-50' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-stone-200 my-2" />
            <Link to="/exprimer" className="btn-secondary justify-center">
              Écrire librement
            </Link>
            <Link to="/soutenir" className="btn-ghost justify-center">
              <Heart className="h-4 w-4" /> Soutenir ParleLibre
            </Link>
            <Link to="/reserver" className="btn-primary justify-center">
              Réserver une séance
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
