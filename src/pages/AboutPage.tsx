import { SectionTitle } from '@/components/SectionTitle';
import { Link } from '@/lib/router';
import { Heart, Ear, ShieldCheck, HandHeart, BookOpen, ArrowRight } from 'lucide-react';

export function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 to-stone-50" />
        <div className="container-page pt-16 pb-12">
          <div className="max-w-3xl">
            <span className="badge bg-teal-100 text-teal-800">À propos</span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
              Une écoute humaine, libre et confidentielle
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">
              ParleLibre est né d'une conviction simple : la parole libère. Nous offrons un espace où
              chacun·e peut déposer ce qu'il traverse, être écouté sans jugement, et trouver une
              orientation adaptée.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 grid gap-10 md:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Notre vision" title="La parole comme premier pas" />
          <p className="mt-4 text-stone-600 leading-relaxed">
            Nous croyons que chaque personne mérite d'être entendue. Que la souffrance, le doute,
            la solitude ne devraient jamais rester enfermés. ParleLibre veut rendre l'écoute
            accessible, simple et rassurante.
          </p>
        </div>
        <div>
          <SectionTitle eyebrow="Notre mission" title="Offrir un espace sûr" />
          <p className="mt-4 text-stone-600 leading-relaxed">
            Permettre à toute personne traversant une difficulté personnelle, émotionnelle ou
            relationnelle de trouver un espace confidentiel pour exprimer ce qu'elle vit, être
            écoutée, et être orientée vers des ressources adaptées.
          </p>
        </div>
      </section>

      <section className="bg-white border-y border-stone-200">
        <div className="container-page py-16">
          <SectionTitle center eyebrow="Nos valeurs" title="Ce qui nous guide" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Ear, title: 'Écoute', text: 'Une présence attentive, sans interrompre ni juger.' },
              { icon: ShieldCheck, title: 'Confidentialité', text: 'Vos mots restent privés. Vos données sont protégées.' },
              { icon: Heart, title: 'Bienveillance', text: 'Un accueil respectueux de votre histoire et de votre rythme.' },
              { icon: HandHeart, title: 'Humanité', text: 'Derrière chaque message, une personne. Derrière chaque réponse, une personne.' },
            ].map((v) => (
              <div key={v.title} className="card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-stone-900">{v.title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-stone-900">
              Notre charte d'écoute
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Nos écoutant·es s'engagent à respecter ces principes.
            </p>
          </div>
          <ol className="md:col-span-2 space-y-4">
            {[
              'Écouter avec attention, sans interrompre ni minimiser.',
              'Ne jamais juger, étiqueter ou diagnostiquer.',
              'Respecter le silence et le rythme de la personne.',
              'Garantir la confidentialité des échanges.',
              'Orienter vers des ressources adaptées lorsque nécessaire.',
              'Ne jamais se substituer à un suivi médical ou psychologique spécialisé.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 card p-5">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-sm font-semibold">
                  {i + 1}
                </span>
                <p className="text-sm text-stone-700 leading-relaxed pt-1">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page pb-8">
        <div className="card p-8 sm:p-12 text-center bg-gradient-to-br from-teal-50 to-stone-50">
          <h2 className="font-display text-2xl font-semibold text-stone-900">
            Envie de déposer ce que vous vivez ?
          </h2>
          <p className="mt-3 text-stone-600 max-w-lg mx-auto">
            Vous pouvez écrire maintenant, anonymement, sans inscription.
          </p>
          <Link to="/exprimer" className="btn-primary mt-6">
            Écrire librement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
