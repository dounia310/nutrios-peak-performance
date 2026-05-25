import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Footprints,
  Heart,
  Waves,
  Target,
  TrendingDown,
  Zap,
  Sparkles,
  Check,
  User,
  PersonStanding,
  Plus,
  AlertTriangle,
  Pill,
  Stethoscope,
  Bone,
  Activity,
} from "lucide-react";
import { saveDiagnostic, type Goal, type Sport, type Gender } from "@/lib/diagnostic";



export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Diagnostic interactif — NutriOs" },
      { name: "description", content: "Assistant multi-étapes pour générer votre profil métabolique : nom, objectif, âge, poids, taille, sport et contexte santé." },
    ],
  }),
  component: Diagnostic,
});
export interface DiagnosticData {
  goal: string; // "perte" | "muscle" | "endurance" | "bien-etre"
  sport?: string;
  // ... autres champs existants
  startDate?: string; // Date de début du plan
  endDate?: string;   // Date de fin calculée
  totalWeeks?: number; // Durée totale en semaines
}

const goals: { id: Goal; label: string; desc: string; Icon: typeof Target }[] = [
  { id: "perte", label: "Perte de poids", desc: "Réduire la masse grasse", Icon: TrendingDown },
  { id: "muscle", label: "Prise de muscle", desc: "Hypertrophie ciblée", Icon: Dumbbell },
  { id: "endurance", label: "Endurance", desc: "Capacité aérobie", Icon: Zap },
  { id: "bien-etre", label: "Bien-être", desc: "Équilibre global", Icon: Sparkles },
];

const sports: { id: Sport | "autre"; label: string; Icon: typeof Dumbbell }[] = [
  { id: "musculation", label: "Musculation", Icon: Dumbbell },
  { id: "running", label: "Running", Icon: Footprints },
  { id: "marche", label: "Marche", Icon: PersonStanding },
  { id: "yoga", label: "Yoga", Icon: Heart },
  { id: "natation", label: "Natation", Icon: Waves },
  { id: "autre", label: "Autre", Icon: Plus },
];

const healthOptions: { id: string; label: string; Icon: typeof AlertTriangle }[] = [
  { id: "allergies", label: "Allergies alimentaires", Icon: AlertTriangle },
  { id: "intolerances", label: "Intolérances", Icon: AlertTriangle },
  { id: "blessures", label: "Blessures", Icon: Bone },
  { id: "traitements", label: "Traitements médicaux", Icon: Pill },
  { id: "chronique", label: "Maladie chronique", Icon: Stethoscope },
  { id: "digestif", label: "Troubles digestifs", Icon: Activity },
  { id: "articulaire", label: "Douleurs articulaires", Icon: Bone },
];

