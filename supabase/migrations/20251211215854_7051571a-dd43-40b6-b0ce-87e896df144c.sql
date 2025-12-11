-- Add column to track which partial submissions have been included in digest emails
ALTER TABLE public.submissions ADD COLUMN digest_sent_at timestamp with time zone DEFAULT NULL;