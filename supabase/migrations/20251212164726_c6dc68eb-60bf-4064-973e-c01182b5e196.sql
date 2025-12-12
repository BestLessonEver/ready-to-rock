-- Remove the public SELECT policy that exposes all data
DROP POLICY IF EXISTS "Anyone can view submissions by ID" ON public.submissions;

-- Create a restrictive policy that denies all direct SELECT access
-- Data will only be accessible via edge functions using service role key
CREATE POLICY "No direct select access"
ON public.submissions
FOR SELECT
USING (false);