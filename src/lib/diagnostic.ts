// Types
export type Goal = "perte" | "muscle" | "endurance" | "bien-etre";
export type Sport = "musculation" | "running" | "marche" | "yoga" | "natation" | "autre"; // ← Ajouter "autre"
export type Gender = "homme" | "femme";

export interface DiagnosticData {
  name?: string; // ← Ajouter cette ligne
  goal: Goal;
  sport: Sport;
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  health?: string;
}

// Labels
export const GOAL_LABEL: Record<Goal, string> = {
  perte: "Perte de poids",
  muscle: "Prise de muscle",
  endurance: "Endurance",
  "bien-etre": "Bien-être",
};

export const SPORT_LABEL: Record<Sport, string> = {
  musculation: "Musculation",
  running: "Running",
  marche: "Marche",
  yoga: "Yoga",
  natation: "Natation",
  autre: "Autre", // ← Ajouter cette ligne
};

// Sauvegarde
export function saveDiagnostic(data: Partial<DiagnosticData>) {
  localStorage.setItem("nutrios-diagnostic", JSON.stringify(data));
}

export function loadDiagnostic(): Partial<DiagnosticData> | null {
  const raw = localStorage.getItem("nutrios-diagnostic");
  return raw ? JSON.parse(raw) : null;
}

export function clearDiagnostic() {
  localStorage.removeItem("nutrios-diagnostic");
}

// Calculs
export function calcBMI(weight: number, height: number): number {
  const h = height / 100;
  return parseFloat((weight / (h * h)).toFixed(1));
}

export function calcBMR(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === "homme") {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  }
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
}