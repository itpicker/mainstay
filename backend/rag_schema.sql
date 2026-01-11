-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create chat_messages table
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references agents(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  embedding vector(4096), -- Dimensions for qwen3-embedding
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for faster similarity search (IVFFlat)
-- Note: Create this only if you have some data, but defining it tentatively is fine.
-- create index on chat_messages using ivfflat (embedding vector_cosine_ops)
-- with (lists = 100);

-- Create a function to search for similar messages
-- USAGE: supabase.rpc('match_chat_messages', { 'query_embedding': [...], 'match_threshold': 0.7, 'match_count': 5, 'filter_agent_id': '...' })
create or replace function match_chat_messages (
  query_embedding vector(768),
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
