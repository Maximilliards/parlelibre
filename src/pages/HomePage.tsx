import { Link } from '@/lib/router';
import { SectionTitle } from '@/components/SectionTitle';
import {
  PenLine,
  CalendarHeart,
  ShieldCheck,
  HeartHandshake,
  MessageCircleHeart,
  Lock,
  ArrowRight,
  Quote,
  Newspaper,
  Heart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/types';

export function HomePage() {
  const [featured, setFeatured] = useState<Message[]>([]);

  useEffect(() => {
    supabase
      .from('messages')
      .select('id, titre, categorie, contenu_publie, created_at')
      .eq('statut', 'publie')
      .not('contenu_publie', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setFeatured((data ?? []) as Message[]));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50 via-stone-50 to-stone-50" />
        <div
          className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute top-40 -left-32 -z-10 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-page pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl animate-fade-in">
            <span className="badge bg-teal-100 text-teal-800">
              <HeartHandshake className="h-3.5 w-3.5" />
              Écoute humaine et confidentielle
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-6xl font-semibold text-stone-900 leading-[1.05] tracking-tight">
              Parler librement,
              <br />
              <span className="text-teal-700">être écouté sans jugement.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-600 leading-relaxed">
              Vous n'avez pas toujours besoin d'une solution. Parfois, vous avez simplement besoin de parler.
              ParleLibre vous offre un espace pour déposer ce que vous vivez, librement et sans jugement.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/exprimer" className="btn-primary">
                <PenLine className="h-4 w-4" />
                Écrire librement
              </Link>
              <Link to="/reserver" className="btn-secondary">
                <CalendarHeart className="h-4 w-4" />
                Réserver une séance
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-teal-600" /> 100% confidentiel
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600" /> Sans jugement
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircleHeart className="h-4 w-4 text-teal-600" /> Écoute humaine
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16 sm:py-20">
        <SectionTitle
          center
          eyebrow="Comment ça marche"
          title="Un espace pour vous, à votre rythme"
          subtitle="Cinq façons d'utiliser ParleLibre, selon ce dont vous avez besoin aujourd'hui."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {[
            {
              icon: PenLine,
              title: 'Exprimez-vous',
              text: "Mettez par écrit ce que vous avez sur le cœur. Vos mots restent strictement privés, sauf si vous autorisez leur partage de manière totalement anonyme.",
              cta: { to: '/exprimer', label: 'Écrire maintenant' },
            },
            {
              icon: Quote,
              title: 'Lire & se sentir moins seul',
              text: "Découvrez des expériences partagées anonymement. Vous n'êtes pas seul·e à traverser des moments difficiles.",
              cta: { to: '/histoires-partagees', label: 'Lire les histoires' },
            },
            {
              icon: CalendarHeart,
              title: 'Etre écouté.e',
              text: "45 minutes d'écoute personnalisée sur WhatsApp, avec un·e écoutant·e formé·e. 5 000 FCFA la séance.",
              cta: { to: '/reserver', label: 'Voir les créneaux' },
            },
            {
              icon: Newspaper,
              title: 'Lisez le blog',
              text: "Articles, réflexions et ressources sur la solitude, le deuil, le stress et toutes ces épreuves de la vie.",
              cta: { to: '/blog', label: 'Lire le blog' },
            },
            {
              icon: Heart,
              title: 'Soutenir ParleLibre',
              text: "Votre don aide à maintenir un espace d'écoute gratuit et accessible à ceux qui en ont besoin.",
              cta: { to: '/soutenir', label: 'Faire un don' },
            },
          ].map((card) => (
            <div key={card.title} className="card p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-stone-900">{card.title}</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed flex-1">{card.text}</p>
              <Link to={card.cta.to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800">
                {card.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white border-y border-stone-200">
        <div className="container-page py-16 sm:py-20 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <SectionTitle
              eyebrow="Notre mission"
              title="L'écoute comme premier soin"
              subtitle="Trop de personnes traversent des épreuves en silence. ParleLibre existe pour offrir un espace où la parole reprend sa place, sans honte ni jugement."
            />
            <ul className="mt-6 space-y-3">
              {[
                'Un espace confidentiel et bienveillant',
                'Une écoute humaine, non médicale',
                'Une orientation vers des ressources adaptées',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-stone-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/about" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800">
              En savoir plus sur ParleLibre
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="card overflow-hidden">
              <img
                src="https://images.pexels.com/photos/6952988/pexels-photo-6952988.jpeg?auto=compress&cs=tinysrgb&w=900"
                alt="Personne écrivant dans un carnet"
                className="h-72 w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 card px-5 py-4 max-w-xs hidden sm:block">
              <p className="text-sm text-stone-700 italic">
                « Écrire, c'est déjà commencer à se libérer. »
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured testimonials */}
      {featured.length > 0 && (
        <section className="container-page py-16 sm:py-20">
          <SectionTitle
            center
            eyebrow="Histoires partagées"
            title="Vous n'êtes pas seul·e"
            subtitle="Des personnes ont accepté de partager anonymement ce qu'elles traversent."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featured.map((t) => (
              <figure key={t.id} className="card p-6 flex flex-col">
                <Quote className="h-7 w-7 text-teal-300" />
                <blockquote className="mt-3 text-sm text-stone-700 leading-relaxed flex-1 line-clamp-5">
                  {t.contenu_publie ?? ''}
                </blockquote>
                <figcaption className="mt-4 text-xs text-stone-500">— Anonyme</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/histoires-partagees" className="btn-secondary">
              Lire toutes les histoires
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-teal-700 px-8 py-14 sm:px-14 sm:py-16 text-center">
          <div className="absolute -top-16 -right-10 h-64 w-64 rounded-full bg-teal-500/40 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white leading-tight">
              Prêt·e à parler ?
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-teal-100">
              Vous pouvez écrire maintenant, anonymement, ou réserver une séance d'écoute
              personnalisée.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/exprimer" className="btn bg-white text-teal-700 hover:bg-teal-50">
                <PenLine className="h-4 w-4" />
                Écrire librement
              </Link>
              <Link to="/reserver" className="btn border border-white/30 text-white hover:bg-teal-600">
                <CalendarHeart className="h-4 w-4" />
                Réserver une séance
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
