import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Microscope, BookOpen, Calculator, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "L'approche scientifique — NutriOs" },
      { name: "description", content: "Équations métaboliques, rigueur clinique et méthodologie validée. Mifflin-St Jeor, IMC et calibration des plans NutriOs." },
    ],
  }),
  component: Science,
});

function Science() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">L'approche</p>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl tracking-tight mb-6">
            La <span className="text-gradient">science</span>, pas le marketing.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-12">
            NutriOs n'invente rien. Nous orchestrons des équations validées par la littérature clinique
            depuis trente ans, et nous les mettons au service du sportif de haut niveau.
          </p>
        </motion.div>

        <article className="space-y-16">
          <Section
            icon={Calculator}
            kicker="Équation 01"
            title="Indice de Masse Corporelle"
            equation="IMC = Poids (kg) / Taille (m)²"
            body="Premier indicateur de calibration. L'IMC ne définit pas la composition corporelle d'un athlète, mais il sert de point d'ancrage pour ajuster la durée et l'intensité du plan. Un athlète sous 22 d'IMC visant la masse musculaire reçoit automatiquement un plan plus long, à plus haute densité calorique."
          />

          <Section
            icon={Microscope}
            kicker="Équation 02"
            title="Mifflin-St Jeor — Métabolisme basal"
            equation={`Homme  : MB = 10·P + 6,25·T − 5·A + 5
Femme : MB = 10·P + 6,25·T − 5·A − 161`}
            body="Publiée en 1990 et reconnue par l'American Dietetic Association comme la formule la plus précise pour estimer la dépense énergétique de repos. Elle remplace avantageusement Harris-Benedict, jugée moins fiable sur les populations sportives modernes."
          />

          <Section
            icon={BookOpen}
            kicker="Calibration 03"
            title="Durée de plan adaptative"
            equation={`Bien-être        →  4 semaines
Endurance        →  8 semaines
Muscle (IMC<22)  →  12 semaines
Perte (IMC≥30)   →  12 semaines`}
            body="La durée n'est jamais arbitraire. Elle est calculée à partir du croisement entre l'IMC initial et l'objectif déclaré. Cette logique évite les plans trop courts pour des transformations profondes, et trop longs pour des ajustements légers."
          />

          <Section
            icon={ShieldCheck}
            kicker="Éthique"
            title="Données chiffrées, hébergement européen"
            equation="AES-256 · TLS 1.3 · Hébergement EU"
            body="Vos bio-données sont des données médicales sensibles. Chaque diagnostic est chiffré au repos et en transit. Aucun partage commercial. Vous pouvez supprimer votre profil à tout moment depuis votre tableau de bord."
          />
        </article>

        <div className="mt-20 rounded-3xl glass p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-emerald opacity-15" />
          <div className="relative">
            <h3 className="font-display font-extrabold text-3xl mb-3">
              Prêt à mettre la science <span className="text-gradient-accent">à votre service</span> ?
            </h3>
            <Link to="/diagnostic" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-accent text-accent-foreground px-6 py-3 font-bold shadow-accent">
              Lancer mon diagnostic <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, kicker, title, equation, body }: { icon: typeof Calculator; kicker: string; title: string; equation: string; body: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-emerald grid place-items-center shadow-glow">
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-accent">{kicker}</span>
      </div>
      <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-5 tracking-tight">{title}</h2>
      <pre className="rounded-2xl glass p-5 text-sm md:text-base font-mono text-primary-glow whitespace-pre-wrap mb-5 overflow-x-auto">
        {equation}
      </pre>
      <p className="text-muted-foreground leading-relaxed text-lg">{body}</p>
    </motion.section>
  );
}
