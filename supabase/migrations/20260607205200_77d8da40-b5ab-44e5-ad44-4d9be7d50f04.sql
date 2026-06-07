DROP POLICY IF EXISTS "Users can view their own diagnostics" ON public.diagnostics;

CREATE POLICY "Users can view their own diagnostics"
  ON public.diagnostics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DELETE FROM public.diagnostics WHERE user_id IS NULL;