import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Target, Flame, ChefHat, Clock, Brain,
  TrendingUp, AlertTriangle, ArrowLeft, Circle, CheckCircle2,
  Dumbbell, Footprints, Heart, Waves, Zap, Calendar, Clock as ClockIcon
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { loadDiagnostic, calcBMI, calcBMR, GOAL_LABEL, SPORT_LABEL, type DiagnosticData } from "@/lib/diagnostic";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Votre plan — NutriOs" },
      { name: "description", content: "Plan nutritionnel personnalisé avec repas illustrés et programme sportif." },
    ],
  }),
  component: Results,
});

// ==================== API SERVICES ====================

// TheMealDB API - 100% gratuit
const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Wger API - 100% gratuite, sans clé
const WGER_BASE_URL = 'https://github.com/wger-project/wger';

interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string;
  strYoutube: string;
  [key: string]: string | null | undefined;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
}

interface Exercise {
  id: string;
  name: string;
  level: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  equipment: string;
  sets: string;
  reps: string;
  imageUrl?: string;
  videoUrl?: string;
  description?: string;
  type?: 'cardio' | 'strength' | 'stretch' | 'warmup';
  duration?: string;
}

interface WeeklyWorkout {
  day: string;
  exercises: Exercise[];
  totalDuration: string;
}

// ==================== FONCTIONS API THEMEALDB ====================

async function getRandomMealByCategory(category: string): Promise<Meal | null> {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    const data = await response.json();
    const meals = data.meals || [];
    if (meals.length === 0) return null;
    
    const randomMeal = meals[Math.floor(Math.random() * meals.length)];
    const detailResponse = await fetch(`${MEALDB_BASE_URL}/lookup.php?i=${randomMeal.idMeal}`);
    const detailData = await detailResponse.json();
    return detailData.meals?.[0] || null;
  } catch (error) {
    console.error('Erreur API TheMealDB:', error);
    return null;
  }
}

async function getFullMealPlan(goal: string): Promise<{ breakfast: Meal | null; lunch: Meal | null; dinner: Meal | null; snack: Meal | null }> {
  const categories = {
    perte: { breakfast: 'Vegetarian', lunch: 'Chicken', dinner: 'Seafood', snack: 'Vegetarian' },
    muscle: { breakfast: 'Beef', lunch: 'Chicken', dinner: 'Lamb', snack: 'Dessert' },
    endurance: { breakfast: 'Breakfast', lunch: 'Pasta', dinner: 'Seafood', snack: 'Fruit' },
    default: { breakfast: 'Breakfast', lunch: 'Chicken', dinner: 'Vegetarian', snack: 'Dessert' }
  };
  
  const cats = categories[goal as keyof typeof categories] || categories.default;
  
  const [breakfast, lunch, dinner, snack] = await Promise.all([
    getRandomMealByCategory(cats.breakfast),
    getRandomMealByCategory(cats.lunch),
    getRandomMealByCategory(cats.dinner),
    getRandomMealByCategory(cats.snack),
  ]);
  
  return { breakfast, lunch, dinner, snack };
}

// ==================== FONCTIONS API WGER ====================

async function searchWgerExercisesByMuscle(muscleName: string): Promise<any[]> {
  try {
    const muscleResponse = await fetch(`${WGER_BASE_URL}/muscle/?name=${encodeURIComponent(muscleName)}`);
    const muscleData = await muscleResponse.json();
    if (!muscleData.results || muscleData.results.length === 0) return [];
    
    const muscleId = muscleData.results[0].id;
    const response = await fetch(`${WGER_BASE_URL}/exercise/?muscles=${muscleId}&language=2&limit=30`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Erreur Wger API:', error);
    return [];
  }
}

async function getWgerExerciseDetails(id: number): Promise<any | null> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/exercise/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Erreur Wger API details:', error);
    return null;
  }
}

