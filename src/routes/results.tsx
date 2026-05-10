import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Mail, MessageCircle, Lock, Check, Sparkles, Flame, Beef, Wheat, Droplet, CalendarDays, Sunrise, Sun, Moon, Apple } from "lucide-react";
import { z } from "zod";
import { loadDiagnostic, calcBMI, calcBMR, calcPlanDuration, calcMacros, GOAL_LABEL, SPORT_LABEL, type DiagnosticData, clearDiagnostic } from "@/lib/diagnostic";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Vos résultats — NutriOs" },
      { name: "description", content: "IMC, métabolisme basal, macros et plan détaillé personnalisé selon vos données." },
    ],
  }),
  component: Results,
});

const leadSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(200),
  whatsapp: z.string().trim().min(6, "Numéro requis").max(30).regex(/^[+0-9 ()-]+$/, "Format invalide"),
});

function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [modal, setModal] = useState<null | "wa" | "email">(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const d = loadDiagnostic();
    if (!d || !d.age || !d.weight || !d.height || !d.gender || !d.goals || !d.goals.length || !d.sport) {
      navigate({ to: "/diagnostic" });
      return;
    }
    setData(d as DiagnosticData);
  }, [navigate]);

  const computed = useMemo(() => {
    if (!data) return null;
    const bmi = calcBMI(data.weight, data.height);
    const bmr = calcBMR(data.weight, data.height, data.age, data.gender);
    const duration = calcPlanDuration(bmi, data.goals);
    const macros = calcMacros(bmr, data.sport, data.goals, data.weight);
    return { bmi, bmr, duration, macros };
  }, [data]);

  if (!data || !computed) {
    return <div className="min-h-screen pt-40 text-center text-muted-foreground">Chargement…</div>;
  }

  const bmiCategory =
    computed.bmi < 18.5 ? "Sous-poids" :
    computed.bmi < 25 ? "Optimal" :
    computed.bmi < 30 ? "Surpoids" : "Obésité";

  const bmiColor = computed.bmi >= 18.5 && computed.bmi < 25 ? "text-primary-glow" : "text-accent";

  const goalsLabel = data.goals.map((g) => GOAL_LABEL[g]).join(" + ");

  const handleSubmit = async (mode: "wa" | "email") => {
    const parsed = leadSchema.safeParse({ name, email, whatsapp: wa });
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.from("diagnostics").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      age: data.age,
      weight: data.weight,
      height: data.height,
      gender: data.gender,
      goal: data.goals.join(","),
      sport: data.sport,
      health_notes: data.health || null,
      bmi: Number(computed.bmi.toFixed(2)),
      bmr: Math.round(computed.bmr),
      plan_duration: computed.duration,
    });
    setSubmitting(false);
    if (error) {
      setErrors({ form: "Une erreur est survenue. Réessayez." });
      return;
    }
    setDone(true);
    if (mode === "wa") {
      const msg = `Bonjour NutriOs, mon IMC est de ${computed.bmi.toFixed(1)}, mon métabolisme basal est de ${Math.round(computed.bmr)} kcal et mes objectifs sont : ${goalsLabel}. Apport cible : ${computed.macros.calories} kcal/jour (P ${computed.macros.protein}g · G ${computed.macros.carbs}g · L ${computed.macros.fats}g). Plan demandé : ${computed.duration} semaines.`;
      const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      setTimeout(() => window.open(url, "_blank"), 600);
    }
  };

  const reset = () => { clearDiagnostic(); navigate({ to: "/diagnostic" }); };

  // Plan hebdomadaire type
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const trainingFor = (i: number): string => {
    const sport = SPORT_LABEL[data.sport];
    const pattern = data.goals.includes("muscle")
      ? ["Force haut", "Cardio léger", "Force bas", "Repos actif", "Full body", sport, "Récupération"]
      : data.goals.includes("endurance")
      ? [sport, "Renfo", sport + " long", "Repos", "Fractionné", sport, "Mobilité"]
      : data.goals.includes("perte")
      ? [sport, "Marche 45'", "HIIT", "Repos actif", sport, "Cardio modéré", "Yoga"]
      : [sport, "Mobilité", sport, "Marche", "Yoga", sport, "Repos"];
    return pattern[i];
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Synthèse métabolique</p>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl mb-4">
            Votre <span className="text-gradient">empreinte nutritionnelle</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Calculs basés sur l'équation Mifflin-St Jeor, validée cliniquement pour les athlètes.
          </p>
        </motion.div>

        <div className={`grid md:grid-cols-3 gap-6 mb-10 transition ${modal ? "blur-sm pointer-events-none" : ""}`}>
          <MetricCard label="IMC" value={computed.bmi.toFixed(1)} sub={bmiCategory} subColor={bmiColor} formula="Poids / Taille²" />
          <MetricCard label="Métabolisme basal" value={Math.round(computed.bmr).toLocaleString("fr-FR")} sub="kcal / jour" highlight formula="Mifflin-St Jeor" />
          <MetricCard label="Plan recommandé" value={`${computed.duration}`} sub="semaines" subColor="text-accent" formula={`${goalsLabel} · ${SPORT_LABEL[data.sport]}`} />
        </div>

        {/* Profil détaillé */}
        <div className={`rounded-3xl glass p-8 md:p-12 mb-10 transition ${modal ? "blur-sm pointer-events-none" : ""}`}>
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-primary-glow" />
            <h3 className="font-display font-bold text-xl">Profil détaillé</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <Detail label="Âge" value={`${data.age} ans`} />
            <Detail label="Poids" value={`${data.weight} kg`} />
            <Detail label="Taille" value={`${data.height} cm`} />
            <Detail label="Genre" value={data.gender} className="capitalize" />
            <Detail label="Objectifs" value={goalsLabel} className="col-span-2" />
            <Detail label="Sport" value={SPORT_LABEL[data.sport]} />
            {data.health && <Detail label="Notes santé" value={data.health} className="col-span-2 md:col-span-4" />}
          </div>
          <button onClick={reset} className="mt-6 text-xs text-muted-foreground hover:text-foreground underline">
            Recommencer le diagnostic
          </button>
        </div>

        {/* PLAN DÉTAILLÉ */}
        <section className={`mb-12 transition ${modal ? "blur-sm pointer-events-none" : ""}`}>
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-primary-glow mb-2">Votre programme</p>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl">Plan nutritionnel détaillé</h2>
          </div>

          {/* Macros */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <MacroCard Icon={Flame} label="Apport cible" value={`${computed.macros.calories.toLocaleString("fr-FR")}`} unit="kcal/jour" tone="accent" />
            <MacroCard Icon={Beef} label="Protéines" value={`${computed.macros.protein}`} unit="g" />
            <MacroCard Icon={Wheat} label="Glucides" value={`${computed.macros.carbs}`} unit="g" />
            <MacroCard Icon={Droplet} label="Lipides" value={`${computed.macros.fats}`} unit="g" />
          </div>

          {/* Répartition journalière */}
          <div className="rounded-3xl glass p-8 md:p-10 mb-8">
            <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary-glow" /> Répartition journalière type
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <Meal Icon={Sunrise} title="Petit-déj" pct={25} cal={Math.round(computed.macros.calories * 0.25)} sample="Avoine, fruits rouges, œufs, café" />
              <Meal Icon={Sun} title="Déjeuner" pct={35} cal={Math.round(computed.macros.calories * 0.35)} sample="Protéine maigre, riz complet, légumes verts" />
              <Meal Icon={Apple} title="Collation" pct={15} cal={Math.round(computed.macros.calories * 0.15)} sample="Yaourt grec, oléagineux, fruit" />
              <Meal Icon={Moon} title="Dîner" pct={25} cal={Math.round(computed.macros.calories * 0.25)} sample="Poisson/tofu, patate douce, salade" />
            </div>
          </div>

          {/* Programme hebdo */}
          <div className="rounded-3xl glass p-8 md:p-10 mb-8">
            <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-3">
              <Activity className="w-5 h-5 text-accent" /> Semaine type d'entraînement
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
              {weekDays.map((d, i) => (
                <div key={d} className="rounded-2xl bg-surface border border-border p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{d}</p>
                  <p className="font-semibold text-sm">{trainingFor(i)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phases du plan */}
          <div className="rounded-3xl glass p-8 md:p-10">
            <h3 className="font-display font-bold text-xl mb-6">Phases sur {computed.duration} semaines</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Phase n={1} title="Adaptation" weeks={`Semaines 1–${Math.max(1, Math.round(computed.duration / 3))}`} desc="Rééquilibrage métabolique, mise en place des macros et hydratation cible." />
              <Phase n={2} title="Progression" weeks={`Semaines ${Math.round(computed.duration / 3) + 1}–${Math.round((computed.duration / 3) * 2)}`} desc="Intensification de la charge nutritionnelle et sportive selon vos objectifs." />
              <Phase n={3} title="Consolidation" weeks={`Semaines ${Math.round((computed.duration / 3) * 2) + 1}–${computed.duration}`} desc="Stabilisation des résultats et automatisation des habitudes long terme." />
            </div>
          </div>
        </section>

        {/* CTA — recevoir le plan */}
        <div className={`transition ${modal ? "blur-sm pointer-events-none" : ""}`}>
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Aller plus loin</p>
            <h3 className="font-display font-extrabold text-2xl md:text-3xl">Recevez le plan complet à conserver</h3>
            <p className="text-muted-foreground text-sm mt-2">PDF détaillé, recettes, suivi quotidien — par WhatsApp ou email.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setModal("wa")}
              className="group rounded-2xl bg-gradient-accent text-accent-foreground p-6 text-left shadow-accent hover:scale-[1.02] transition-transform"
            >
              <MessageCircle className="w-6 h-6 mb-3" />
              <p className="font-display font-extrabold text-2xl mb-1">Recevoir sur WhatsApp</p>
              <p className="text-sm opacity-80">Plan détaillé envoyé en PDF + suivi quotidien</p>
            </button>
            <button
              onClick={() => setModal("email")}
              className="group rounded-2xl glass p-6 text-left hover:bg-surface-elevated transition-colors"
            >
              <Mail className="w-6 h-6 mb-3 text-primary-glow" />
              <p className="font-display font-extrabold text-2xl mb-1">Recevoir par Email</p>
              <p className="text-sm text-muted-foreground">Synthèse complète avec macros et calendrier</p>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/70 backdrop-blur-xl"
            onClick={() => !submitting && !done && setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl glass p-8 shadow-glow relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-emerald opacity-20 blur-3xl rounded-full" />
              {done ? (
                <div className="text-center py-6 relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-emerald grid place-items-center mx-auto mb-4 shadow-glow">
                    <Check className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-extrabold text-2xl mb-2">Plan en route</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {modal === "wa" ? "WhatsApp s'ouvre dans un nouvel onglet." : "Vous recevrez votre plan par email d'ici 5 minutes."}
                  </p>
                  <button onClick={() => { setModal(null); setDone(false); }} className="rounded-xl bg-gradient-emerald text-primary-foreground px-5 py-2.5 font-semibold">
                    Fermer
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-[0.25em] text-accent">
                    <Sparkles className="w-3.5 h-3.5" /> Capture sécurisée
                  </div>
                  <h3 className="font-display font-extrabold text-2xl mb-1">
                    {modal === "wa" ? "Envoi WhatsApp" : "Envoi Email"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Vos données sont chiffrées. Aucune revente.
                  </p>
                  <div className="space-y-3">
                    <Input label="Nom" value={name} onChange={setName} error={errors.name} />
                    <Input label="Email" value={email} onChange={setEmail} type="email" error={errors.email} />
                    <Input label="WhatsApp" value={wa} onChange={setWa} placeholder="+33 6 12 34 56 78" error={errors.whatsapp} />
                  </div>
                  {errors.form && <p className="text-destructive text-xs mt-3">{errors.form}</p>}
                  <button
                    onClick={() => handleSubmit(modal)}
                    disabled={submitting}
                    className="w-full mt-6 rounded-xl bg-gradient-accent text-accent-foreground py-3 font-bold shadow-accent disabled:opacity-50"
                  >
                    {submitting ? "Envoi…" : modal === "wa" ? "Recevoir sur WhatsApp" : "Recevoir par Email"}
                  </button>
                  <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                    <Lock className="w-3 h-3" /> Connexion chiffrée bout-en-bout
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, sub, subColor = "text-muted-foreground", formula, highlight }: { label: string; value: string; sub: string; subColor?: string; formula: string; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className={`rounded-3xl p-8 relative overflow-hidden ${highlight ? "bg-gradient-emerald shadow-glow text-primary-foreground" : "glass"}`}
    >
      {highlight && <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 blur-3xl rounded-full" />}
      <p className={`text-xs uppercase tracking-[0.25em] mb-3 ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
      <p className="font-display font-extrabold text-5xl md:text-6xl tracking-tight">{value}</p>
      <p className={`mt-2 font-semibold ${highlight ? "text-accent" : subColor}`}>{sub}</p>
      <p className={`mt-4 text-xs ${highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{formula}</p>
    </motion.div>
  );
}

function MacroCard({ Icon, label, value, unit, tone }: { Icon: typeof Flame; label: string; value: string; unit: string; tone?: "accent" }) {
  return (
    <div className={`rounded-2xl p-6 border ${tone === "accent" ? "bg-gradient-accent text-accent-foreground border-transparent shadow-accent" : "glass border-border"}`}>
      <Icon className={`w-6 h-6 mb-3 ${tone === "accent" ? "" : "text-primary-glow"}`} />
      <p className={`text-xs uppercase tracking-[0.2em] mb-2 ${tone === "accent" ? "text-accent-foreground/80" : "text-muted-foreground"}`}>{label}</p>
      <p className="font-display font-extrabold text-3xl">{value}</p>
      <p className={`text-xs mt-1 ${tone === "accent" ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{unit}</p>
    </div>
  );
}

function Meal({ Icon, title, pct, cal, sample }: { Icon: typeof Sun; title: string; pct: number; cal: number; sample: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-accent" />
        <p className="font-display font-bold">{title}</p>
        <span className="ml-auto text-xs text-muted-foreground">{pct}%</span>
      </div>
      <p className="font-display font-extrabold text-2xl">{cal.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-sans font-normal">kcal</span></p>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{sample}</p>
    </div>
  );
}

function Phase({ n, title, weeks, desc }: { n: number; title: string; weeks: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-6 relative overflow-hidden">
      <p className="absolute top-3 right-4 font-display font-extrabold text-5xl text-primary/10">0{n}</p>
      <p className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-2">{weeks}</p>
      <p className="font-display font-bold text-lg mb-2">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, error }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl bg-surface border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-glow ${error ? "border-destructive" : "border-border"}`}
      />
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}
