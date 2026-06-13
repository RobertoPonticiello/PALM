
-- Drop semantic-search artifacts
drop function if exists public.search_rag_chunks(vector, text, int, float);
drop index if exists public.rag_chunks_embedding_idx;
alter table public.rag_chunks drop column if exists embedding;

-- Add a generated tsvector column (Italian + English mix; the SIP doc has both)
alter table public.rag_chunks
  add column if not exists ts tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(content, '')), 'A')
  ) stored;

create index if not exists rag_chunks_ts_idx
  on public.rag_chunks using gin (ts);

-- Keyword search function with ts_rank
create or replace function public.search_rag_chunks(
  query_text text,
  match_source text default null,
  match_count int default 4
)
returns table (
  id uuid,
  source text,
  title text,
  page integer,
  content text,
  rank real
)
language sql
stable
security invoker
set search_path = public
as $$
  with q as (
    select plainto_tsquery('simple', coalesce(query_text, '')) as tsq
  )
  select
    c.id, c.source, c.title, c.page, c.content,
    ts_rank(c.ts, q.tsq) as rank
  from public.rag_chunks c, q
  where (match_source is null or c.source = match_source)
    and c.ts @@ q.tsq
  order by rank desc
  limit match_count;
$$;
