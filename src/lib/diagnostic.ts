// Simple session-storage based store for diagnostic data shared across pages
export type Goal = "perte" | "muscle" | "endurance" | "bien-etre";
export type Sport = "musculation" | "running" | "walking" | "yoga" | "natation";
export type Gender = "homme" | "femme";

export interface DiagnosticData {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  goals: Goal[]; // jusqu'à 2 objectifs
  sport: Sport;
  health: string;
}

const KEY = "nutrios:diagnostic";

export function saveDiagnostic(data: Partial<DiagnosticData>) {
  if (typeof window === "undefined") return;
  const current = loadDiagnostic() || {};
  sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...data }));
}

export function loadDiagnostic(): Partial<DiagnosticData> | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearDiagnostic() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

// --- Calculs métaboliques ---
export function calcBMI(weightKg: number, heightCm: number) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

// Mifflin-St Jeor
export function calcBMR(weightKg: number, heightCm: number, age: number, gender: Gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "homme" ? base + 5 : base - 161;
}

function singleDuration(bmi: number, goal: Goal): number {
  if (goal === "bien-etre") return 4;
  if (goal === "endurance") return 8;
  if (goal === "muscle") return bmi < 22 ? 12 : 8;
  if (bmi >= 30) return 12;
  if (bmi >= 25) return 8;
  return 4;
}

export function calcPlanDuration(bmi: number, goals: Goal[]): number {
  if (!goals.length) return 4;
  return Math.max(...goals.map((g) => singleDuration(bmi, g)));
}

// Coefficient d'activité selon le sport
const ACTIVITY: Record<Sport, number> = {
  yoga: 1.375,
  walking: 1.45,
  natation: 1.55,
  running: 1.7,
  musculation: 1.65,
};

export interface MacroSplit {
  calories: number;
  protein: number; // g
  carbs: number;   // g
  fats: number;    // g
}

export function calcMacros(bmr: number, sport: Sport, goals: Goal[], weight: number): MacroSplit {
  const tdee = bmr * (ACTIVITY[sport] ?? 1.5);
  // Ajustement objectifs (moyenne)
  let adj = 0;
  for (const g of goals) {
    if (g === "perte") adj += -350;
    else if (g === "muscle") adj += 300;
    else if (g === "endurance") adj += 150;
    else adj += 0;
  }
  const calories = Math.round(tdee + adj / Math.max(1, goals.length));

  // Protéines selon objectifs
  const proteinPerKg = goals.includes("muscle") ? 2.0 : goals.includes("perte") ? 1.8 : 1.5;
  const protein = Math.round(weight * proteinPerKg);
  const fats = Math.round((calories * 0.28) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));
  return { calories, protein, carbs, fats };
}

export const GOAL_LABEL: Record<Goal, string> = {
  perte: "Perte de poids",
  muscle: "Prise de muscle",
  endurance: "Endurance",
  "bien-etre": "Bien-être",
};

export const SPORT_LABEL: Record<Sport, string> = {
  musculation: "Musculation",
  running: "Running",
  walking: "Marche active",
  yoga: "Yoga",
  natation: "Natation",
};