function Diagnostic() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<Goal | "">("");
  const [age, setAge] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [gender, setGender] = useState<Gender | "">("");
  const [sport, setSport] = useState<Sport | "">("");
  const [customSport, setCustomSport] = useState("");
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [customHealth, setCustomHealth] = useState("");
  const [showCustomHealth, setShowCustomHealth] = useState(false);

  const total = 5;

  const canNext =
    (step === 0 && name.trim()) ||
    (step === 1 && goal) ||
    (step === 2 && age && weight && height && gender) ||
    (step === 3 && (sport === "autre" ? customSport.trim() !== "" : sport !== "")) ||
    step === 4;

  const toggleHealthOption = (id: string) => {
    setSelectedHealth((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else {
      const healthData = [
        ...selectedHealth,
        ...(showCustomHealth && customHealth.trim() ? [customHealth.trim()] : []),
      ].join(" ; ");

      saveDiagnostic({
        name: name.trim(),
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        gender: gender as Gender,
        goal: goal as Goal,
        sport: sport === "autre" ? (customSport.trim() as Sport) : (sport as Sport),
        health: healthData,
      });
      navigate({ to: "/results" });
    }
  };

  const handleSportSelect = (id: Sport | "autre") => {
    if (id === "autre") {
      setSport("autre");
      setCustomSport("");
    } else {
      setSport(id);
      setCustomSport("");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            <span>Étape {step + 1} / {total}</span>
            <span>{["Identité", "Objectif", "Physique", "Sport", "Santé"][step]}</span>
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
            {/* Étape 0 : Nom */}
            {step === 0 && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-emerald/20 mb-6">
                    <User className="w-10 h-10 text-primary-glow" />
                  </div>
                  <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">Bienvenue</h2>
                  <p className="text-muted-foreground">Pour commencer, comment devons-nous vous appeler ?</p>
                </div>
                <div className="max-w-md mx-auto">
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Votre prénom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex : Thomas"
                    maxLength={50}
                    className="w-full rounded-xl bg-surface border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-glow text-center"
                    autoFocus
                  />
                </div>
              </>
            )}

            {/* Étape 1 : Objectif */}
            {step === 1 && (
              <>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">
                  {name ? `${name}, quel est votre objectif ?` : "Votre objectif"}
                </h2>
                <p className="text-muted-foreground mb-8">Un seul cap pour calibrer le plan.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {goals.map((g) => {
                    const active = goal === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setGoal(g.id)}
                        className={`text-left rounded-2xl p-6 border transition-all relative overflow-hidden group ${
                          active
                            ? "border-transparent bg-gradient-emerald text-primary-foreground ring-glow"
                            : "border-border bg-surface hover:border-primary-glow"
                        }`}
                      >
                        <g.Icon className={`w-7 h-7 mb-4 ${active ? "text-accent" : "text-primary-glow"}`} />
                        <p className="font-display font-bold text-lg">{g.label}</p>
                        <p className={`text-sm mt-1 ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {g.desc}
                        </p>
                        {active && <Check className="absolute top-4 right-4 w-5 h-5 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Étape 2 : Bio-données */}
            {step === 2 && (
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
                          className={`rounded-xl px-4 py-3 text-sm font-semibold capitalize border transition-all ${
                            gender === g
                              ? "bg-gradient-emerald text-primary-foreground border-transparent ring-glow"
                              : "border-border bg-surface hover:border-primary-glow"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Étape 3 : Sport */}
            {step === 3 && (
              <>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">Votre discipline</h2>
                <p className="text-muted-foreground mb-8">Le sport principal pratiqué cette saison.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {sports.map((s) => {
                    const active = sport === s.id && s.id !== "autre";
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSportSelect(s.id)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 border transition-all ${
                          active
                            ? "border-transparent bg-gradient-emerald text-primary-foreground ring-glow"
                            : "border-border bg-surface hover:border-primary-glow"
                        }`}
                      >
                        <s.Icon className={`w-8 h-8 ${active ? "text-accent" : "text-primary-glow"}`} />
                        <span className="font-semibold text-sm">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Champ de saisie pour "Autre" */}
                {sport === "autre" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="max-w-md mx-auto"
                  >
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
                      Précisez votre sport
                    </label>
                    <input
                      type="text"
                      value={customSport}
                      onChange={(e) => setCustomSport(e.target.value)}
                      placeholder="Ex : CrossFit, Tennis, Escalade..."
                      maxLength={50}
                      className="w-full rounded-xl bg-surface border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-glow text-center"
                      autoFocus
                    />
                  </motion.div>
                )}
              </>
            )}

            {/* Étape 4 : Santé */}
            {step === 4 && (
              <>
                <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">Contexte santé</h2>
                <p className="text-muted-foreground mb-6">Sélectionnez tout ce qui vous concerne (optionnel).</p>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {healthOptions.map((option) => {
                    const active = selectedHealth.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleHealthOption(option.id)}
                        className={`flex items-center gap-3 rounded-xl p-4 border transition-all text-left ${
                          active
                            ? "border-transparent bg-gradient-emerald text-primary-foreground ring-glow"
                            : "border-border bg-surface hover:border-primary-glow"
                        }`}
                      >
                        <option.Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-accent" : "text-primary-glow"}`} />
                        <span className="font-semibold text-sm">{option.label}</span>
                        {active && <Check className="w-4 h-4 ml-auto flex-shrink-0 text-accent" />}
                      </button>
                    );
                  })}
                </div>
                {/* Option "Autre" pour la santé */}
                <div className="max-w-md mx-auto">
                  {!showCustomHealth ? (
                    <button
                      onClick={() => setShowCustomHealth(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-5 py-4 text-sm font-semibold text-muted-foreground hover:border-primary-glow hover:text-foreground transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un autre contexte santé
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
                        Précisez
                      </label>
                      <div className="relative">
                        <textarea
                          value={customHealth}
                          onChange={(e) => setCustomHealth(e.target.value)}
                          rows={3}
                          maxLength={500}
                          placeholder="Ex : intolérance au lactose, tendinite récurrente au genou droit, supplémentation en fer…"
                          className="w-full rounded-xl bg-surface border border-border px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-glow resize-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setShowCustomHealth(false);
                            setCustomHealth("");
                          }}
                          className="absolute top-3 right-3 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Annuler
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
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