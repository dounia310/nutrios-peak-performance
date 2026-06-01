import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Activity, Brain, Sparkles, ArrowRight, ShieldCheck, Microscope, LineChart, Heart, Users } from "lucide-react";
import heroImg from "@/assets/backgroundnut.jpg";
import dashImg from "@/assets/dashboard-preview.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriOs — Votre Nutrition Personnalisée" },
      { name: "description", content: "Plateforme de diagnostic nutritionnel pour tous : bio-diagnostic, synthèse IA et plan personnalisé gratuit." },
      { property: "og:title", content: "NutriOs — Votre Nutrition Personnalisée" },
      { property: "og:description", content: "Plateforme de diagnostic nutritionnel pour tous : bio-diagnostic, synthèse IA et plan personnalisé gratuit." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://plannutrios.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://plannutrios.lovable.app/" },
    ],
  }),
  component: Welcome,
});

const partners = ["MedClinic Pro", "Olympia Lab", "PerformX", "BioVitae", "AthletIQ", "NutriCore"];

const steps = [
  { n: "01", icon: Microscope, title: "Bio-Diagnostic", desc: "Capture haute précision de vos données morphologiques et métaboliques. Simple, rapide, sans engagement." },
  { n: "02", icon: Brain, title: "Synthèse IA", desc: "Algorithmes validés cliniquement pour générer votre profil nutritionnel unique, quel que soit votre niveau." },
  { n: "03", icon: Heart, title: "Plan Sur Mesure", desc: "Recevez votre plan personnalisé avec repas illustrés, macros et conseils adaptés à votre rythme de vie." },
];

function Welcome() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll(".reveal-word");
        gsap.from(words, {
          y: 80, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08,
        });
      }
      // Hero pinned scrub
      if (heroRef.current) {
        gsap.to(heroRef.current.querySelector(".hero-img"), {
          scale: 1.15, yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
        });
      }
      // Sticky-stack steps
      if (stickyRef.current) {
        const cards = stickyRef.current.querySelectorAll<HTMLElement>(".step-card");
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          gsap.to(card, {
            scale: 0.92,
            opacity: 0.4,
            ease: "none",
            scrollTrigger: {
              trigger: cards[i + 1],
              start: "top 60%",
              end: "top 20%",
              scrub: true,
            },
          });
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-28 md:pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
              Diagnostic nutritionnel · Pour toutes et tous
            </motion.div>

                    <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight">
          Maîtrisez votre{" "}
          <span className="text-gradient">métabolisme</span>{" "}
          en temps réel
        </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              NutriOs analyse vos données physiologiques pour créer des plans nutritionnels personnalisés qui optimisent votre énergie, votre récupération et vos performances.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-accent text-accent-foreground px-8 py-4 font-bold shadow-accent hover:scale-[1.03] transition-transform text-lg"
              >
                Commencer mon diagnostic gratuit
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-xl glass px-8 py-4 font-semibold hover:bg-surface-elevated transition-colors text-lg"
              >
                Voir la démo
              </Link>
            </motion.div>

            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-glow" />
                Données chiffrées
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-glow" />
                Mifflin-St Jeor
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Gratuit & sans engagement
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-emerald opacity-20 blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-glow">
              <img src={heroImg} alt="Athlète et données métaboliques NutriOs" className="hero-img w-full h-auto object-cover" width={1920} height={1080} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* PARTNER CLOUD */}
      <section className="py-16 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Partenaires cliniques & scientifiques
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {partners.map((p) => (
              <span key={p} className="font-display font-bold text-lg text-muted-foreground hover:text-foreground transition-colors">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY STACK PROCESS */}
      <section ref={stickyRef} className="relative py-24">
        <div className="mx-auto max-w-5xl px-6 mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Le protocole NutriOs</p>
          <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight">
            Trois étapes. <span className="text-gradient">Un plan qui vous ressemble.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Sportif ou non, jeune ou senior, perte de poids ou prise de muscle — notre algorithme s'adapte à votre profil.
          </p>
        </div>
        <div className="mx-auto max-w-4xl px-6 space-y-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="step-card sticky rounded-3xl glass p-8 md:p-12 shadow-card grain overflow-hidden"
                style={{ top: `${100 + i * 24}px` }}
              >
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-emerald opacity-10 blur-sm-3xl rounded-full pointer-events-none" />
                <div className="flex items-start gap-6 relative">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-emerald grid place-items-center shadow-glow">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-4 mb-3">
                      <span className="font-display font-extrabold text-5xl text-gradient-accent">{s.n}</span>
                      <h3 className="font-display font-bold text-2xl md:text-3xl">{s.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{s.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Tableau de bord</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl">
              Vos repas, <span className="text-gradient">en toute simplicité.</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Des recettes illustrées, des ingrédients détaillés, et un suivi qui s'adapte à votre quotidien.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-glow group">
            <img src={dashImg} alt="Aperçu tableau de bord NutriOs" className="w-full opacity-90 group-hover:opacity-100 transition-opacity" width={1920} height={1080} loading="lazy" />
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display font-bold text-2xl">Votre plan nutritionnel</p>
                <p className="text-sm text-muted-foreground">Repas, macros et calories adaptés à vos objectifs</p>
              </div>
              <Link to="/login" className="rounded-xl bg-gradient-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold shadow-accent">
                Créer mon plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative rounded-3xl glass p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-emerald opacity-15" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 blur-sm-3xl rounded-full" />
            <div className="relative">
              <h2 className="font-display font-extrabold text-4xl md:text-5xl mb-4">
                Prêt à transformer votre <span className="text-gradient-accent">alimentation</span> ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Moins de 90 secondes. Gratuit. Sans engagement. Découvrez votre plan personnalisé.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent text-accent-foreground px-8 py-4 font-bold shadow-accent hover:scale-[1.03] transition-transform">
                Commencer maintenant <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-muted-foreground mt-4">Aucune carte bancaire requise</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}