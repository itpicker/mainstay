-- Add DeepSeek R1 8B Model (Ollama)
INSERT INTO public.ai_models (name, model_id, provider, base_url, is_active)
VALUES 
(
    'DeepSeek R1 (8B)',       -- Display Name
    'deepseek-r1:8b',         -- Model ID (as used in Ollama run command)
    'OLLAMA',                 -- Provider
    'http://localhost:11434', -- Default Ollama Base URL
    true
);
