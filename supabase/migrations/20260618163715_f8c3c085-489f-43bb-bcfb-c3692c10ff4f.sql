CREATE POLICY "submissions_delete_admin"
ON public.open_evaluation_submissions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));