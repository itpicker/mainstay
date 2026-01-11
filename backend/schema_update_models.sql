-- Add new configuration columns for AI Models
ALTER TABLE public.ai_models 
ADD COLUMN api_key text,
ADD COLUMN base_url text;

-- Comment for checking
COMMENT ON COLUMN public.ai_models.api_key IS 'Encrypted or plain API Key for the provider';
COMMENT ON COLUMN public.ai_models.base_url IS 'Base URL for self-hosted models like Ollama';