function getWgerImageUrl(exercise: any): string | null {
  if (exercise.images && exercise.images.length > 0) {
    const mainImage = exercise.images.find((img: any) => img.is_main);
    if (mainImage) return `https://wger.de${mainImage.image}`;
    return `https://wger.de${exercise.images[0].image}`;
  }
  return null;
}

function getWgerVideoUrl(exercise: any): string | null {
  if (exercise.videos && exercise.videos.length > 0) {
    const mainVideo = exercise.videos.find((vid: any) => vid.is_main);
    if (mainVideo) return mainVideo.video;
    return exercise.videos[0].video;
  }
  return null;
}

// Organiser les exercices par semaine
const organizeWeeklyWorkouts = (exercises: Exercise[], sport: string, level: string): WeeklyWorkout[] => {
  let sessionsPerWeek = 3;
  if (level === 'intermédiaire') sessionsPerWeek = 4;
  if (level === 'avancé') sessionsPerWeek = 5;
  
  const weeklyPlan: WeeklyWorkout[] = [];
  const daysOrder = ['Lundi', 'Mercredi', 'Vendredi', 'Mardi', 'Jeudi', 'Samedi'];
  
  for (let i = 0; i < sessionsPerWeek && i < exercises.length; i++) {
    const day = daysOrder[i % daysOrder.length];
    const exercise = exercises[i];
    
    weeklyPlan.push({
      day,
      exercises: [exercise],
      totalDuration: exercise.duration || exercise.reps || '30 min'
    });
  }
  
  return weeklyPlan;
};

// Fonction principale pour récupérer le programme sportif depuis l'API
async function getWorkoutPlan(goal: string, sport: string): Promise<{ 
  title: string; 
  weeklyPlan: WeeklyWorkout[]; 
  frequency: string; 
  duration: string;
  level: string;
}> {
  const level = 'débutant';
  
  let muscleTargets: string[] = [];
  
  switch (sport) {
    case 'marche':
      muscleTargets = ['quadriceps', 'gluteus', 'abdominals'];
      break;
    case 'musculation':
      muscleTargets = ['pectoralis', 'biceps', 'triceps', 'latissimus dorsi', 'quadriceps'];
      break;
    case 'running':
      muscleTargets = ['quadriceps', 'hamstrings', 'calves', 'gluteus'];
      break;
    case 'natation':
      muscleTargets = ['latissimus dorsi', 'deltoid', 'triceps', 'quadriceps'];
      break;
    default:
      muscleTargets = ['quadriceps', 'abdominals', 'pectoralis'];
  }
  
  try {
    const allExercises: Exercise[] = [];
    const usedIds = new Set<number>();
    
    for (const muscle of muscleTargets) {
      const exercises = await searchWgerExercisesByMuscle(muscle);
      for (const ex of exercises) {
        if (!usedIds.has(ex.id) && allExercises.length < 6) {
          const details = await getWgerExerciseDetails(ex.id);
          if (details) {
            allExercises.push({
              id: String(details.id),
              name: details.name,
              level: details.category?.name === 'Advanced' ? 'avancé' : 
                     details.category?.name === 'Intermediate' ? 'intermédiaire' : 'débutant',
              primaryMuscles: details.muscles?.map((m: any) => m.name) || [],
              secondaryMuscles: details.muscles_secondary?.map((m: any) => m.name) || [],
              instructions: [details.description?.substring(0, 200) || ''],
              equipment: details.equipment?.map((e: any) => e.name).join(', ') || 'poids du corps',
              sets: '3-4',
              reps: '10-12',
              imageUrl: getWgerImageUrl(details) || undefined,
              videoUrl: getWgerVideoUrl(details) || undefined,
              description: details.description?.substring(0, 150),
              type: details.category?.name?.includes('Cardio') ? 'cardio' : 'strength',
              duration: '30 min',
            });
            usedIds.add(details.id);
          }
        }
      }
    }
    
    const weeklyPlan = organizeWeeklyWorkouts(allExercises.slice(0, 4), sport, level);
    
    let frequency = '';
    let duration = '';
    let title = '';
    
    switch (level) {
      case 'débutant':
        frequency = '2-3 séances/semaine';
        duration = '30-45 min';
        break;
      case 'intermédiaire':
        frequency = '3-4 séances/semaine';
        duration = '45-60 min';
        break;
      default:
        frequency = '4-5 séances/semaine';
        duration = '60-75 min';
    }
    
    switch (goal) {
      case 'perte':
        title = `🔥 Programme brûle-graisse - ${SPORT_LABEL[sport as keyof typeof SPORT_LABEL] || sport}`;
        break;
      case 'muscle':
        title = `💪 Programme prise de masse - ${SPORT_LABEL[sport as keyof typeof SPORT_LABEL] || sport}`;
        break;
      case 'endurance':
        title = `🏃‍♂️ Programme endurance - ${SPORT_LABEL[sport as keyof typeof SPORT_LABEL] || sport}`;
        break;
      default:
        title = `🏋️‍♂️ Programme bien-être - ${SPORT_LABEL[sport as keyof typeof SPORT_LABEL] || sport}`;
    }
    
    return { title, weeklyPlan, frequency, duration, level };
    
  } catch (error) {
    console.error('Erreur API Wger:', error);
    return { 
      title: `Programme ${goal} - ${SPORT_LABEL[sport as keyof typeof SPORT_LABEL] || sport}`,
      weeklyPlan: [],
      frequency: '3 séances/semaine',
      duration: '30-45 min',
      level: 'débutant'
    };
  }
}

