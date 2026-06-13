
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
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  cleaned text;
  or_query text;
begin
  cleaned := regexp_replace(coalesce(query_text, ''), '[^[:alnum:]\s]', ' ', 'g');
  -- Build an OR-joined tsquery from individual words (>=3 chars, not stopwordy)
  select string_agg(w, ' | ')
    into or_query
  from (
    select distinct lower(w) as w
    from regexp_split_to_table(cleaned, '\s+') as w
    where length(w) >= 3
  ) t;

  if or_query is null or or_query = '' then
    return;
  end if;

  return query
  select
    c.id, c.source, c.title, c.page, c.content,
    ts_rank(c.ts, to_tsquery('simple', or_query)) as rank
  from public.rag_chunks c
  where (match_source is null or c.source = match_source)
    and c.ts @@ to_tsquery('simple', or_query)
  order by rank desc
  limit match_count;
end;
$$;
