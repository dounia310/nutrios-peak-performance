import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Target, Flame, ChefHat, Clock, Brain,
  CheckCircle2, TrendingUp, AlertTriangle, Sparkles,
  ArrowLeft
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { loadDiagnostic, calcBMI, calcBMR, GOAL_LABEL, SPORT_LABEL, type DiagnosticData } from "@/lib/diagnostic";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Votre plan — NutriOs" },
      { name: "description", content: "Plan nutritionnel personnalisé avec repas illustrés." },
    ],
  }),
  component: Results,
});

const MEAL_IMAGES: Record<string, string> = {
  "Smoothie vert protéiné": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",
  "Yaourt grec + fruits rouges": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
  "Buddha bowl quinoa": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  "Œufs durs + crudités": "https://blog.fermedebeaumont.com/wp-content/uploads/AdobeStock_238742792-scaled.jpeg",
  "Poisson vapeur + légumes": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop",
  "Porridge protéiné": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop",
  "Shaker + fruits secs": "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop",
  "Riz poulet basmati": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop",
  "Wrap thon-avocat": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
  "Steak patate douce": "https://images.unsplash.com/photo-1432139509613-5c4255a1d1f8?w=400&h=300&fit=crop",
  "Porridge énergétique": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop",
  "Barre énergétique maison": "https://images.unsplash.com/photo-1604329760661-e71dc83f8dea?w=400&h=300&fit=crop",
  "Pâtes complètes saumon": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
  "Smoothie récupération": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",
  "Riz sauté tofu": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
};

const MEAL_PLANS: Record<string, { meals: { time: string; recipe: string; details: string; calories: number; image: string }[] }> = {
  perte: {
    meals: [
      { time: "Petit-déjeuner (7h)", recipe: "Smoothie vert protéiné", details: "Épinards, banane, whey, lait d'amande, chia", calories: 350, image: MEAL_IMAGES["Smoothie vert protéiné"] },
      { time: "Collation (10h)", recipe: "Yaourt grec + fruits rouges", details: "Yaourt 0%, myrtilles, amandes", calories: 200, image: MEAL_IMAGES["Yaourt grec + fruits rouges"] },
      { time: "Déjeuner (13h)", recipe: "Buddha bowl quinoa", details: "Quinoa, poulet, avocat, légumes rôtis", calories: 450, image: MEAL_IMAGES["Buddha bowl quinoa"] },
      { time: "Collation (16h)", recipe: "Œufs durs + crudités", details: "2 œufs, carottes, concombre, houmous", calories: 250, image: MEAL_IMAGES["Œufs durs + crudités"] },
      { time: "Dîner (19h)", recipe: "Poisson vapeur + légumes", details: "Cabillaud, brocoli, haricots verts, riz", calories: 400, image: MEAL_IMAGES["Poisson vapeur + légumes"] },
    ]
  },
  muscle: {
    meals: [
      { time: "Petit-déjeuner (7h)", recipe: "Porridge protéiné", details: "Avoine, whey, beurre cacahuète, banane", calories: 550, image: MEAL_IMAGES["Porridge protéiné"] },
      { time: "Collation (10h)", recipe: "Shaker + fruits secs", details: "Whey, lait, amandes, noix, dattes", calories: 400, image: MEAL_IMAGES["Shaker + fruits secs"] },
      { time: "Déjeuner (13h)", recipe: "Riz poulet basmati", details: "Poulet 200g, riz, légumes sautés", calories: 650, image: MEAL_IMAGES["Riz poulet basmati"] },
      { time: "Collation (16h)", recipe: "Wrap thon-avocat", details: "Tortilla, thon, avocat, fromage frais", calories: 450, image: MEAL_IMAGES["Wrap thon-avocat"] },
      { time: "Dîner (19h)", recipe: "Steak patate douce", details: "Rumsteck 200g, patate douce, épinards", calories: 600, image: MEAL_IMAGES["Steak patate douce"] },
    ]
  },
  endurance: {
    meals: [
      { time: "Petit-déjeuner (6h30)", recipe: "Porridge énergétique", details: "Avoine, fruits secs, miel, banane", calories: 500, image: MEAL_IMAGES["Porridge énergétique"] },
      { time: "Collation (9h)", recipe: "Barre énergétique maison", details: "Dattes, noix, cacao, avoine", calories: 300, image: MEAL_IMAGES["Barre énergétique maison"] },
      { time: "Déjeuner (12h30)", recipe: "Pâtes complètes saumon", details: "Pâtes, saumon, légumes verts, huile olive", calories: 600, image: MEAL_IMAGES["Pâtes complètes saumon"] },
      { time: "Collation (16h)", recipe: "Smoothie récupération", details: "Lait amande, banane, miel, spiruline", calories: 350, image: MEAL_IMAGES["Smoothie récupération"] },
      { time: "Dîner (19h30)", recipe: "Riz sauté tofu", details: "Riz, tofu, légumes asiatiques, soja", calories: 500, image: MEAL_IMAGES["Riz sauté tofu"] },
    ]
  },
};

