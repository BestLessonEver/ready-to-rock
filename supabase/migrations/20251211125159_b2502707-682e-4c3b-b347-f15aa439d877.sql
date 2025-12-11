-- Add columns to track partial submissions
ALTER TABLE public.submissions 
ADD COLUMN status text NOT NULL DEFAULT 'complete',
ADD COLUMN last_step integer;

-- Add index for querying partial leads
CREATE INDEX idx_submissions_status ON public.submissions(status);

-- Add comment for clarity
COMMENT ON COLUMN public.submissions.status IS 'Either "partial" or "complete"';
COMMENT ON COLUMN public.submissions.last_step IS 'Last step the user reached in the quiz';