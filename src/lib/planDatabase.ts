// lib/planDatabase.ts
import { supabase } from '@/lib/supabase';

// ============================================
// INTERFACES
// ============================================

export interface DiagnosticData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  goal: string;
  sport: string;
  plan_duration?: number;
  [key: string]: any;
}

export interface UserPlan {
  id: string;
  diagnostic_id: string;
  user_id: string;
  goal: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
  current_week: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface DailyTask {
  id: string;
  plan_id: string;
  week_number: number;
  day_number: number;
  task_id: string;
  label: string;
  category: 'nutrition' | 'sport' | 'wellness';
  icon: string;
  time_slot: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface ProgressHistory {
  id: string;
  user_id: string;
  plan_id: string;
  week_key: string;
  week_number: number;
  progress_percentage: number;
  tasks_completed: number;
  tasks_total: number;
  recorded_at: string;
}

export interface TaskGeneration {
  label: string;
  category: 'nutrition' | 'sport' | 'wellness';
  icon: string;
  timeSlot?: string;
}

// ============================================
// 3. FONCTION getPlanDuration
// ============================================
export function getPlanDuration(goal: string): number {
  const durations: Record<string, number> = {
    perte: 12,
    muscle: 16,
    endurance: 8,
    'bien-etre': 4,
  };
  return durations[goal] || 4;
}

// ============================================
// 4. FONCTION generateTasksForDay
// ============================================
export function generateTasksForDay(
  week: number,
  day: number,
  diagnosticData: { goal: string; sport: string }
): TaskGeneration[] {
  const isWeightLoss = diagnosticData.goal === 'perte';
  const isMuscle = diagnosticData.goal === 'muscle';
  const isEndurance = diagnosticData.goal === 'endurance';
  const sport = diagnosticData.sport;
  
  // Intensité qui augmente avec les semaines (1.0 à 1.5 max)
  const intensity = Math.min(1 + (week - 1) * 0.05, 1.5);
  const proteinTarget = isMuscle ? Math.round(140 + (week - 1) * 3) : 120;
  const cardioMinutes = Math.round(30 * intensity);
  const runDistance = Math.round(5 * intensity * 10) / 10;
  
  // Mapping des tâches par jour (1 = Lundi, 7 = Dimanche)
  const taskMap: Record<number, TaskGeneration[]> = {
    1: [ // Lundi
      {
        label: `🥚 Petit-déjeuner protéiné (${Math.round(25 * intensity)}g protéines)`,
        category: 'nutrition',
        icon: 'Egg',
        timeSlot: '08:00',
      },
      {
        label: isWeightLoss 
          ? `🏃 Cardio ${cardioMinutes} min` 
          : isMuscle 
          ? '💪 Musculation haut du corps (4x12 répétitions)'
          : isEndurance
          ? `🏃 Running ${runDistance}km (endurance)`
          : `🏃 Activité physique ${cardioMinutes} min`,
        category: 'sport',
        icon: sport === 'running' ? 'Footprints' : 'Dumbbell',
        timeSlot: '18:00',
      },
      {
        label: '🧘 Méditation / respiration 5 min',
        category: 'wellness',
        icon: 'Heart',
        timeSlot: '22:00',
      },
    ],
    2: [ // Mardi
      {
        label: `🥗 Déjeuner complet (légumes + ${proteinTarget}g protéines + féculents complets)`,
        category: 'nutrition',
        icon: 'Salad',
        timeSlot: '12:30',
      },
      {
        label: '🍎 Collation saine (fruits secs ou yaourt protéiné)',
        category: 'nutrition',
        icon: 'Apple',
        timeSlot: '16:00',
      },
      {
        label: isMuscle 
          ? '💪 Musculation bas du corps (squats, fentes, soulevé)'
          : `🚶 Marche active ${Math.round(45 * intensity)} min`,
        category: 'sport',
        icon: 'Footprints',
        timeSlot: '17:30',
      },
      {
        label: '📱 Étirements post-séance 10 min',
        category: 'wellness',
        icon: 'Activity',
      },
    ],
    3: [ // Mercredi
      {
        label: '🐟 Repas riches en oméga-3 (saumon, maquereau, sardines)',
        category: 'nutrition',
        icon: 'Fish',
        timeSlot: '12:30',
      },
      {
        label: '🍽️ Dîner léger (pas de féculents après 20h, légumes à volonté)',
        category: 'nutrition',
        icon: 'Utensils',
        timeSlot: '19:30',
      },
      {
        label: '🧘 Repos actif ou mobilité articulaire 20 min',
        category: 'sport',
        icon: 'Activity',
      },
      {
        label: '😴 Sommeil : 7-8h cette nuit (coucher avant 23h)',
        category: 'wellness',
        icon: 'Moon',
      },
    ],
    4: [ // Jeudi
      {
        label: '☕ Éviter sucres rapides (pas de soda, jus, pâtisseries)',
        category: 'nutrition',
        icon: 'Coffee',
      },
      {
        label: `🔥 Calories cibles : ${isWeightLoss ? '1800-2000' : isMuscle ? '2800-3000' : '2200-2400'} kcal`,
        category: 'nutrition',
        icon: 'Flame',
      },
      {
        label: isEndurance 
          ? '🏃 Fractionné 8x400m avec récupération'
          : isMuscle 
          ? '💪 Séance full body (circuit training)'
          : sport === 'running'
          ? '🏃 Sortie running 45 min'
          : '🏊 Natation 30 min ou vélo 45 min',
        category: 'sport',
        icon: 'Dumbbell',
        timeSlot: '18:30',
      },
      {
        label: '📓 Journal alimentaire (photo ou notes dans l\'app)',
        category: 'wellness',
        icon: 'Calendar',
      },
    ],
    5: [ // Vendredi
      {
        label: '🥬 Ajouter des fibres (légumes verts à chaque repas : brocoli, épinards, haricots)',
        category: 'nutrition',
        icon: 'Salad',
      },
      {
        label: '💊 Suppléments si recommandés (vitamine D, oméga-3, protéines)',
        category: 'nutrition',
        icon: 'Apple',
      },
      {
        label: '🧘 Yoga / stretching doux 20 min',
        category: 'sport',
        icon: 'Heart',
        timeSlot: '07:30',
      },
      {
        label: '⚖️ Check-in : pesée / mesures (1x par semaine max)',
        category: 'wellness',
        icon: 'Target',
      },
    ],
    6: [ // Samedi
      {
        label: '🍕 Repas plaisir contrôlé (max 1 portion, pas de culpabilité)',
        category: 'nutrition',
        icon: 'Utensils',
      },
      {
        label: `💧 Hydratation renforcée (2.5-3L d'eau dans la journée)`,
        category: 'nutrition',
        icon: 'Droplets',
      },
      {
        label: `⚡ Sport intensité modérée ${Math.round(45 * intensity)} min`,
        category: 'sport',
        icon: 'Zap',
        timeSlot: '10:00',
      },
      {
        label: '📵 Temps libre sans écran 1h (lecture, balade, musique)',
        category: 'wellness',
        icon: 'Heart',
      },
    ],
    7: [ // Dimanche
      {
        label: '🥗 Repos digestif (repas légers, soupe, compote sans sucre)',
        category: 'nutrition',
        icon: 'Salad',
      },
      {
        label: '🚶 Repos total ou marche douce 30 min en extérieur',
        category: 'sport',
        icon: 'Footprints',
      },
      {
        label: '📅 Planning semaine suivante (courses, repas, séances)',
        category: 'wellness',
        icon: 'Calendar',
      },
      {
        label: '🏆 Bilan hebdomadaire + objectifs pour la semaine à venir',
        category: 'wellness',
        icon: 'Trophy',
      },
    ],
  };
  
  // Retourner les tâches pour le jour demandé, ou jour 1 par défaut
  return taskMap[day] || taskMap[1];
}

// ============================================
// 5. FONCTION generateAllTasks
// ============================================
export async function generateAllTasks(
  planId: string,
  diagnosticData: { goal: string; sport: string },
  totalWeeks: number
): Promise<Omit<DailyTask, 'id' | 'created_at'>[]> {
  const allTasks: Omit<DailyTask, 'id' | 'created_at'>[] = [];
  
  for (let week = 1; week <= totalWeeks; week++) {
    for (let day = 1; day <= 7; day++) {
      const dayTasks = generateTasksForDay(week, day, diagnosticData);
      
      dayTasks.forEach((task, index) => {
        allTasks.push({
          plan_id: planId,
          week_number: week,
          day_number: day,
          task_id: `w${week}d${day}_${index}`,
          label: task.label,
          category: task.category,
          icon: task.icon,
          time_slot: task.timeSlot || null,
          completed: false,
          completed_at: null,
        });
      });
    }
  }
  
  return allTasks;
}

// ============================================
// 6. FONCTION createPlanFromDiagnostic
// ============================================
export async function createPlanFromDiagnostic(
  diagnosticId: string,
  userId: string
): Promise<UserPlan> {
  try {
    // 1. Récupérer le diagnostic
    const { data: diagnostic, error: diagnosticError } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('id', diagnosticId)
      .eq('user_id', userId)
      .single();
    
    if (diagnosticError) {
      throw new Error(`Erreur lors de la récupération du diagnostic: ${diagnosticError.message}`);
    }
    
    if (!diagnostic) {
      throw new Error('Diagnostic non trouvé');
    }
    
    // 2. Calculer la durée du plan
    const totalWeeks = getPlanDuration(diagnostic.goal);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + totalWeeks * 7);
    
    // 3. Mettre à jour plan_duration dans diagnostics
    const { error: updateError } = await supabase
      .from('diagnostics')
      .update({ plan_duration: totalWeeks })
      .eq('id', diagnosticId);
    
    if (updateError) {
      console.warn('Erreur mise à jour plan_duration:', updateError);
      // On continue car ce n'est pas bloquant
    }
    
    // 4. Insérer le plan
    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .insert({
        diagnostic_id: diagnosticId,
        user_id: userId,
        goal: diagnostic.goal,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_weeks: totalWeeks,
        current_week: 1,
        status: 'active',
      })
      .select()
      .single();
    
    if (planError) {
      throw new Error(`Erreur lors de la création du plan: ${planError.message}`);
    }
    
    // 5. Générer toutes les tâches
    const allTasks = await generateAllTasks(
      plan.id,
      { goal: diagnostic.goal, sport: diagnostic.sport },
      totalWeeks
    );
    
    // 6. Insertion bulk des tâches
    const { error: tasksError } = await supabase
      .from('daily_tasks')
      .insert(allTasks);
    
    if (tasksError) {
      // Si erreur insertion tâches, on supprime le plan créé
      await supabase.from('user_plans').delete().eq('id', plan.id);
      throw new Error(`Erreur lors de la création des tâches: ${tasksError.message}`);
    }
    
    return plan;
  } catch (error) {
    console.error('createPlanFromDiagnostic error:', error);
    throw error;
  }
}

// ============================================
// 7. FONCTION getActivePlan
// ============================================
export async function getActivePlan(userId: string): Promise<{
  plan: UserPlan | null;
  tasks: DailyTask[];
}> {
  try {
    // Récupérer le plan actif le plus récent
    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (planError) {
      if (planError.code === 'PGRST116') {
        // Aucun plan trouvé
        return { plan: null, tasks: [] };
      }
      throw new Error(`Erreur lors de la récupération du plan: ${planError.message}`);
    }
    
    // Récupérer toutes les tâches du plan
    const { data: tasks, error: tasksError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('plan_id', plan.id)
      .order('week_number', { ascending: true })
      .order('day_number', { ascending: true });
    
    if (tasksError) {
      throw new Error(`Erreur lors de la récupération des tâches: ${tasksError.message}`);
    }
    
    return { plan, tasks: tasks || [] };
  } catch (error) {
    console.error('getActivePlan error:', error);
    throw error;
  }
}

// ============================================
// 8. FONCTION toggleTask
// ============================================
export async function toggleTask(
  taskId: string,
  completed: boolean,
  userId: string
): Promise<void> {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('daily_tasks')
      .update({
        completed: completed,
        completed_at: completed ? now : null,
      })
      .eq('id', taskId);
    
    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la tâche: ${error.message}`);
    }
    
    // Note: Le trigger SQL mettra automatiquement à jour progress_history
    // Pas besoin de le faire manuellement
  } catch (error) {
    console.error('toggleTask error:', error);
    throw error;
  }
}

// ============================================
// 9. FONCTION getWeekProgress
// ============================================
export async function getWeekProgress(
  planId: string,
  weekNumber: number
): Promise<{
  progress: number;
  completed: number;
  total: number;
}> {
  try {
    const { data: tasks, error } = await supabase
      .from('daily_tasks')
      .select('completed')
      .eq('plan_id', planId)
      .eq('week_number', weekNumber);
    
    if (error) {
      throw new Error(`Erreur lors du calcul de progression: ${error.message}`);
    }
    
    if (!tasks || tasks.length === 0) {
      return { progress: 0, completed: 0, total: 0 };
    }
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    return { progress, completed, total };
  } catch (error) {
    console.error('getWeekProgress error:', error);
    throw error;
  }
}

// ============================================
// FONCTIONS SUPPLÉMENTAIRES UTILES
// ============================================

// Récupérer la progression globale du plan
export async function getGlobalProgress(planId: string): Promise<{
  progress: number;
  completed: number;
  total: number;
}> {
  try {
    const { data: tasks, error } = await supabase
      .from('daily_tasks')
      .select('completed')
      .eq('plan_id', planId);
    
    if (error) {
      throw new Error(`Erreur lors du calcul de progression globale: ${error.message}`);
    }
    
    if (!tasks || tasks.length === 0) {
      return { progress: 0, completed: 0, total: 0 };
    }
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    return { progress, completed, total };
  } catch (error) {
    console.error('getGlobalProgress error:', error);
    throw error;
  }
}

// Obtenir la semaine actuelle recommandée (basée sur la date de début)
export function getCurrentWeekNumber(plan: UserPlan): number {
  const startDate = new Date(plan.start_date);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), plan.total_weeks);
  return weekNumber;
}

// Vérifier si un plan existe déjà pour un diagnostic
export async function planExistsForDiagnostic(diagnosticId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      .select('id')
      .eq('diagnostic_id', diagnosticId)
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('planExistsForDiagnostic error:', error);
    return false;
  }
}