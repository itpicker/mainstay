-- 1. Drop existing objects to reset schema
DROP FUNCTION IF EXISTS match_chat_messages;
DROP TABLE IF EXISTS chat_messages;

-- 2. Re-create table with CORRECT dimensions (4096 for qwen3-embedding)
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references agents(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  embedding vector(4096), -- UPDATED: 4096 dimensions
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Re-create search function with CORRECT dimensions
create or replace function match_chat_messages (
  query_embedding vector(4096), -- UPDATED: 4096 dimensions
  match_threshold float,
  match_count int,
  filter_agent_id uuid
)
returns table (
  id uuid,
  content text,
  role text,
  similarity float
)
language plpgsql
as $$
begin
  return query(
    select
      chat_messages.id,
      chat_messages.content,
      chat_messages.role,
      1 - (chat_messages.embedding <=> query_embedding) as similarity
    from chat_messages
    where 1 - (chat_messages.embedding <=> query_embedding) > match_threshold
    and chat_messages.agent_id = filter_agent_id
    order by chat_messages.embedding <=> query_embedding
    limit match_count
  );
end;
$$;

-- 4. Optional: Index (Uncomment if needed later, requires data to be effective)
-- create index on chat_messages using ivfflat (embedding vector_cosine_ops) with (lists = 100);
