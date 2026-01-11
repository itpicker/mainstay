-- AI MODELS
create table public.ai_models (
  id uuid default uuid_generate_v4() primary key,
  name text not null,          -- Display Name (e.g. "GPT-4 Turbo")
  model_id text not null,      -- API Identifier (e.g. "gpt-4-0125-preview")
  provider text not null,      -- "OPENAI", "ANTHROPIC", "OLLAMA"
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Default Models
insert into public.ai_models (name, model_id, provider) values 
('GPT-4 Turbo', 'gpt-4-turbo-preview', 'OPENAI'),
('Claude 3 Opus', 'claude-3-opus-20240229', 'ANTHROPIC'),
('Llama 3 Local', 'llama3', 'OLLAMA');

-- RLS
alter table public.ai_models enable row level security;
create policy "Public Access" on public.ai_models for all using (true);
