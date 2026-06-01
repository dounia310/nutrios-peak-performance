-- user_plans
CREATE TABLE public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  goal TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_weeks INTEGER NOT NULL,
  current_week INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plans TO authenticated;
GRANT ALL ON public.user_plans TO service_role;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own plans" ON public.user_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own plans" ON public.user_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own plans" ON public.user_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own plans" ON public.user_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- daily_tasks
CREATE TABLE public.daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.user_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  task_id TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  time_slot TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_tasks TO authenticated;
GRANT ALL ON public.daily_tasks TO service_role;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tasks" ON public.daily_tasks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()));
CREATE POLICY "Users insert own tasks" ON public.daily_tasks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()));
CREATE POLICY "Users update own tasks" ON public.daily_tasks FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()));
CREATE POLICY "Users delete own tasks" ON public.daily_tasks FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_plans p WHERE p.id = plan_id AND p.user_id = auth.uid()));

CREATE INDEX idx_daily_tasks_plan ON public.daily_tasks(plan_id, week_number, day_number);

-- progress_history
CREATE TABLE public.progress_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.user_plans(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  progress_percentage NUMERIC NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_history TO authenticated;
GRANT ALL ON public.progress_history TO service_role;
ALTER TABLE public.progress_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own history" ON public.progress_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history" ON public.progress_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own history" ON public.progress_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own history" ON public.progress_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger for user_plans
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON public.user_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();