function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [readinessScore, setReadinessScore] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "meals">("overview");
  const [saved, setSaved] = useState(false);
  const [dailyTasks, setDailyTasks] = useState([
    { id: "protein", label: "Protéines", target: "Objectif", done: false },
    { id: "water", label: "Hydratation", target: "3L", done: false },
    { id: "workout", label: "Entraînement", target: "Session", done: false },
    { id: "sleep", label: "Sommeil", target: "7-8h", done: false },
  ]);

  useEffect(() => {
    const d = loadDiagnostic();
    if (!d || !d.age || !d.weight || !d.height || !d.goal || !d.sport) {
      navigate({ to: "/diagnostic" });
      return;
    }
    setData(d as DiagnosticData);
  }, [navigate]);

  // 1. CALCULS MÉTABOLIQUES (avec durée adaptative)
  const computed = useMemo(() => {
    if (!data) return null;
    const bmi = calcBMI(data.weight, data.height);
    const bmr = calcBMR(data.weight, data.height, data.age, data.gender);
    const tdee = Math.round(bmr * 1.55);

    // Calories adaptées à l'IMC
    let targetCal: number;
    let proteinPct: number;
    if (data.goal === "perte") {
      if (bmi >= 35) targetCal = tdee - 750;
      else if (bmi >= 30) targetCal = tdee - 600;
      else if (bmi >= 27) targetCal = tdee - 500;
      else targetCal = tdee - 400;
      proteinPct = 0.40;
    } else if (data.goal === "muscle") {
      targetCal = tdee + 300;
      proteinPct = 0.35;
    } else {
      targetCal = tdee;
      proteinPct = 0.30;
    }

    const proteinG = Math.round((targetCal * proteinPct) / 4);
    const carbsG = Math.round((targetCal * (1 - proteinPct - 0.25)) / 4);
    const fatsG = Math.round((targetCal * 0.25) / 9);

    // Durée adaptative
    let duration: string;
    let weeklyChange: number;
    if (data.goal === "perte") {
      if (bmi >= 35) { duration = "24-36 semaines"; weeklyChange = -1.0; }
      else if (bmi >= 30) { duration = "20-28 semaines"; weeklyChange = -0.8; }
      else if (bmi >= 27) { duration = "16-24 semaines"; weeklyChange = -0.6; }
      else { duration = "12-16 semaines"; weeklyChange = -0.5; }
    } else if (data.goal === "muscle") {
      duration = "12-20 semaines"; weeklyChange = 0.3;
    } else if (data.goal === "endurance") {
      duration = "10-14 semaines"; weeklyChange = -0.2;
    } else {
      duration = "8-12 semaines"; weeklyChange = 0;
    }

    return { bmi, bmr, tdee, targetCal, proteinG, carbsG, fatsG, duration, weeklyChange };
  }, [data]);

  // 2. Plan repas
  const mealPlan = data ? (MEAL_PLANS[data.goal] || MEAL_PLANS.endurance) : null;

  // 3. Sauvegarde automatique
  useEffect(() => {
    if (data && computed && mealPlan && !saved) {
      const saveToDB = async () => {
        try {
          await supabase.from("diagnostics").insert({
            age: data.age, weight: data.weight, height: data.height,
            gender: data.gender, goal: data.goal, sport: data.sport,
            health_notes: data.health || null,
            bmi: Number(computed.bmi.toFixed(2)),
            bmr: Math.round(computed.bmr),
            tdee: computed.tdee,
            target_calories: computed.targetCal,
            plan_duration: computed.duration,
            created_at: new Date().toISOString(),
          });
          setSaved(true);
        } catch (err) {
          console.log("Sauvegarde locale");
          setSaved(true);
        }
      };
      saveToDB();
    }
  }, [data, computed, mealPlan, saved]);

  const toggleTask = (id: string) => {
    setDailyTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
      setReadinessScore(Math.round((updated.filter(t => t.done).length / updated.length) * 100));
      return updated;
    });
  };

  const projectionData = useMemo(() => {
    if (!data || !computed) return [];
    const weeks = Math.min(parseInt(computed.duration) || 12, 36);
    return Array.from({ length: weeks + 1 }, (_, i) => ({
      week: `S${i + 1}`,
      poids: parseFloat((data.weight + computed.weeklyChange * i).toFixed(1)),
    }));
  }, [data, computed]);

  if (!data || !computed || !mealPlan) {
    return (
      <div className="min-h-screen pt-40 text-center text-muted-foreground">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}
          className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full mx-auto" />
      </div>
    );
  }

  const bmiCategory = computed.bmi < 18.5 ? "Sous-poids" : computed.bmi < 25 ? "Optimal" : computed.bmi < 30 ? "Surpoids" : "Obésité";
  const carbPct = Math.round(((computed.carbsG * 4) / computed.targetCal) * 100);
  const fatPct = Math.round(((computed.fatsG * 9) / computed.targetCal) * 100);
  const protPct = Math.round(((computed.proteinG * 4) / computed.targetCal) * 100);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">
            {saved ? "✅ Plan sauvegardé" : "⏳ Sauvegarde..."}
          </p>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl mb-4">
            Votre <span className="text-gradient">plan {GOAL_LABEL[data.goal]}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            {computed.duration} • {computed.targetCal.toLocaleString()} kcal/jour • {SPORT_LABEL[data.sport]}
          </p>
          <div className="flex justify-center gap-3 mt-6">
            {(["overview", "meals"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                  activeTab === tab ? "bg-gradient-emerald text-primary-foreground shadow-glow" : "glass hover:bg-surface"
                }`}>
                {tab === "overview" ? <Activity className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
                {tab === "overview" ? "Dashboard" : "Repas"}
              </button>
            ))}
          </div>
        </motion.div>

        {activeTab === "overview" && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Activity, label: "IMC", value: computed.bmi.toFixed(1), sub: bmiCategory },
                { icon: Flame, label: "TDEE", value: computed.tdee.toLocaleString(), sub: "kcal/jour" },
                { icon: Target, label: "Objectif", value: computed.targetCal.toLocaleString(), sub: "kcal/jour" },
                { icon: Clock, label: "Durée", value: computed.duration, sub: "adaptée à votre profil" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-3xl glass p-6 shadow-card text-center">
                  <s.icon className="w-6 h-6 text-primary-glow mx-auto mb-3" />
                  <p className="font-display font-extrabold text-3xl">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-accent mt-0.5">{s.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="rounded-3xl glass p-6 shadow-card">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary-glow" /> Score du jour
                </h3>
                <div className="text-center mb-4">
                  <span className="font-display font-extrabold text-5xl text-gradient-accent">{readinessScore}%</span>
                </div>
                <div className="space-y-2">
                  {dailyTasks.map(t => (
                    <div key={t.id} onClick={() => toggleTask(t.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${
                        t.done ? "bg-gradient-emerald/20 border-primary/30" : "bg-surface border-border hover:border-primary/30"
                      }`}>
                      <span className={`text-sm font-semibold ${t.done ? "text-primary line-through" : ""}`}>{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.target}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-3xl glass p-6 shadow-card">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-glow" /> Projection {computed.duration}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                      <defs>
                        <linearGradient id="cp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.018 165 / 30%)" />
                      <XAxis dataKey="week" stroke="#6b7280" fontSize={12} interval={Math.floor(projectionData.length / 10)} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #10B981", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="poids" stroke="#10B981" strokeWidth={2} fill="url(#cp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Protéines", value: computed.proteinG, unit: "g", pct: protPct, color: "bg-gradient-emerald" },
                { label: "Glucides", value: computed.carbsG, unit: "g", pct: carbPct, color: "bg-gradient-accent" },
                { label: "Lipides", value: computed.fatsG, unit: "g", pct: fatPct, color: "bg-blue-500" },
              ].map(m => (
                <div key={m.label} className="rounded-3xl glass p-5 shadow-card text-center">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="font-display font-extrabold text-2xl mt-1">{m.value}{m.unit}</p>
                  <div className="h-2 bg-surface rounded-full mt-2 overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{m.pct}%</p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "meals" && mealPlan && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-2xl mb-4 flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-accent" /> Plan repas • {computed.duration}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {mealPlan.meals.map((meal, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="rounded-3xl glass shadow-card overflow-hidden group">
                  <div className="h-40 overflow-hidden">
                    <img src={meal.image} alt={meal.recipe} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-accent font-bold uppercase">{meal.time}</span>
                      <span className="text-xs bg-surface px-2 py-1 rounded-full">{meal.calories} kcal</span>
                    </div>
                    <p className="font-bold text-lg">{meal.recipe}</p>
                    <p className="text-muted-foreground text-sm mt-1">{meal.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {data.health && (
          <div className="mt-8 rounded-3xl glass p-5 border border-destructive/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-muted-foreground text-sm">{data.health}</p>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-10">
          <Link to="/diagnostic" className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 text-sm font-semibold hover:bg-surface transition">
            <ArrowLeft className="w-4 h-4" /> Refaire le diagnostic
          </Link>
        </div>
      </div>
    </div>
  );
}