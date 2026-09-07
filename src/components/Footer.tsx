import { Link } from '@/lib/router';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-stone-600 leading-relaxed">
              ParleLibre est un espace d'écoute humaine. Un lieu confidentiel pour exprimer ce que
              vous vivez, sans jugement, et être orienté vers des ressources adaptées.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm text-stone-600">
              <li><Link to="/" className="hover:text-teal-700">Accueil</Link></li>
              <li><Link to="/about" className="hover:text-teal-700">À propos</Link></li>
              <li><Link to="/histoires-partagees" className="hover:text-teal-700">Histoires partagées</Link></li>
              <li><Link to="/blog" className="hover:text-teal-700">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-teal-700">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-stone-600">
              <li><Link to="/exprimer" className="hover:text-teal-700">Expression libre</Link></li>
              <li><Link to="/reserver" className="hover:text-teal-700">Réserver une séance</Link></li>
              <li><Link to="/soutenir" className="hover:text-teal-700">Soutenir ParleLibre</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-teal-700">Mentions légales</Link></li>
              <li><Link to="/admin" className="hover:text-teal-700">Espace administration</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} ParleLibre. Tous droits réservés.
          </p>
          <p className="text-xs text-stone-500">
            ParleLibre n'est pas un service médical d'urgence.
          </p>
        </div>
      </div>
    </footer>
  );
}
