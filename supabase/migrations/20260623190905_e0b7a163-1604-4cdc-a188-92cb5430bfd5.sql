CREATE POLICY "Admins insert permission requests"
ON public.exam_permission_requests
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));