
-- Add voice_enabled column to voice_settings table
ALTER TABLE public.voice_settings 
ADD COLUMN voice_enabled BOOLEAN DEFAULT true;
