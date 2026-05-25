// Simple session-storage based store for diagnostic data shared across pages
export type Goal = "perte" | "muscle" | "endurance" | "bien-etre";
export type Sport = "musculation" | "running" | "yoga" | "natation" | "marche" | "Autre" ;
export type Gender = "homme" | "femme";

export interface DiagnosticData {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  goal: Goal;
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

export function calcPlanDuration(bmi: number, goal: Goal): number {
  if (goal === "bien-etre") return 4;
  if (goal === "endurance") return 8;
  if (goal === "muscle") return bmi < 22 ? 12 : 8;
  // perte
  if (bmi >= 30) return 12;
  if (bmi >= 25) return 8;
  return 4;
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
  yoga: "Yoga",
  natation: "Natation",
};
