import { AlertTriangle, ShieldCheck, Lock, HeartPulse, Phone } from 'lucide-react';

export function LegalPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="badge bg-teal-100 text-teal-800">Mentions légales</span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              Ce que ParleLibre est — et n'est pas
            </h1>
          </div>
        </div>
      </section>

      <section className="container-page py-10 max-w-3xl space-y-8">
        <div className="card p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-lg font-semibold text-stone-900">Nature du service</h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                ParleLibre est une plateforme d'écoute humaine. Elle propose un espace d'expression
                libre et des séances d'écoute personnalisées. Le service est assuré par des
                écoutant·es formé·es à l'écoute active et bienveillante.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-3">
            <HeartPulse className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-lg font-semibold text-stone-900">
                Limites du service
              </h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                ParleLibre n'est pas un service médical, psychiatrique ou psychologique spécialisé.
                ParleLibre ne pose pas de diagnostic médical, ne prescrit pas de traitement, et ne
                se substitue pas à un suivi par un professionnel de santé. Les séances d'écoute
                sont une accompagnement humain, et non un acte thérapeutique médical.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-3">
            <Lock className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-lg font-semibold text-stone-900">
                Confidentialité
              </h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Les messages déposés dans l'espace d'expression libre sont strictement
                confidentiels. Ils ne sont jamais publiés sans autorisation explicite de leur
                auteur·e. Les témoignages publiés sont anonymisés. Les données personnelles
                renseignées lors d'une réservation (nom, email, téléphone) ne sont utilisées que
                pour la gestion de la séance et ne sont jamais partagées.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-lg font-semibold text-stone-900">
                En cas de situation urgente
              </h2>
              <p className="mt-2 text-sm text-stone-700 leading-relaxed">
                Si vous êtes en danger immédiat, si vous avez des idées suicidaires, ou si vous
                traversez une crise grave, ParleLibre n'est pas le bon interlocuteur pour une
                réponse d'urgence.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-600" />
                  Contactez le numéro d'urgence médicale local (SAMU).
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-600" />
                  Appelez une ligne d'écoute psychologique d'urgence.
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-600" />
                  Rendez-vous dans un lieu sûr et contactez les autorités locales.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
