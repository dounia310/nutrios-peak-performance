DROP POLICY IF EXISTS "Anyone can submit a diagnostic" ON public.diagnostics;

CREATE POLICY "Users can insert their own diagnostics"
ON public.diagnostics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);