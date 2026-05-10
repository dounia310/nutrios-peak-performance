import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Activity, Brain, Sparkles, ArrowRight, ShieldCheck, Microscope, LineChart } from "lucide-react";
import heroImg from "@/assets/hero-athlete.jpg";
import dashImg from "@/assets/dashboard-preview.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriOs — Diagnostic Médical & Performance Nutrition" },
      { name: "description", content: "Plateforme de diagnostic nutritionnel pour athlètes de haut niveau : bio-diagnostic, synthèse IA et hyper-plan personnalisé." },
    ],
  }),
  component: Welcome,
});

const partners = ["MedClinic Pro", "Olympia Lab", "PerformX", "BioVitae", "AthletIQ", "NutriCore"];

const steps = [
  { n: "01", icon: Microscope, title: "Bio-Diagnostic", desc: "Capture haute précision de vos données morphologiques, métaboliques et sportives. Aucune approximation." },
  { n: "02", icon: Brain, title: "Synthèse IA", desc: "Algorithmes Mifflin-St Jeor croisés avec votre profil pour générer une carte d'identité métabolique unique." },
  { n: "03", icon: LineChart, title: "Hyper-Plan", desc: "Plan nutritionnel sur 4, 8 ou 12 semaines, livré sur WhatsApp ou Email avec macros et calendrier." },
];

function Welcome() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Hero reveal split-text style
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
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
              Diagnostic médical · Performance Nutrition
            </motion.div>
            <h1 ref={titleRef} className="font-display font-extrabold text-5xl md:text-7xl leading-[1.02] tracking-tight">
              <span className="reveal-word inline-block mr-3">Décodez</span>
              <span className="reveal-word inline-block mr-3">votre</span>
              <span className="reveal-word inline-block mr-3 text-gradient">métabolisme</span>
              <br />
              <span className="reveal-word inline-block mr-3">d'athlète</span>
              <span className="reveal-word inline-block text-gradient-accent">.</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              NutriOs est un système de bio-diagnostic nutritionnel conçu pour les athlètes de haut niveau.
              Données chiffrées, équations validées cliniquement, plan livré en moins de 90 secondes.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Link
                to="/diagnostic"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-accent text-accent-foreground px-6 py-3.5 font-semibold shadow-accent hover:scale-[1.03] transition-transform"
              >
                Lancer mon diagnostic
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/science"
                className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3.5 font-semibold hover:bg-surface-elevated transition-colors"
              >
                L'approche scientifique
              </Link>
            </motion.div>

            <div className="mt-12 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary-glow" /> Données chiffrées</div>
              <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary-glow" /> Mifflin-St Jeor</div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Synthèse IA</div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
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
            Partenaires cliniques & sportifs
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
            Trois étapes. <span className="text-gradient">Une vérité métabolique.</span>
          </h2>
        </div>
        <div className="mx-auto max-w-4xl px-6 space-y-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="step-card sticky rounded-3xl glass p-8 md:p-12 shadow-card grain relative overflow-hidden"
                style={{ top: `${100 + i * 24}px` }}
              >
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-emerald opacity-10 blur-3xl rounded-full pointer-events-none" />
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
              Vos macros, <span className="text-gradient">en temps réel.</span>
            </h2>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-glow group">
            <img src={dashImg} alt="Aperçu tableau de bord NutriOs" className="w-full opacity-90 group-hover:opacity-100 transition-opacity" width={1920} height={1080} loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display font-bold text-2xl">Plan métabolique actif</p>
                <p className="text-sm text-muted-foreground">Suivi journalier des macros et de l'apport calorique</p>
              </div>
              <Link to="/diagnostic" className="rounded-xl bg-gradient-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold shadow-accent">
                Obtenir mon plan
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
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 blur-3xl rounded-full" />
            <div className="relative">
              <h2 className="font-display font-extrabold text-4xl md:text-5xl mb-4">
                Prêt à signer votre <span className="text-gradient-accent">contrat métabolique</span> ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Moins de 90 secondes. Aucune carte bancaire. Plan livré sur WhatsApp ou Email.
              </p>
              <Link to="/diagnostic" className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent text-accent-foreground px-8 py-4 font-bold shadow-accent hover:scale-[1.03] transition-transform">
                Démarrer maintenant <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
