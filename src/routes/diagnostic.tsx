import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Dumbbell, Footprints, Heart, Waves, Target, TrendingDown, Zap, Sparkles, Check, PersonStanding } from "lucide-react";
import { saveDiagnostic, type Goal, type Sport, type Gender } from "@/lib/diagnostic";

export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Diagnostic interactif — NutriOs" },
      { name: "description", content: "Assistant multi-étapes pour générer votre profil métabolique : âge, poids, taille, objectif, sport et contexte santé." },
    ],
  }),
  component: Diagnostic,
});

const goals: { id: Goal; label: string; desc: string; Icon: typeof Target }[] = [
  { id: "perte", label: "Perte de poids", desc: "Réduire la masse grasse", Icon: TrendingDown },
  { id: "muscle", label: "Prise de muscle", desc: "Hypertrophie ciblée", Icon: Dumbbell },
  { id: "endurance", label: "Endurance", desc: "Capacité aérobie", Icon: Zap },
  { id: "bien-etre", label: "Bien-être", desc: "Équilibre global", Icon: Sparkles },
];

const sports: { id: Sport; label: string; Icon: typeof Dumbbell }[] = [
  { id: "musculation", label: "Musculation", Icon: Dumbbell },
  { id: "running", label: "Running", Icon: Footprints },
  { id: "yoga", label: "Yoga", Icon: Heart },
  { id: "natation", label: "Natation", Icon: Waves },
];

function Diagnostic() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [gender, setGender] = useState<Gender | "">("");
  const [goal, setGoal] = useState<Goal | "">("");
  const [sport, setSport] = useState<Sport | "">("");
  const [health, setHealth] = useState("");

  const total = 4;
  const canNext =
    (step === 0 && age && weight && height && gender) ||
    (step === 1 && goal) ||
    (step === 2 && sport) ||
    step === 3;

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else {
      saveDiagnostic({
        age: Number(age), weight: Number(weight), height: Number(height),
        gender: gender as Gender, goal: goal as Goal, sport: sport as Sport, health,
      });
      navigate({ to: "/results" });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            <span>Étape {step + 1} / {total}</span>
            <span>{["Physique", "Objectif", "Sport", "Santé"][step]}</span>
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-accent"
              initial={false}
              animate={{ width: `${((step + 1) / total) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl glass p-8 md:p-12 shadow-card"
          >
            {step === 0 && (
              <>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">Bio-données</h2>
                <p className="text-muted-foreground mb-8">Quatre indicateurs pour cartographier votre métabolisme.</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Âge" suffix="ans" value={age} onChange={(v) => setAge(v)} />
                  <Field label="Poids" suffix="kg" value={weight} onChange={(v) => setWeight(v)} />
                  <Field label="Taille" suffix="cm" value={height} onChange={(v) => setHeight(v)} />
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Genre</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["homme", "femme"] as Gender[]).map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`rounded-xl px-4 py-3 text-sm font-semibold capitalize border transition-all ${gender === g ? "bg-gradient-emerald text-primary-foreground border-transparent ring-glow" : "border-border bg-surface hover:border-primary-glow"}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">Votre objectif</h2>
                <p className="text-muted-foreground mb-8">Un seul cap pour calibrer le plan.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {goals.map((g) => {
                    const active = goal === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setGoal(g.id)}
                        className={`text-left rounded-2xl p-6 border transition-all relative overflow-hidden group ${active ? "border-transparent bg-gradient-emerald text-primary-foreground ring-glow" : "border-border bg-surface hover:border-primary-glow"}`}
                      >
                        <g.Icon className={`w-7 h-7 mb-4 ${active ? "text-accent" : "text-primary-glow"}`} />
                        <p className="font-display font-bold text-lg">{g.label}</p>
                        <p className={`text-sm mt-1 ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{g.desc}</p>
                        {active && <Check className="absolute top-4 right-4 w-5 h-5 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">Votre discipline</h2>
                <p className="text-muted-foreground mb-8">Le sport principal pratiqué cette saison.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {sports.map((s) => {
                    const active = sport === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSport(s.id)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 border transition-all ${active ? "border-transparent bg-gradient-emerald text-primary-foreground ring-glow" : "border-border bg-surface hover:border-primary-glow"}`}
                      >
                        <s.Icon className={`w-8 h-8 ${active ? "text-accent" : "text-primary-glow"}`} />
                        <span className="font-semibold text-sm">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">Contexte santé</h2>
                <p className="text-muted-foreground mb-8">Allergies, intolérances, blessures, traitements (optionnel).</p>
                <textarea
                  value={health}
                  onChange={(e) => setHealth(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  placeholder="Ex : intolérance au lactose, tendinite récurrente au genou droit, supplémentation en fer…"
                  className="w-full rounded-2xl bg-surface border border-border p-5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-glow resize-none"
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border border-border disabled:opacity-30 hover:bg-surface transition"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <button
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent text-accent-foreground px-6 py-3 text-sm font-bold shadow-accent disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.03] transition-transform"
          >
            {step === total - 1 ? "Calculer mon profil" : "Continuer"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, suffix, value, onChange }: { label: string; suffix: string; value: number | ""; onChange: (v: number | "") => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full rounded-xl bg-surface border border-border px-4 py-3.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-glow"
          placeholder="—"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground uppercase tracking-wider">{suffix}</span>
      </div>
    </div>
  );
}
