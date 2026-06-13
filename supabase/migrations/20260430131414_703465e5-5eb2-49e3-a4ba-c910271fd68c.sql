CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT,
  baby_age TEXT,
  source TEXT DEFAULT 'landing',
  locale TEXT DEFAULT 'it',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_email_unique UNIQUE (email),
  CONSTRAINT waitlist_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT waitlist_email_length CHECK (char_length(email) <= 254),
  CONSTRAINT waitlist_name_length CHECK (name IS NULL OR char_length(name) <= 120)
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous visitors) can sign up to the waitlist
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No public reads — only service role (admin) can see signups
CREATE INDEX waitlist_created_at_idx ON public.waitlist (created_at DESC);