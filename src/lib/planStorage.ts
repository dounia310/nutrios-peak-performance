// src/lib/planStorage.ts

export interface StoredMeal {
  id: string;
  name: string;
  ingredients: string;
  calories: number;
  image: string;
  type: string;
  day?: string;
}

export interface StoredExercise {
  id: string;
  name: string;
  level: string;
  primaryMuscles: string[];
  equipment: string;
  sets: string;
  reps: string;
  description: string;
  type?: string;
  duration?: string;
}

export interface DailyPlan {
  day: string;
  date: string;
  meals: {
    breakfast: StoredMeal | null;
    lunch: StoredMeal | null;
    dinner: StoredMeal | null;
    snack: StoredMeal | null;
  };
  exercises: StoredExercise[];
}

export interface UserPlan {
  userId: string;
  goal: string;
  sport: string;
  createdAt: string;
  expiresAt: string;
  weeklyPlan: DailyPlan[];
}

// Clé de stockage
const STORAGE_KEY = 'nutrios_user_plan';

// Sauvegarder le plan
export function saveUserPlan(plan: UserPlan): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

// Charger le plan
export function loadUserPlan(): UserPlan | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Vérifier si le plan est expiré
export function isPlanExpired(plan: UserPlan): boolean {
  return new Date(plan.expiresAt) < new Date();
}

// Générer une date d'expiration (ex: dans 12 semaines)
export function getExpirationDate(weeks: number): string {
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date.toISOString();
}

// Générer un ID unique
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}