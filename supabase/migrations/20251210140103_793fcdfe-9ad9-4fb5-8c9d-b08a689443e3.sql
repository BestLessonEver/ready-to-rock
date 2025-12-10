-- Create submissions table to persist quiz results
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  child_name TEXT NOT NULL,
  phone TEXT,
  city_zip TEXT,
  score INTEGER NOT NULL,
  band TEXT NOT NULL,
  band_label TEXT NOT NULL,
  band_description TEXT NOT NULL,
  primary_instrument TEXT NOT NULL,
  secondary_instruments TEXT[] DEFAULT '{}',
  action_plan TEXT[] DEFAULT '{}',
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone with the link can view their results)
CREATE POLICY "Anyone can view submissions by ID"
ON public.submissions
FOR SELECT
USING (true);

-- Allow inserts from anyone (quiz is public)
CREATE POLICY "Anyone can insert submissions"
ON public.submissions
FOR INSERT
WITH CHECK (true);