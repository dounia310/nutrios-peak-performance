import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Mail, MessageCircle, Lock, Check, Sparkles } from "lucide-react";
import { z } from "zod";
import { loadDiagnostic, calcBMI, calcBMR, calcPlanDuration, GOAL_LABEL, SPORT_LABEL, type DiagnosticData, clearDiagnostic } from "@/lib/diagnostic";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Vos résultats — NutriOs" },
      { name: "description", content: "IMC, métabolisme basal et durée de plan personnalisée selon vos données." },
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
    if (!d || !d.age || !d.weight || !d.height || !d.gender || !d.goal || !d.sport) {
      navigate({ to: "/diagnostic" });
      return;
    }
    setData(d as DiagnosticData);
  }, [navigate]);

  const computed = useMemo(() => {
    if (!data) return null;
    const bmi = calcBMI(data.weight, data.height);
    const bmr = calcBMR(data.weight, data.height, data.age, data.gender);
    const duration = calcPlanDuration(bmi, data.goal);
    return { bmi, bmr, duration };
  }, [data]);

  if (!data || !computed) {
    return <div className="min-h-screen pt-40 text-center text-muted-foreground">Chargement…</div>;
  }

  const bmiCategory =
    computed.bmi < 18.5 ? "Sous-poids" :
    computed.bmi < 25 ? "Optimal" :
    computed.bmi < 30 ? "Surpoids" : "Obésité";

  const bmiColor = computed.bmi >= 18.5 && computed.bmi < 25 ? "text-primary-glow" : "text-accent";

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
      goal: data.goal,
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
      const msg = `Bonjour NutriOs, mon IMC est de ${computed.bmi.toFixed(1)}, mon métabolisme basal est de ${Math.round(computed.bmr)} kcal et mon objectif est : ${GOAL_LABEL[data.goal]}. Plan demandé : ${computed.duration} semaines.`;
      const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      setTimeout(() => window.open(url, "_blank"), 600);
    }
  };

  const reset = () => { clearDiagnostic(); navigate({ to: "/diagnostic" }); };

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
          <MetricCard
            label="IMC"
            value={computed.bmi.toFixed(1)}
            sub={bmiCategory}
            subColor={bmiColor}
            formula="Poids / Taille²"
          />
          <MetricCard
            label="Métabolisme basal"
            value={Math.round(computed.bmr).toLocaleString("fr-FR")}
            sub="kcal / jour"
            highlight
            formula="Mifflin-St Jeor"
          />
          <MetricCard
            label="Plan recommandé"
            value={`${computed.duration}`}
            sub="semaines"
            subColor="text-accent"
            formula={`${GOAL_LABEL[data.goal]} · ${SPORT_LABEL[data.sport]}`}
          />
        </div>

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
            <Detail label="Objectif" value={GOAL_LABEL[data.goal]} />
            <Detail label="Sport" value={SPORT_LABEL[data.sport]} />
            {data.health && <Detail label="Notes santé" value={data.health} className="col-span-2" />}
          </div>
          <button onClick={reset} className="mt-6 text-xs text-muted-foreground hover:text-foreground underline">
            Recommencer le diagnostic
          </button>
        </div>

        <div className={`grid md:grid-cols-2 gap-4 transition ${modal ? "blur-sm pointer-events-none" : ""}`}>
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
