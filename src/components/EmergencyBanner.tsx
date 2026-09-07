import { useState } from 'react';
import { AlertTriangle, X, Phone } from 'lucide-react';

export function EmergencyBanner() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="container-page py-2.5 flex items-center justify-between gap-3">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-sm text-amber-900 hover:underline text-left"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <span className="font-medium">
              Vous traversez une situation difficile ou urgente ?
            </span>
            <span className="hidden sm:inline text-amber-700 underline-offset-2 hover:underline">
              Voir les ressources d'aide
            </span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-900 p-1"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in-fast"
          onClick={() => setOpen(false)}
        >
          <div
            className="card max-w-lg w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-stone-900">
                  Ressources en cas d'urgence
                </h2>
                <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                  ParleLibre n'est pas un service d'urgence médicale. Si vous êtes en danger
                  immédiat, contactez les services compétents.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
                <Phone className="h-4 w-4 mt-0.5 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-stone-900">Urgence médicale / SAMU</p>
                  <p className="text-stone-600">Composez le numéro d'urgence local.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
                <Phone className="h-4 w-4 mt-0.5 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-stone-900">Ligne d'écoute psychologique</p>
                  <p className="text-stone-600">
                    Une ligne d'écoute locale gratuite et confidentielle.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-stone-900">Danger immédiat</p>
                  <p className="text-stone-600">
                    Rendez-vous dans un lieu sûr et contactez les autorités locales.
                  </p>
                </div>
              </li>
            </ul>

            <button onClick={() => setOpen(false)} className="btn-secondary mt-5 w-full">
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
