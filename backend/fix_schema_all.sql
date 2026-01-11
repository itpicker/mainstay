-- 1. Fix 'agents' table (Add missing columns)
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS goal text;

-- 2. Ensure 'ai_models' table exists
CREATE TABLE IF NOT EXISTS public.ai_models (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  model_id text not null,
  provider text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Add configuration columns to 'ai_models'
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS api_key text;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS base_url text;

-- 4. Enable RLS on ai_models if not already
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON public.ai_models;
CREATE POLICY "Public Access" ON public.ai_models FOR ALL USING (true);

-- 5. Seed default models if table is empty
INSERT INTO public.ai_models (name, model_id, provider)
SELECT 'GPT-4 Turbo', 'gpt-4-turbo-preview', 'OPENAI'
WHERE NOT EXISTS (SELECT 1 FROM public.ai_models);

INSERT INTO public.ai_models (name, model_id, provider)
SELECT 'Claude 3 Opus', 'claude-3-opus-20240229', 'ANTHROPIC'
WHERE NOT EXISTS (SELECT 1 FROM public.ai_models WHERE model_id = 'claude-3-opus-20240229');

INSERT INTO public.ai_models (name, model_id, provider)
SELECT 'Llama 3 Local', 'llama3', 'OLLAMA'
WHERE NOT EXISTS (SELECT 1 FROM public.ai_models WHERE model_id = 'llama3');
