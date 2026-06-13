-- Table for curated educational videos surfaced by Palm chat
CREATE TABLE public.rag_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL,
  youtube_id text NOT NULL,
  title text NOT NULL,
  description text,
  triggers text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rag_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rag_videos public read"
ON public.rag_videos
FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX idx_rag_videos_triggers ON public.rag_videos USING GIN (triggers);
