
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
security invoker
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