// ==================== COMPOSANTS UI ====================

// Composant MealCard
function MealCard({ meal, type }: { meal: Meal; type: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ingredients: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient && typeof ingredient === 'string' && ingredient.trim()) {
      ingredients.push(ingredient);
    }
  }
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
      className="rounded-2xl glass shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-44 overflow-hidden">
        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />}
        <img src={meal.strMealThumb} alt={meal.strMeal}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)} />
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">{type}</div>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">{meal.strMeal}</h4>
        <p className="text-xs text-muted-foreground mt-1">{meal.strArea || 'International'} • {meal.strCategory || 'Plat principal'}</p>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {ingredients.slice(0, 3).join(', ')}{ingredients.length > 3 && '...'}
        </p>
        {meal.strYoutube && (
          <a href={meal.strYoutube} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-xs text-red-500 hover:text-red-600 transition-colors">
            🎥 Voir la vidéo
          </a>
        )}
      </div>
    </motion.div>
  );
}

// Composant WeeklyWorkoutCard
function WeeklyWorkoutCard({ weekPlan }: { weekPlan: WeeklyWorkout }) {
  const [expanded, setExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const exercise = weekPlan.exercises[0];
  const isCardio = exercise?.type === 'cardio' || exercise?.name?.toLowerCase().includes('cardio');
  const isStrength = exercise?.type === 'strength';
  
  const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('/embed/')) return url;
    return null;
  };
  
  const videoUrl = getYouTubeEmbedUrl(exercise?.videoUrl);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass p-5 shadow-card hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-emerald/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-xl">{weekPlan.day}</h3>
            <p className="text-xs text-muted-foreground">Durée: {weekPlan.totalDuration}</p>
          </div>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-emerald-600 hover:text-emerald-700"
        >
          {expanded ? 'Voir moins' : 'Voir détails'}
        </button>
      </div>
      
      {/* Image/Video de l'exercice */}
      {exercise && (
        <div className="mb-3 rounded-xl overflow-hidden bg-gradient-emerald/10">
          {exercise.videoUrl ? (
            <div className="relative aspect-video">
              <iframe
                src={videoUrl || exercise.videoUrl}
                title={exercise.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : exercise.imageUrl ? (
            <img 
              src={exercise.imageUrl}
              alt={exercise.name}
              className={`w-full h-32 object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-32 flex items-center justify-center">
              {isCardio ? <Heart className="w-12 h-12 text-red-400" /> : <Dumbbell className="w-12 h-12 text-emerald-400" />}
            </div>
          )}
        </div>
      )}
      
      {expanded && exercise && (
        <div className="space-y-3 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-lg">{exercise.name}</p>
              <p className="text-sm text-muted-foreground">
                {exercise.primaryMuscles?.slice(0, 2).join(', ') || 'Full body'} • 
                Niveau: {exercise.level || 'débutant'} • 
                Équipement: {exercise.equipment || 'aucun'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {exercise.description || exercise.instructions?.[0]?.substring(0, 150)}
              </p>
            </div>
          </div>
          <div className="flex justify-around pt-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">Séries</p>
              <p className="font-bold text-lg">{exercise.sets || '3'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">{isStrength ? 'Reps' : 'Durée'}</p>
              <p className="font-bold text-lg">{exercise.reps || exercise.duration || '10-12'}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

const CalorieBadge = ({ calories, isTotal = false }: { calories: number; isTotal?: boolean }) => (
  <div className={`flex items-center gap-1 ${isTotal ? 'px-3 py-1.5' : 'px-2 py-1'} rounded-full ${isTotal ? 'bg-gradient-emerald text-white' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'} font-semibold shadow-sm`}>
    <Flame className="w-3 h-3 opacity-80" /><span className="text-xs font-bold">{calories} kcal</span>
  </div>
);

const getProteinMultiplier = (sport: string, goal: string): number => {
  if (sport === "musculation") return goal === "muscle" ? 2.0 : 1.8;
  if (sport === "running" || sport === "natation") return goal === "perte" ? 1.6 : 1.8;
  if (sport === "marche" || sport === "yoga") return goal === "perte" ? 1.4 : 1.6;
  return goal === "perte" ? 1.6 : 1.8;
};

// ==================== COMPOSANT PRINCIPAL ====================
function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [readinessScore, setReadinessScore] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "meals" | "sport">("overview");
  const [apiMealPlan, setApiMealPlan] = useState<{ breakfast: Meal | null; lunch: Meal | null; dinner: Meal | null; snack: Meal | null } | null>(null);
  const [apiWorkoutPlan, setApiWorkoutPlan] = useState<{ title: string; weeklyPlan: WeeklyWorkout[]; frequency: string; duration: string; level: string } | null>(null);
  const [isLoadingApiMeals, setIsLoadingApiMeals] = useState(false);
  const [isLoadingApiExercises, setIsLoadingApiExercises] = useState(false);
  const [dailyTasks, setDailyTasks] = useState([
    { id: "protein", label: "Protéines", target: "", done: false },
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

  useEffect(() => {
    if (!data) return;
    const loadApiData = async () => {
      setIsLoadingApiMeals(true);
      const mealPlan = await getFullMealPlan(data.goal);
      setApiMealPlan(mealPlan);
      setIsLoadingApiMeals(false);
      setIsLoadingApiExercises(true);
      const workoutPlan = await getWorkoutPlan(data.goal, data.sport);
      setApiWorkoutPlan(workoutPlan);
      setIsLoadingApiExercises(false);
    };
    loadApiData();
  }, [data]);

  const computed = useMemo(() => {
    if (!data) return null;
    const bmi = calcBMI(data.weight, data.height);
    const bmr = calcBMR(data.weight, data.height, data.age, data.gender);
    const tdee = Math.round(bmr * 1.55);
    let targetCal: number;
    if (data.goal === "perte") targetCal = bmi >= 30 ? tdee - 600 : tdee - 400;
    else if (data.goal === "muscle") targetCal = tdee + 300;
    else targetCal = tdee;
    const proteinMultiplier = getProteinMultiplier(data.sport, data.goal);
    const proteinG = Math.round(data.weight * proteinMultiplier);
    const proteinCal = proteinG * 4;
    const fatPct = data.goal === "perte" ? 0.25 : 0.30;
    const fatCal = targetCal * fatPct;
    const fatsG = Math.round(fatCal / 9);
    const carbCal = Math.max(0, targetCal - proteinCal - fatCal);
    const carbsG = Math.round(carbCal / 4);
    const proteinPct = Math.round((proteinCal / targetCal) * 100);
    const fatPctActual = Math.round((fatCal / targetCal) * 100);
    const carbPct = Math.round((carbCal / targetCal) * 100);
    let duration: string, weeklyChange: number, maxWeeks: number;
    if (data.goal === "perte") {
      if (bmi >= 35) { duration = "24-36 semaines"; weeklyChange = -1.0; maxWeeks = 36; }
      else if (bmi >= 30) { duration = "20-28 semaines"; weeklyChange = -0.8; maxWeeks = 28; }
      else if (bmi >= 27) { duration = "16-24 semaines"; weeklyChange = -0.6; maxWeeks = 24; }
      else { duration = "12-16 semaines"; weeklyChange = -0.5; maxWeeks = 16; }
    } else if (data.goal === "muscle") {
      duration = "12-20 semaines"; weeklyChange = 0.3; maxWeeks = 20;
    } else if (data.goal === "endurance") {
      duration = "10-14 semaines"; weeklyChange = -0.2; maxWeeks = 14;
    } else {
      duration = "8-12 semaines"; weeklyChange = 0; maxWeeks = 12;
    }
    return { bmi, bmr, tdee, targetCal, proteinG, carbsG, fatsG, proteinPct, carbPct, fatPct: fatPctActual, duration, weeklyChange, maxWeeks };
  }, [data]);

  const MEAL_PLANS_STATIC = {
    perte: { meals: [{ time: "Petit-déjeuner", recipe: "Smoothie vert", details: "Épinards, banane, whey", calories: 350, image: "" }] },
    muscle: { meals: [{ time: "Petit-déjeuner", recipe: "Porridge protéiné", details: "Avoine, whey, banane", calories: 550, image: "" }] },
    endurance: { meals: [{ time: "Petit-déjeuner", recipe: "Porridge énergétique", details: "Avoine, fruits secs", calories: 500, image: "" }] }
  };
  const staticMealPlan = data ? (MEAL_PLANS_STATIC[data.goal as keyof typeof MEAL_PLANS_STATIC] || MEAL_PLANS_STATIC.endurance) : null;
  const totalStaticCalories = staticMealPlan?.meals.reduce((sum, m) => sum + m.calories, 0) || 0;

  useEffect(() => {
    if (computed) setDailyTasks(prev => prev.map(t => t.id === "protein" ? { ...t, target: `${computed.proteinG}g` } : t));
  }, [computed]);

  const toggleTask = (id: string) => {
    setDailyTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
      setReadinessScore(Math.round((updated.filter(t => t.done).length / updated.length) * 100));
      return updated;
    });
  };

  const projectionData = useMemo(() => {
    if (!data || !computed) return [];
    const weeks = computed.maxWeeks;
    return Array.from({ length: weeks + 1 }, (_, i) => ({ week: `S${i + 1}`, poids: parseFloat((data.weight + computed.weeklyChange * i).toFixed(1)) }));
  }, [data, computed]);

  if (!data || !computed) {
    return (
      <div className="min-h-screen pt-40 text-center text-muted-foreground">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full mx-auto" />
        <p className="mt-4 text-sm">Chargement de votre profil...</p>
      </div>
    );
  }

  const getBmiCategoryColor = (bmi: number) => {
    if (bmi < 18.5) return "text-blue-500";
    if (bmi < 25) return "text-green-600";
    if (bmi < 30) return "text-orange-500";
    return "text-orange-700";
  };
  const bmiCategory = computed.bmi < 18.5 ? "Sous-poids" : computed.bmi < 25 ? "Optimal" : computed.bmi < 30 ? "Surpoids" : "Obésité";
  const circleRadius = 60;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (readinessScore / 100) * circleCircumference;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-linear-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="font-display font-extrabold text-4xl md:text-6xl mb-4">Votre <span className="text-gradient">plan {GOAL_LABEL[data.goal]}</span></h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">{computed.duration} • {computed.targetCal.toLocaleString()} kcal/jour • {SPORT_LABEL[data.sport]}</p>
          <div className="flex justify-center gap-3 mt-6">
            {[
              { id: "overview", label: "Dashboard", icon: <Activity className="w-4 h-4" /> },
              { id: "meals", label: "Repas", icon: <ChefHat className="w-4 h-4" /> },
              { id: "sport", label: "🏋️‍♂️ Sport", icon: <Dumbbell className="w-4 h-4" /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id ? "bg-gradient-emerald text-primary-foreground shadow-glow" : "glass hover:bg-surface text-muted-foreground"}`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {activeTab === "overview" && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Activity, label: "IMC", value: computed.bmi.toFixed(1), sub: bmiCategory, subColor: getBmiCategoryColor(computed.bmi) },
                { icon: Flame, label: "TDEE", value: computed.tdee.toLocaleString(), sub: "kcal/jour", subColor: "text-gray-500" },
                { icon: Target, label: "Objectif", value: computed.targetCal.toLocaleString(), sub: "kcal/jour", subColor: "text-gray-500" },
                { icon: Clock, label: "Durée", value: computed.duration, sub: "Programme adapté", subColor: "text-gray-600 font-medium text-xs" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl glass p-6 shadow-card text-center hover:shadow-lg transition-all duration-300">
                  <s.icon className="w-6 h-6 text-primary-glow mx-auto mb-3" />
                  <p className="font-display font-extrabold text-3xl">{s.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">{s.label}</p>
                  <p className={`text-xs font-medium mt-0.5 ${s.subColor}`}>{s.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="rounded-2xl glass p-6 shadow-card">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-primary-glow" /> Score du jour</h3>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r={circleRadius} fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-700" />
                      <circle cx="80" cy="80" r={circleRadius} fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray={circleCircumference} strokeDashoffset={circleOffset} strokeLinecap="round" className="text-orange-500 transition-all duration-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center"><span className="font-display font-extrabold text-4xl text-gradient-accent">{readinessScore}%</span></div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">{readinessScore === 0 ? "Cochez vos objectifs pour aujourd'hui" : readinessScore === 100 ? "Parfait ! Continuez comme ça !" : "Continuez votre progression"}</p>
                </div>
                <div className="space-y-2 mt-4">
                  {dailyTasks.map(t => (
                    <div key={t.id} onClick={() => toggleTask(t.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${t.done ? "bg-gradient-emerald/20 border-primary/30" : "bg-surface border-border hover:border-primary/30 hover:bg-surface/80"}`}>
                      <div className="flex items-center gap-3">
                        {t.done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-400" />}
                        <span className={`text-sm font-semibold ${t.done ? "text-primary line-through" : ""}`}>{t.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{t.target}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl glass p-6 shadow-card">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary-glow" /> Projection {computed.duration}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                      <defs><linearGradient id="cp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10B981" stopOpacity={0.05} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.4} />
                      <XAxis dataKey="week" stroke="#6b7280" fontSize={12} interval={Math.floor(projectionData.length / 10)} />
                      <YAxis stroke="#6b7280" fontSize={12} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #10B981", borderRadius: "12px" }} formatter={(value: number) => [`${value} kg`, 'Poids']} />
                      <Area type="monotone" dataKey="poids" stroke="#10B981" strokeWidth={3} fill="url(#cp)" activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">Projection de votre poids sur la durée du programme</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Protéines", value: computed.proteinG, unit: "g", pct: computed.proteinPct, color: "bg-gradient-emerald" },
                { label: "Glucides", value: computed.carbsG, unit: "g", pct: computed.carbPct, color: "bg-gradient-accent" },
                { label: "Lipides", value: computed.fatsG, unit: "g", pct: computed.fatPct, color: "bg-blue-500" },
              ].map(m => (
                <div key={m.label} className="rounded-2xl glass p-5 shadow-card text-center hover:shadow-md transition-all duration-300">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{m.label}</p>
                  <p className="font-display font-extrabold text-3xl mt-2">{m.value}{m.unit}</p>
                  <div className="h-2 bg-surface rounded-full mt-3 overflow-hidden"><div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.pct}%` }} /></div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">{m.pct}% des calories</p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "meals" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="font-display font-bold text-2xl flex items-center gap-2"><ChefHat className="w-6 h-6 text-accent" /> Suggestions de repas</h3>
              <CalorieBadge calories={totalStaticCalories} isTotal />
            </div>
            {isLoadingApiMeals ? (
              <div className="grid md:grid-cols-2 gap-4">{ [1,2,3,4].map(i => (<div key={i} className="rounded-2xl glass p-4 animate-pulse"><div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>)) }</div>
            ) : apiMealPlan ? (
              <div className="grid md:grid-cols-2 gap-5">
                {apiMealPlan.breakfast && <MealCard meal={apiMealPlan.breakfast} type="🌅 Petit-déjeuner" />}
                {apiMealPlan.lunch && <MealCard meal={apiMealPlan.lunch} type="☀️ Déjeuner" />}
                {apiMealPlan.dinner && <MealCard meal={apiMealPlan.dinner} type="🌙 Dîner" />}
                {apiMealPlan.snack && <MealCard meal={apiMealPlan.snack} type="🍎 Collation" />}
              </div>
            ) : (<div className="text-center py-8 text-muted-foreground"><ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Aucune suggestion disponible</p></div>)}
          </div>
        )}

        {activeTab === "sport" && (
          <div className="space-y-6">
            {isLoadingApiExercises ? (
              <div className="space-y-4">{ [1,2,3].map(i => (<div key={i} className="rounded-2xl glass p-5 animate-pulse"><div className="flex gap-4"><div className="w-16 h-16 bg-gray-200 rounded-xl" /><div className="flex-1"><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div></div></div>)) }</div>
            ) : apiWorkoutPlan && apiWorkoutPlan.weeklyPlan.length > 0 ? (
              <>
                <div className="text-center mb-8">
                  <h3 className="font-display font-bold text-2xl flex items-center justify-center gap-2">
                    <Dumbbell className="w-7 h-7 text-accent" />
                    {apiWorkoutPlan.title}
                  </h3>
                  <div className="flex justify-center gap-4 mt-2">
                    <p className="text-muted-foreground">📅 {apiWorkoutPlan.frequency}</p>
                    <p className="text-muted-foreground">⏱️ {apiWorkoutPlan.duration}/séance</p>
                    <p className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">🎯 Niveau {apiWorkoutPlan.level}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apiWorkoutPlan.weeklyPlan.map((dayPlan, idx) => (
                    <WeeklyWorkoutCard key={idx} weekPlan={dayPlan} />
                  ))}
                </div>
                
                <div className="mt-8 rounded-2xl glass p-5 bg-gradient-emerald/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold">💡 Conseil personnalisé</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.goal === "perte" && `Pour maximiser la perte de poids, respectez vos jours de repos. La récupération est essentielle.`}
                        {data.goal === "muscle" && `Pour optimiser la prise de muscle, espacez vos séances et dormez 7-8h par nuit.`}
                        {data.goal === "endurance" && "Augmentez progressivement la durée des sorties longues (+10% par semaine)."}
                        {data.goal === "bien-etre" && "Concentrez-vous sur la régularité plutôt que l'intensité."}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Programme sportif personnalisé basé sur votre profil</p>
              </div>
            )}
          </div>
        )}

        {data.health && activeTab !== "sport" && (
          <div className="mt-8 rounded-3xl glass p-5 border border-orange-200 flex items-start gap-3 bg-orange-50">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-muted-foreground text-sm">📝 Contexte santé : {data.health}</p>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link to="/diagnostic" className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-all duration-200 hover:bg-emerald-50">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Refaire le diagnostic
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Results;