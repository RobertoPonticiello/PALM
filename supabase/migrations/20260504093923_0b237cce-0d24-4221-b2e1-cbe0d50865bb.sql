
-- Enable pgvector for semantic search
create extension if not exists vector;

-- Knowledge base chunks (medical guidelines, protocols, etc.)
create table public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,            -- e.g. 'SIP-2023-bronchiolitis'
  title text not null,             -- human-readable doc title
  page integer,
  chunk_index integer not null,
  content text not null,
  embedding vector(768),           -- google text-embedding-004 dim
  created_at timestamptz not null default now()
);

create index rag_chunks_source_idx on public.rag_chunks (source);
create index rag_chunks_embedding_idx on public.rag_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 50);

alter table public.rag_chunks enable row level security;

-- Public read (medical guideline content, not PII)
create policy "rag_chunks public read"
  on public.rag_chunks for select
  to anon, authenticated
  using (true);

-- Similarity search function
create or replace function public.search_rag_chunks(
  query_embedding vector(768),
  match_source text default null,
  match_count int default 4,
  min_similarity float default 0.55
)
returns table (
  id uuid,
  source text,
  title text,
  page integer,
  content text,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id, c.source, c.title, c.page, c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.rag_chunks c
  where (match_source is null or c.source = match_source)
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
