-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text default 'PLANNING', -- 'PLANNING', 'EXECUTION', 'COMPLETED'
  owner_id uuid references public.profiles(id),
  workflow_stage text default 'REQUIREMENTS',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AGENTS
create table public.agents (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  role text not null, -- 'MANAGER', 'DEVELOPER', 'RESEARCHER'
  status text default 'IDLE', -- 'IDLE', 'WORKING', 'PAUSED'
  capabilities text[], -- Array of strings
  autonomy_level integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASKS
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'TODO', -- 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'
  assignee_id uuid references public.agents(id), -- Can be null if unassigned
  priority text default 'MEDIUM',
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WORKFLOW LOGS / CHAT HISTORY
create table public.agent_logs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  agent_id uuid references public.agents(id),
  log_type text not null, -- 'THOUGHT', 'ACTION', 'MESSAGE'
  content text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRIGGER: Handle New User (Auto-create profile)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS POLICIES (Simple start: Public read/write for dev, restrict later)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.agents enable row level security;
alter table public.tasks enable row level security;
alter table public.agent_logs enable row level security;

create policy "Public Access" on public.profiles for all using (true);
create policy "Public Access" on public.projects for all using (true);
create policy "Public Access" on public.agents for all using (true);
create policy "Public Access" on public.tasks for all using (true);
create policy "Public Access" on public.agent_logs for all using (true);
