CREATE TABLE public.diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  age INT NOT NULL,
  weight NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  gender TEXT NOT NULL,
  goal TEXT NOT NULL,
  sport TEXT NOT NULL,
  health_notes TEXT,
  bmi NUMERIC,
  bmr NUMERIC,
  plan_duration INT
);

ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a diagnostic"
  ON public.diagnostics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own diagnostics"
  ON public.diagnostics FOR SELECT
  USING (auth.uid() = user_id);